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
}

const DEFAULT_OPTIONS: Required<SquatAnalyzerOptions> = {
  standingAngleDegrees: 160,
  movementStartAngleDegrees: 155,
  depthTargetDegrees: 110,
  reversalDeltaDegrees: 8,
  smoothingAlpha: 0.4,
  confidenceThreshold: 0.35,
  lostPoseResetMs: 900,
};
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export class SquatAnalyzer {
  private readonly options: Required<SquatAnalyzerOptions>;
  private phase: SquatPhase = "awaiting_standing";
  private repCount = 0;
  private filteredKneeAngle: number | null = null;
  private currentRepStartedAt: number | null = null;
  private currentRepMinimumAngle: number | null = null;
  private lastValidFrameAt: number | null = null;
  private lastRep: CompletedRep | null = null;
  private latestKneeAngle: number | null = null;
  private latestTrunkLean: number | null = null;
  private poseQuality: PoseQuality = "insufficient";

  constructor(options: SquatAnalyzerOptions = {}) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
      depthTargetDegrees: clamp(options.depthTargetDegrees ?? 110, 90, 130),
      smoothingAlpha: clamp(options.smoothingAlpha ?? 0.4, 0.01, 1),
    };
  }

  reset(): SquatAnalysisSnapshot {
    this.phase = "awaiting_standing";
    this.repCount = 0;
    this.filteredKneeAngle = null;
    this.currentRepStartedAt = null;
    this.currentRepMinimumAngle = null;
    this.lastValidFrameAt = null;
    this.lastRep = null;
    this.latestKneeAngle = null;
    this.latestTrunkLean = null;
    this.poseQuality = "insufficient";
    return this.snapshot(null);
  }

  setDepthTargetDegrees(value: number): SquatAnalysisSnapshot {
    this.options.depthTargetDegrees = clamp(Math.round(value), 90, 130);
    return this.snapshot(null);
  }

  analyzeFrame(frame: SquatFrame): SquatAnalysisSnapshot {
    const metrics = calculateSquatMetrics(
      frame.landmarks, frame.width, frame.height, this.options.confidenceThreshold,
    );
    if (metrics.kneeAngleDegrees === null || !Number.isFinite(frame.timestamp)) {
      if (
        this.lastValidFrameAt !== null &&
        frame.timestamp - this.lastValidFrameAt >= this.options.lostPoseResetMs &&
        this.phase !== "standing" && this.phase !== "awaiting_standing"
      ) {
        this.resetTransientRep();
        this.phase = "awaiting_standing";
        this.filteredKneeAngle = null;
      }
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
    this.latestKneeAngle = this.filteredKneeAngle;
    this.updateStateMachine(this.filteredKneeAngle, frame.timestamp);
    return this.snapshot(frame.timestamp);
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
        }
        return;
      case "descending":
        this.updateRepMinimum(angle);
        if (angle <= this.options.depthTargetDegrees) {
          this.phase = "bottom";
        } else if (
          this.currentRepMinimumAngle !== null &&
          angle >= this.currentRepMinimumAngle + this.options.reversalDeltaDegrees
        ) {
          // Count a complete down/up motion even when it did not reach the depth threshold.
          this.phase = "ascending";
        }
        return;
      case "bottom":
        this.updateRepMinimum(angle);
        if (
          this.currentRepMinimumAngle !== null &&
          angle >= this.currentRepMinimumAngle + this.options.reversalDeltaDegrees
        ) this.phase = "ascending";
        return;
      case "ascending":
        if (this.currentRepMinimumAngle !== null && angle < this.currentRepMinimumAngle - 3) {
          this.currentRepMinimumAngle = angle;
          if (angle <= this.options.depthTargetDegrees) this.phase = "bottom";
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
    if (minimumAngle === null || startedAt === null) {
      this.resetTransientRep();
      return;
    }
    this.repCount += 1;
    this.lastRep = {
      number: this.repCount,
      minimumKneeAngleDegrees: minimumAngle,
      depthTargetMet: minimumAngle <= this.options.depthTargetDegrees,
      durationMs: Math.max(0, timestamp - startedAt),
      completedAt: timestamp,
    };
    this.resetTransientRep();
  }

  private resetTransientRep(): void {
    this.currentRepStartedAt = null;
    this.currentRepMinimumAngle = null;
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
          instruction = `Lower under control. The current knee-angle target is ≤ ${this.options.depthTargetDegrees}°.`;
          break;
        case "bottom":
          instruction = "The configured depth target is reached. Begin standing up under control.";
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
