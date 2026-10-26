import type { PoseLandmark, SquatMetrics } from "@/features/squat/types";

export const LANDMARK_INDEX = {
  leftShoulder: 11, rightShoulder: 12,
  leftHip: 23, rightHip: 24,
  leftKnee: 25, rightKnee: 26,
  leftAnkle: 27, rightAnkle: 28,
} as const;

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
  if (abLength < 1e-6 || cbLength < 1e-6) return null;

  const cosine = (abx * cbx + aby * cby) / (abLength * cbLength);
  return Math.acos(Math.max(-1, Math.min(1, cosine))) * 180 / Math.PI;
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
  const horizontal = shoulders.x - hips.x;
  const vertical = shoulders.y - hips.y;
  if (Math.hypot(horizontal, vertical) < 1e-6) return null;

  // Image-plane estimate relative to vertical, not a 3D biomechanical measurement.
  return Math.atan2(Math.abs(horizontal), Math.abs(vertical)) * 180 / Math.PI;
}

export function calculateSquatMetrics(
  landmarks: readonly PoseLandmark[],
  width: number,
  height: number,
  confidenceThreshold = 0.35,
): SquatMetrics {
  const leftKneeAngleDegrees = calculateJointAngleDegrees(
    getLandmark(landmarks, LANDMARK_INDEX.leftHip),
    getLandmark(landmarks, LANDMARK_INDEX.leftKnee),
    getLandmark(landmarks, LANDMARK_INDEX.leftAnkle),
    width, height, confidenceThreshold,
  );
  const rightKneeAngleDegrees = calculateJointAngleDegrees(
    getLandmark(landmarks, LANDMARK_INDEX.rightHip),
    getLandmark(landmarks, LANDMARK_INDEX.rightKnee),
    getLandmark(landmarks, LANDMARK_INDEX.rightAnkle),
    width, height, confidenceThreshold,
  );
  const available = [leftKneeAngleDegrees, rightKneeAngleDegrees].filter(
    (angle): angle is number => angle !== null,
  );
  return {
    kneeAngleDegrees: available.length
      ? available.reduce((sum, angle) => sum + angle, 0) / available.length
      : null,
    leftKneeAngleDegrees,
    rightKneeAngleDegrees,
    trunkLeanDegrees: calculateTrunkLeanDegrees(landmarks, confidenceThreshold),
  };
}
