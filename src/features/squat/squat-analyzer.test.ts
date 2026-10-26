import { describe, expect, it } from "vitest";
import { calculateJointAngleDegrees } from "./geometry";
import { SquatAnalyzer } from "./squat-analyzer";
import type { PoseLandmark, SquatFrame } from "./types";

function landmark(x: number, y: number, visibility = 1): PoseLandmark {
  return { x, y, visibility, presence: visibility };
}

function makePose(kneeAngleDegrees: number): PoseLandmark[] {
  const landmarks = Array.from({ length: 33 }, () => landmark(0.5, 0.5, 0));
  const hip = landmark(0.5, 0.4);
  const knee = landmark(0.5, 0.5);
  const directionDegrees = -90 + kneeAngleDegrees;
  const directionRadians = (directionDegrees * Math.PI) / 180;
  // Construct the synthetic vector in pixels, then convert each axis to normalized coordinates.
  const radiusPixels = 48;
  const ankle = landmark(
    knee.x + (radiusPixels * Math.cos(directionRadians)) / 640,
    knee.y + (radiusPixels * Math.sin(directionRadians)) / 480,
  );

  landmarks[11] = landmark(0.5, 0.18);
  landmarks[12] = landmark(0.5, 0.18);
  landmarks[23] = hip;
  landmarks[24] = hip;
  landmarks[25] = knee;
  landmarks[26] = knee;
  landmarks[27] = ankle;
  landmarks[28] = ankle;
  return landmarks;
}

function frame(kneeAngleDegrees: number, timestamp: number): SquatFrame {
  return { landmarks: makePose(kneeAngleDegrees), width: 640, height: 480, timestamp };
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
});

describe("SquatAnalyzer", () => {
  it("counts a complete rep and checks the configured depth threshold", () => {
    const analyzer = new SquatAnalyzer({ smoothingAlpha: 1, depthTargetDegrees: 110 });
    expect(analyzer.analyzeFrame(frame(170, 0)).phase).toBe("standing");
    expect(analyzer.analyzeFrame(frame(150, 200)).phase).toBe("descending");
    expect(analyzer.analyzeFrame(frame(100, 600)).phase).toBe("bottom");
    expect(analyzer.analyzeFrame(frame(120, 900)).phase).toBe("ascending");
    expect(analyzer.analyzeFrame(frame(145, 1200)).repCount).toBe(0);
    const completed = analyzer.analyzeFrame(frame(165, 1600));
    expect(completed.phase).toBe("standing");
    expect(completed.repCount).toBe(1);
    expect(completed.lastRep?.depthTargetMet).toBe(true);
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

  it("does not calculate or count when required landmarks are not visible", () => {
    const analyzer = new SquatAnalyzer({ smoothingAlpha: 1 });
    analyzer.analyzeFrame(frame(170, 0));
    const invisible = frame(100, 100);
    invisible.landmarks = invisible.landmarks.map(() => landmark(0.5, 0.5, 0));
    const snapshot = analyzer.analyzeFrame(invisible);
    expect(snapshot.poseQuality).toBe("insufficient");
    expect(snapshot.repCount).toBe(0);
    expect(snapshot.kneeAngleDegrees).toBeNull();
  });

  it("clamps user-selected angle thresholds to the supported range", () => {
    const analyzer = new SquatAnalyzer();
    expect(analyzer.setDepthTargetDegrees(50).depthTargetDegrees).toBe(90);
    expect(analyzer.setDepthTargetDegrees(180).depthTargetDegrees).toBe(130);
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
