import type { PoseLandmark, SquatMetrics } from "./types";

export const LANDMARK_INDEX = {
  leftShoulder: 11, rightShoulder: 12,
  leftHip: 23, rightHip: 24,
  leftKnee: 25, rightKnee: 26,
  leftAnkle: 27, rightAnkle: 28,
} as const;

const MAX_SIDE_ANGLE_DIFFERENCE_DEGREES = 25;
const MIN_CONFIDENCE_ADVANTAGE = 0.15;

function confidenceOf(landmark: PoseLandmark): number {
  const values = [landmark.visibility, landmark.presence].filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );
  return values.length ? Math.min(...values) : 1;
}

export function isReliableLandmark(
  landmark: PoseLandmark | undefined,
  threshold = 0.35,
): landmark is PoseLandmark {
  return Boolean(
    landmark &&
      Number.isFinite(landmark.x) &&
      Number.isFinite(landmark.y) &&
      Number.isFinite(threshold) &&
      confidenceOf(landmark) >= threshold,
  );
}

export function calculateJointAngleDegrees(
  a: PoseLandmark | undefined,
  b: PoseLandmark | undefined,
  c: PoseLandmark | undefined,
  width: number,
  height: number,
  confidenceThreshold = 0.35,
): number | null {
  if (
    !Number.isFinite(width) || !Number.isFinite(height) ||
    width <= 0 || height <= 0 ||
    !isReliableLandmark(a, confidenceThreshold) ||
    !isReliableLandmark(b, confidenceThreshold) ||
    !isReliableLandmark(c, confidenceThreshold)
  ) return null;

  // Normalized image x/y use different scales; convert to pixels before angle math.
  const ax = a.x * width, ay = a.y * height;
  const bx = b.x * width, by = b.y * height;
  const cx = c.x * width, cy = c.y * height;
  const abx = ax - bx, aby = ay - by;
  const cbx = cx - bx, cby = cy - by;
  const abLength = Math.hypot(abx, aby);
  const cbLength = Math.hypot(cbx, cby);
  if (
    !Number.isFinite(abLength) || !Number.isFinite(cbLength) ||
    abLength < 1e-6 || cbLength < 1e-6
  ) return null;

  const cosine = (abx * cbx + aby * cby) / (abLength * cbLength);
  const angle = Math.acos(Math.max(-1, Math.min(1, cosine))) * 180 / Math.PI;
  return Number.isFinite(angle) ? angle : null;
}

function getLandmark(landmarks: readonly PoseLandmark[], index: number) {
  return landmarks[index];
}

function midpoint(
  a: PoseLandmark | undefined,
  b: PoseLandmark | undefined,
  threshold: number,
): { x: number; y: number } | null {
  if (!isReliableLandmark(a, threshold) || !isReliableLandmark(b, threshold)) return null;
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function calculateTrunkLeanDegrees(
  landmarks: readonly PoseLandmark[],
  width: number,
  height: number,
  threshold: number,
): number | null {
  const shoulders = midpoint(
    getLandmark(landmarks, LANDMARK_INDEX.leftShoulder),
    getLandmark(landmarks, LANDMARK_INDEX.rightShoulder),
    threshold,
  );
  const hips = midpoint(
    getLandmark(landmarks, LANDMARK_INDEX.leftHip),
    getLandmark(landmarks, LANDMARK_INDEX.rightHip),
    threshold,
  );
  if (!shoulders || !hips) return null;
  // Scale normalized coordinates consistently before computing an image-plane angle.
  const horizontal = (shoulders.x - hips.x) * width;
  const vertical = (shoulders.y - hips.y) * height;
  if (!Number.isFinite(horizontal) || !Number.isFinite(vertical) ||
      Math.hypot(horizontal, vertical) < 1e-6) return null;

  // Image-plane estimate relative to vertical, not a 3D biomechanical measurement.
  const angle = Math.atan2(Math.abs(horizontal), Math.abs(vertical)) * 180 / Math.PI;
  return Number.isFinite(angle) ? angle : null;
}

interface SideKneeAngle {
  angle: number | null;
  confidence: number | null;
}

function calculateSideKneeAngle(
  landmarks: readonly PoseLandmark[],
  hipIndex: number,
  kneeIndex: number,
  ankleIndex: number,
  width: number,
  height: number,
  confidenceThreshold: number,
): SideKneeAngle {
  const hip = getLandmark(landmarks, hipIndex);
  const knee = getLandmark(landmarks, kneeIndex);
  const ankle = getLandmark(landmarks, ankleIndex);
  const angle = calculateJointAngleDegrees(
    hip, knee, ankle, width, height, confidenceThreshold,
  );
  if (
    angle === null ||
    !isReliableLandmark(hip, confidenceThreshold) ||
    !isReliableLandmark(knee, confidenceThreshold) ||
    !isReliableLandmark(ankle, confidenceThreshold)
  ) {
    return { angle: null, confidence: null };
  }

  return {
    angle,
    confidence: Math.min(confidenceOf(hip), confidenceOf(knee), confidenceOf(ankle)),
  };
}

function selectKneeAngle(
  left: SideKneeAngle,
  right: SideKneeAngle,
): number | null {
  if (left.angle === null) return right.angle;
  if (right.angle === null) return left.angle;
  if (left.confidence === null || right.confidence === null) return null;

  const confidenceDifference = Math.abs(left.confidence - right.confidence);
  if (Math.abs(left.angle - right.angle) > MAX_SIDE_ANGLE_DIFFERENCE_DEGREES) {
    // Prefer one side only when its hip/knee/ankle landmarks are meaningfully clearer.
    // If confidence is similar, disagreement is ambiguous; do not manufacture an average.
    if (confidenceDifference < MIN_CONFIDENCE_ADVANTAGE) return null;
    return left.confidence > right.confidence ? left.angle : right.angle;
  }

  // When the two estimates agree, prefer a confidence-weighted average.
  const totalWeight = left.confidence + right.confidence;
  if (totalWeight <= 0) return null;
  return (
    left.angle * left.confidence + right.angle * right.confidence
  ) / totalWeight;
}

export function calculateSquatMetrics(
  landmarks: readonly PoseLandmark[],
  width: number,
  height: number,
  confidenceThreshold = 0.35,
): SquatMetrics {
  if (
    !Number.isFinite(width) || !Number.isFinite(height) ||
    width <= 0 || height <= 0
  ) {
    return {
      kneeAngleDegrees: null,
      leftKneeAngleDegrees: null,
      rightKneeAngleDegrees: null,
      trunkLeanDegrees: null,
    };
  }

  const left = calculateSideKneeAngle(
    landmarks, LANDMARK_INDEX.leftHip, LANDMARK_INDEX.leftKnee,
    LANDMARK_INDEX.leftAnkle, width, height, confidenceThreshold,
  );
  const right = calculateSideKneeAngle(
    landmarks, LANDMARK_INDEX.rightHip, LANDMARK_INDEX.rightKnee,
    LANDMARK_INDEX.rightAnkle, width, height, confidenceThreshold,
  );

  return {
    kneeAngleDegrees: selectKneeAngle(left, right),
    leftKneeAngleDegrees: left.angle,
    rightKneeAngleDegrees: right.angle,
    trunkLeanDegrees: calculateTrunkLeanDegrees(landmarks, width, height, confidenceThreshold),
  };
}
