export interface PoseLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
  presence?: number;
}

export type SquatPhase = "awaiting_standing" | "standing" | "descending" | "bottom" | "ascending";
export type PoseQuality = "ready" | "insufficient";

export interface SquatFrame {
  landmarks: readonly PoseLandmark[];
  width: number;
  height: number;
  timestamp: number;
}

export interface SquatMetrics {
  kneeAngleDegrees: number | null;
  leftKneeAngleDegrees: number | null;
  rightKneeAngleDegrees: number | null;
  trunkLeanDegrees: number | null;
}

export interface CompletedRep {
  number: number;
  minimumKneeAngleDegrees: number;
  depthTargetMet: boolean;
  durationMs: number;
  completedAt: number;
}

export interface SquatAnalysisSnapshot {
  phase: SquatPhase;
  poseQuality: PoseQuality;
  repCount: number;
  kneeAngleDegrees: number | null;
  trunkLeanDegrees: number | null;
  deepestKneeAngleDegrees: number | null;
  depthTargetDegrees: number;
  currentRepDurationMs: number | null;
  lastRep: CompletedRep | null;
  instruction: string;
}
