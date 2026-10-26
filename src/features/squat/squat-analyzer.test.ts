import { describe, expect, it } from "vitest";
import { calculateJointAngleDegrees, calculateSquatMetrics } from "./geometry";
import { SquatAnalyzer } from "./squat-analyzer";
import type { PoseLandmark, SquatFrame } from "./types";

function landmark(x: number, y: number, visibility = 1): PoseLandmark {
  return { x, y, visibility, presence: visibility };
}

function ankleForAngle(knee: PoseLandmark, angleDegrees: number, visibility = 1): PoseLandmark {
  const directionDegrees = -90 + angleDegrees;
  const directionRadians = (directionDegrees * Math.PI) / 180;
  const radiusPixels = 48;
  return landmark(
    knee.x + (radiusPixels * Math.cos(directionRadians)) / 640,
    knee.y + (radiusPixels * Math.sin(directionRadians)) / 480,
    visibility,
  );
}

function makePose(kneeAngleDegrees: number): PoseLandmark[] {
  const landmarks = Array.from({ length: 33 }, () => landmark(0.5, 0.5, 0));
  const leftHip = landmark(0.5, 0.4);
  const rightHip = landmark(0.5, 0.4);
  const leftKnee = landmark(0.5, 0.5);
  const rightKnee = landmark(0.5, 0.5);

  landmarks[11] = landmark(0.5, 0.18);
  landmarks[12] = landmark(0.5, 0.18);
  landmarks[23] = leftHip;
  landmarks[24] = rightHip;
  landmarks[25] = leftKnee;
  landmarks[26] = rightKnee;
  landmarks[27] = ankleForAngle(leftKnee, kneeAngleDegrees);
  landmarks[28] = ankleForAngle(rightKnee, kneeAngleDegrees);
  return landmarks;
}

function frame(kneeAngleDegrees: number, timestamp: number): SquatFrame {
  return { landmarks: makePose(kneeAngleDegrees), width: 640, height: 480, timestamp };
}

function lostPoseFrame(timestamp: number): SquatFrame {
  return {
    landmarks: Array.from({ length: 33 }, () => landmark(0.5, 0.5, 0)),
    width: 640,
    height: 480,
    timestamp,
  };
}

describe("calculateJointAngleDegrees", () => {
  it("calculates an angle in pixel space for non-square video frames", () => {
    const angle = calculateJointAngleDegrees(
      landmark(0.5, 0.25), landmark(0.5, 0.5), landmark(0.75, 0.5), 1280, 720,
    );
    expect(angle).toBeCloseTo(90, 5);
  });

  it("rejects landmarks below the confidence threshold", () => {
    const angle = calculateJointAngleDegrees(
      landmark(0.5, 0.25), landmark(0.5, 0.5, 0.1), landmark(0.75, 0.5), 1280, 720,
    );
    expect(angle).toBeNull();
  });

  it("rejects degenerate segments", () => {
    const point = landmark(0.5, 0.5);
    expect(calculateJointAngleDegrees(point, point, landmark(0.7, 0.5), 640, 480)).toBeNull();
  });

  it("rejects invalid video dimensions", () => {
    const points = [landmark(0.5, 0.25), landmark(0.5, 0.5), landmark(0.75, 0.5)];
    expect(calculateJointAngleDegrees(points[0], points[1], points[2], Number.NaN, 480)).toBeNull();
    expect(calculateJointAngleDegrees(points[0], points[1], points[2], 640, Number.POSITIVE_INFINITY)).toBeNull();
  });

  it("uses the clearer side when bilateral angle estimates disagree", () => {
    const landmarks = makePose(150);
    landmarks[24] = landmark(0.5, 0.4, 0.6);
    landmarks[26] = landmark(0.5, 0.5, 0.6);
    landmarks[28] = ankleForAngle(landmarks[26], 90, 0.6);

    const metrics = calculateSquatMetrics(landmarks, 640, 480);
    expect(metrics.kneeAngleDegrees).toBeCloseTo(150, 0);
  });

  it("returns no aggregate angle when bilateral estimates disagree with similar confidence", () => {
    const landmarks = makePose(150);
    landmarks[28] = ankleForAngle(landmarks[26], 90);
    const metrics = calculateSquatMetrics(landmarks, 640, 480);
    expect(metrics.leftKneeAngleDegrees).toBeCloseTo(150, 0);
    expect(metrics.rightKneeAngleDegrees).toBeCloseTo(90, 0);
    expect(metrics.kneeAngleDegrees).toBeNull();
  });
});

describe("SquatAnalyzer", () => {
  it("counts a complete rep after confirming the target over consecutive frames", () => {
    const analyzer = new SquatAnalyzer({ smoothingAlpha: 1, depthTargetDegrees: 110 });
    expect(analyzer.analyzeFrame(frame(170, 0)).phase).toBe("standing");
    expect(analyzer.analyzeFrame(frame(150, 200)).phase).toBe("descending");
    expect(analyzer.analyzeFrame(frame(100, 600)).phase).toBe("descending");
    expect(analyzer.analyzeFrame(frame(102, 700)).phase).toBe("descending");
    expect(analyzer.analyzeFrame(frame(101, 800)).phase).toBe("bottom");
    expect(analyzer.analyzeFrame(frame(120, 900)).phase).toBe("ascending");
    expect(analyzer.analyzeFrame(frame(145, 1200)).repCount).toBe(0);
    const completed = analyzer.analyzeFrame(frame(165, 1600));
    expect(completed.phase).toBe("standing");
    expect(completed.repCount).toBe(1);
    expect(completed.lastRep?.depthTargetMet).toBe(true);
    expect(completed.lastRep?.depthTargetDegrees).toBe(110);
    expect(completed.lastRep?.minimumKneeAngleDegrees).toBeCloseTo(100, 0);
  });

  it("counts a shallow rep but reports that it missed the selected target", () => {
    const analyzer = new SquatAnalyzer({ smoothingAlpha: 1, depthTargetDegrees: 110 });
    analyzer.analyzeFrame(frame(170, 0));
    analyzer.analyzeFrame(frame(150, 200));
    analyzer.analyzeFrame(frame(145, 500));
    analyzer.analyzeFrame(frame(140, 800));
    analyzer.analyzeFrame(frame(150, 1100));
    const completed = analyzer.analyzeFrame(frame(165, 1500));
    expect(completed.repCount).toBe(1);
    expect(completed.lastRep?.depthTargetMet).toBe(false);
    expect(completed.lastRep?.minimumKneeAngleDegrees).toBeCloseTo(140, 0);
  });

  it("does not count a one-frame noisy dip as confirmed depth", () => {
    const analyzer = new SquatAnalyzer({ smoothingAlpha: 1, depthTargetDegrees: 110 });
    analyzer.analyzeFrame(frame(170, 0));
    analyzer.analyzeFrame(frame(150, 200));
    analyzer.analyzeFrame(frame(105, 300));
    analyzer.analyzeFrame(frame(120, 400));
    analyzer.analyzeFrame(frame(145, 600));
    const completed = analyzer.analyzeFrame(frame(165, 800));
    expect(completed.repCount).toBe(1);
    expect(completed.lastRep?.minimumKneeAngleDegrees).toBeCloseTo(105, 0);
    expect(completed.lastRep?.depthTargetMet).toBe(false);
  });

  it("keeps the depth threshold fixed for the active rep", () => {
    const analyzer = new SquatAnalyzer({ smoothingAlpha: 1, depthTargetDegrees: 110 });
    analyzer.analyzeFrame(frame(170, 0));
    analyzer.analyzeFrame(frame(150, 200));
    analyzer.setDepthTargetDegrees(90);
    expect(analyzer.analyzeFrame(frame(105, 300)).phase).toBe("descending");
    expect(analyzer.analyzeFrame(frame(106, 400)).phase).toBe("descending");
    expect(analyzer.analyzeFrame(frame(107, 500)).phase).toBe("bottom");
    analyzer.analyzeFrame(frame(125, 600));
    const completed = analyzer.analyzeFrame(frame(165, 900));
    expect(completed.lastRep?.depthTargetDegrees).toBe(110);
    expect(completed.lastRep?.depthTargetMet).toBe(true);
    expect(completed.depthTargetDegrees).toBe(90);
  });

  it("resets a transient rep and requires standing calibration after prolonged pose loss", () => {
    const analyzer = new SquatAnalyzer({ smoothingAlpha: 1, lostPoseResetMs: 900 });
    analyzer.analyzeFrame(frame(170, 0));
    analyzer.analyzeFrame(frame(150, 200));
    const lost = analyzer.analyzeFrame(lostPoseFrame(1150));
    expect(lost.poseQuality).toBe("insufficient");
    expect(lost.phase).toBe("awaiting_standing");
    expect(lost.repCount).toBe(0);
    expect(lost.currentRepDurationMs).toBeNull();

    expect(analyzer.analyzeFrame(frame(165, 1200)).phase).toBe("standing");
    expect(analyzer.analyzeFrame(frame(165, 1300)).repCount).toBe(0);
  });

  it("does not allow invalid dimensions or timestamps to corrupt a later valid frame", () => {
    const analyzer = new SquatAnalyzer({ smoothingAlpha: 1 });
    const invalid = frame(170, 0);
    invalid.width = Number.NaN;
    expect(analyzer.analyzeFrame(invalid).poseQuality).toBe("insufficient");
    expect(analyzer.analyzeFrame({ ...frame(170, 100), timestamp: Number.NaN }).poseQuality).toBe("insufficient");
    expect(analyzer.analyzeFrame(frame(170, 200)).phase).toBe("standing");
  });

  it("clamps user-selected angle thresholds to the supported range and ignores non-finite values", () => {
    const analyzer = new SquatAnalyzer();
    expect(analyzer.setDepthTargetDegrees(50).depthTargetDegrees).toBe(90);
    expect(analyzer.setDepthTargetDegrees(180).depthTargetDegrees).toBe(130);
    expect(analyzer.setDepthTargetDegrees(Number.NaN).depthTargetDegrees).toBe(130);
  });

  it("resets count and transient phase between sessions", () => {
    const analyzer = new SquatAnalyzer({ smoothingAlpha: 1 });
    analyzer.analyzeFrame(frame(170, 0));
    analyzer.analyzeFrame(frame(150, 200));
    const reset = analyzer.reset();
    expect(reset.repCount).toBe(0);
    expect(reset.phase).toBe("awaiting_standing");
    expect(reset.lastRep).toBeNull();
  });
});
