import { calculateSquatMetrics } from "./geometry";
import type { SquatAnalysisSnapshot, SquatFrame, SquatPhase, CompletedRep, PoseQuality } from "./types";

export interface SquatAnalyzerOptions {
  standingAngleDegrees?: number;
  movementStartAngleDegrees?: number;
  depthTargetDegrees?: number;
  reversalDeltaDegrees?: number;
  smoothingAlpha?: number;
  confidenceThreshold?: number;
  lostPoseResetMs?: number;
  depthConfirmationFrames?: number;
}

const DEFAULT_OPTIONS: Required<SquatAnalyzerOptions> = {
  standingAngleDegrees: 160,
  movementStartAngleDegrees: 155,
  depthTargetDegrees: 110,
  reversalDeltaDegrees: 8,
  smoothingAlpha: 0.4,
  confidenceThreshold: 0.35,
  lostPoseResetMs: 900,
  depthConfirmationFrames: 3,
};
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const clampFinite = (value: number, min: number, max: number, fallback: number) =>
  Number.isFinite(value) ? clamp(value, min, max) : fallback;

export class SquatAnalyzer {
  private readonly options: Required<SquatAnalyzerOptions>;
  private phase: SquatPhase = "awaiting_standing";
  private repCount = 0;
  private filteredKneeAngle: number | null = null;
  private currentRepStartedAt: number | null = null;
  private currentRepMinimumAngle: number | null = null;
  private currentRepDepthTargetDegrees: number | null = null;
  private depthTargetConsecutiveFrames = 0;
  private currentRepDepthTargetConfirmed = false;
  private lastValidFrameAt: number | null = null;
  private lastRep: CompletedRep | null = null;
  private latestKneeAngle: number | null = null;
  private latestTrunkLean: number | null = null;
  private poseQuality: PoseQuality = "insufficient";

  constructor(options: SquatAnalyzerOptions = {}) {
    this.options = {
      standingAngleDegrees: clampFinite(
        options.standingAngleDegrees ?? DEFAULT_OPTIONS.standingAngleDegrees,
        120, 180, DEFAULT_OPTIONS.standingAngleDegrees,
      ),
      movementStartAngleDegrees: clampFinite(
        options.movementStartAngleDegrees ?? DEFAULT_OPTIONS.movementStartAngleDegrees,
        90, 175, DEFAULT_OPTIONS.movementStartAngleDegrees,
      ),
      depthTargetDegrees: clampFinite(
        options.depthTargetDegrees ?? DEFAULT_OPTIONS.depthTargetDegrees,
        90, 130, DEFAULT_OPTIONS.depthTargetDegrees,
      ),
      reversalDeltaDegrees: clampFinite(
        options.reversalDeltaDegrees ?? DEFAULT_OPTIONS.reversalDeltaDegrees,
        1, 30, DEFAULT_OPTIONS.reversalDeltaDegrees,
      ),
      smoothingAlpha: clampFinite(
        options.smoothingAlpha ?? DEFAULT_OPTIONS.smoothingAlpha,
        0.01, 1, DEFAULT_OPTIONS.smoothingAlpha,
      ),
      confidenceThreshold: clampFinite(
        options.confidenceThreshold ?? DEFAULT_OPTIONS.confidenceThreshold,
        0.05, 1, DEFAULT_OPTIONS.confidenceThreshold,
      ),
      lostPoseResetMs: clampFinite(
        options.lostPoseResetMs ?? DEFAULT_OPTIONS.lostPoseResetMs,
        100, 5000, DEFAULT_OPTIONS.lostPoseResetMs,
      ),
      depthConfirmationFrames: Math.round(clampFinite(
        options.depthConfirmationFrames ?? DEFAULT_OPTIONS.depthConfirmationFrames,
        1, 6, DEFAULT_OPTIONS.depthConfirmationFrames,
      )),
    };
  }

  reset(): SquatAnalysisSnapshot {
    this.phase = "awaiting_standing";
    this.repCount = 0;
    this.filteredKneeAngle = null;
    this.currentRepStartedAt = null;
    this.currentRepMinimumAngle = null;
    this.currentRepDepthTargetDegrees = null;
    this.depthTargetConsecutiveFrames = 0;
    this.currentRepDepthTargetConfirmed = false;
    this.lastValidFrameAt = null;
    this.lastRep = null;
    this.latestKneeAngle = null;
    this.latestTrunkLean = null;
    this.poseQuality = "insufficient";
    return this.snapshot(null);
  }

  setDepthTargetDegrees(value: number): SquatAnalysisSnapshot {
    if (Number.isFinite(value)) {
      this.options.depthTargetDegrees = clamp(Math.round(value), 90, 130);
    }
    return this.snapshot(null);
  }

  analyzeFrame(frame: SquatFrame): SquatAnalysisSnapshot {
    if (!Number.isFinite(frame.timestamp)) {
      this.poseQuality = "insufficient";
      this.latestKneeAngle = null;
      this.latestTrunkLean = null;
      return this.snapshot(null);
    }

    const metrics = calculateSquatMetrics(
      frame.landmarks, frame.width, frame.height, this.options.confidenceThreshold,
    );
    if (metrics.kneeAngleDegrees === null) {
      if (
        this.lastValidFrameAt !== null &&
        frame.timestamp - this.lastValidFrameAt >= this.options.lostPoseResetMs &&
        this.phase !== "awaiting_standing"
      ) {
        // Do not resume halfway through a rep after losing the pose for too long.
        this.resetTransientRep();
        this.phase = "awaiting_standing";
        this.filteredKneeAngle = null;
        this.lastValidFrameAt = null;
      }
      this.poseQuality = "insufficient";
      this.latestKneeAngle = null;
      this.latestTrunkLean = null;
      return this.snapshot(frame.timestamp);
    }

    // Ignore out-of-order timestamps rather than letting them corrupt rep duration/state.
    if (this.lastValidFrameAt !== null && frame.timestamp < this.lastValidFrameAt) {
      this.poseQuality = "insufficient";
      this.latestKneeAngle = null;
      this.latestTrunkLean = null;
      return this.snapshot(frame.timestamp);
    }

    this.poseQuality = "ready";
    this.lastValidFrameAt = frame.timestamp;
    this.latestTrunkLean = metrics.trunkLeanDegrees;
    this.filteredKneeAngle = this.filteredKneeAngle === null
      ? metrics.kneeAngleDegrees
      : this.filteredKneeAngle + this.options.smoothingAlpha *
        (metrics.kneeAngleDegrees - this.filteredKneeAngle);
    this.latestKneeAngle = Number.isFinite(this.filteredKneeAngle)
      ? this.filteredKneeAngle
      : null;

    if (this.latestKneeAngle === null) {
      this.filteredKneeAngle = null;
      this.poseQuality = "insufficient";
      return this.snapshot(frame.timestamp);
    }

    this.updateStateMachine(this.latestKneeAngle, frame.timestamp);
    return this.snapshot(frame.timestamp);
  }

  private getCurrentRepDepthTarget(): number {
    return this.currentRepDepthTargetDegrees ?? this.options.depthTargetDegrees;
  }

  private updateDepthTargetConfirmation(angle: number): void {
    if (angle <= this.getCurrentRepDepthTarget()) {
      this.depthTargetConsecutiveFrames += 1;
      if (this.depthTargetConsecutiveFrames >= this.options.depthConfirmationFrames) {
        this.currentRepDepthTargetConfirmed = true;
      }
    } else {
      this.depthTargetConsecutiveFrames = 0;
    }
  }

  private updateStateMachine(angle: number, timestamp: number): void {
    switch (this.phase) {
      case "awaiting_standing":
        if (angle >= this.options.standingAngleDegrees) this.phase = "standing";
        return;
      case "standing":
        if (angle <= this.options.movementStartAngleDegrees) {
          this.phase = "descending";
          this.currentRepStartedAt = timestamp;
          this.currentRepMinimumAngle = angle;
          this.currentRepDepthTargetDegrees = this.options.depthTargetDegrees;
          this.depthTargetConsecutiveFrames = 0;
          this.currentRepDepthTargetConfirmed = false;
        }
        return;
      case "descending":
        this.updateRepMinimum(angle);
        this.updateDepthTargetConfirmation(angle);
        if (this.currentRepDepthTargetConfirmed) {
          this.phase = "bottom";
        } else if (
          this.currentRepMinimumAngle !== null &&
          angle >= this.currentRepMinimumAngle + this.options.reversalDeltaDegrees
        ) {
          // A brief noisy dip is not enough to confirm the selected depth target.
          this.phase = "ascending";
        }
        return;
      case "bottom":
        this.updateRepMinimum(angle);
        this.updateDepthTargetConfirmation(angle);
        if (
          this.currentRepMinimumAngle !== null &&
          angle >= this.currentRepMinimumAngle + this.options.reversalDeltaDegrees
        ) this.phase = "ascending";
        return;
      case "ascending":
        this.updateRepMinimum(angle);
        this.updateDepthTargetConfirmation(angle);
        if (this.currentRepDepthTargetConfirmed && angle <= this.getCurrentRepDepthTarget()) {
          this.phase = "bottom";
          return;
        }
        if (angle >= this.options.standingAngleDegrees) {
          this.completeRep(timestamp);
          this.phase = "standing";
        }
        return;
    }
  }

  private updateRepMinimum(angle: number): void {
    if (this.currentRepMinimumAngle === null || angle < this.currentRepMinimumAngle) {
      this.currentRepMinimumAngle = angle;
    }
  }

  private completeRep(timestamp: number): void {
    const minimumAngle = this.currentRepMinimumAngle;
    const startedAt = this.currentRepStartedAt;
    const repDepthTarget = this.currentRepDepthTargetDegrees;
    if (minimumAngle === null || startedAt === null || repDepthTarget === null) {
      this.resetTransientRep();
      return;
    }
    this.repCount += 1;
    this.lastRep = {
      number: this.repCount,
      minimumKneeAngleDegrees: minimumAngle,
      depthTargetDegrees: repDepthTarget,
      depthTargetMet: this.currentRepDepthTargetConfirmed,
      durationMs: Math.max(0, timestamp - startedAt),
      completedAt: timestamp,
    };
    this.resetTransientRep();
  }

  private resetTransientRep(): void {
    this.currentRepStartedAt = null;
    this.currentRepMinimumAngle = null;
    this.currentRepDepthTargetDegrees = null;
    this.depthTargetConsecutiveFrames = 0;
    this.currentRepDepthTargetConfirmed = false;
  }

  private snapshot(timestamp: number | null): SquatAnalysisSnapshot {
    let instruction: string;
    if (this.poseQuality === "insufficient") {
      instruction = "Move back so your hip, knee and ankle are clearly visible. A side view works best for this angle-based preview.";
    } else {
      switch (this.phase) {
        case "awaiting_standing":
          instruction = "Stand tall and keep your full body in frame to find the starting position.";
          break;
        case "standing":
          instruction = "Ready. Begin your squat with a controlled descent.";
          break;
        case "descending":
          instruction = `Lower under control. The current rep uses a target of ≤ ${this.getCurrentRepDepthTarget()}°.`;
          break;
        case "bottom":
          instruction = "The configured depth target has been confirmed across multiple frames. Begin standing up under control.";
          break;
        case "ascending":
          instruction = "Keep standing until your knees return near straight to complete the rep.";
          break;
      }
    }
    const active = this.phase === "descending" || this.phase === "bottom" || this.phase === "ascending";
    return {
      phase: this.phase,
      poseQuality: this.poseQuality,
      repCount: this.repCount,
      kneeAngleDegrees: this.latestKneeAngle,
      trunkLeanDegrees: this.latestTrunkLean,
      deepestKneeAngleDegrees: this.currentRepMinimumAngle ?? this.lastRep?.minimumKneeAngleDegrees ?? null,
      depthTargetDegrees: this.options.depthTargetDegrees,
      currentRepDurationMs: active && this.currentRepStartedAt !== null && timestamp !== null
        ? Math.max(0, timestamp - this.currentRepStartedAt) : null,
      lastRep: this.lastRep,
      instruction,
    };
  }
}
