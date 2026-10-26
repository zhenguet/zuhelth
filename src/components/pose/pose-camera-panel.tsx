"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PoseLandmarker as PoseLandmarkerInstance } from "@mediapipe/tasks-vision";

const MEDIAPIPE_VERSION = "1.1.1";
const WASM_ROOT = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const POSE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const VISIBILITY_THRESHOLD = 0.35;
const MIN_INFERENCE_INTERVAL_MS = 1000 / 24;

type CameraStatus = "idle" | "requesting" | "loading-model" | "running" | "error";

type Landmark = {
  x: number;
  y: number;
  visibility?: number;
  presence?: number;
};

const POSE_CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 11],
  [0, 12],
  [11, 12],
  [11, 13],
  [13, 15],
  [15, 17],
  [15, 19],
  [15, 21],
  [17, 19],
  [12, 14],
  [14, 16],
  [16, 18],
  [16, 20],
  [16, 22],
  [18, 20],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [27, 29],
  [29, 31],
  [27, 31],
  [24, 26],
  [26, 28],
  [28, 30],
  [30, 32],
  [28, 32],
];

function isVisible(landmark: Landmark | undefined): landmark is Landmark {
  return Boolean(
    landmark &&
      Number.isFinite(landmark.x) &&
      Number.isFinite(landmark.y) &&
      (landmark.visibility ?? 1) >= VISIBILITY_THRESHOLD,
  );
}

function drawPose(
  context: CanvasRenderingContext2D,
  landmarks: Landmark[] | undefined,
  width: number,
  height: number,
) {
  context.clearRect(0, 0, width, height);
  if (!landmarks?.length) return;

  context.lineWidth = Math.max(2, width / 480);
  context.lineCap = "round";
  context.strokeStyle = "#b9f36d";
  context.shadowColor = "rgba(0, 0, 0, 0.4)";
  context.shadowBlur = 4;

  for (const [startIndex, endIndex] of POSE_CONNECTIONS) {
    const start = landmarks[startIndex];
    const end = landmarks[endIndex];
    if (!isVisible(start) || !isVisible(end)) continue;

    context.beginPath();
    context.moveTo(start.x * width, start.y * height);
    context.lineTo(end.x * width, end.y * height);
    context.stroke();
  }

  context.shadowBlur = 0;
  for (const landmark of landmarks) {
    if (!isVisible(landmark)) continue;

    context.beginPath();
    context.fillStyle = "#f4ffe9";
    context.strokeStyle = "#4e8b3b";
    context.lineWidth = Math.max(1.5, width / 720);
    context.arc(
      landmark.x * width,
      landmark.y * height,
      Math.max(2.5, width / 150),
      0,
      Math.PI * 2,
    );
    context.fill();
    context.stroke();
  }
}

function getCameraErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    switch (error.name) {
      case "NotAllowedError":
      case "SecurityError":
        return "Camera access was blocked. Allow camera permission in your browser settings, then try again.";
      case "NotFoundError":
        return "No camera was found. Connect a camera or try another device.";
      case "NotReadableError":
        return "The camera is already in use by another app. Close that app and try again.";
      case "OverconstrainedError":
        return "This camera cannot provide the requested video settings. Try another camera.";
      default:
        return error.message || "The camera could not be started.";
    }
  }

  if (error instanceof Error) return error.message;
  return "Something went wrong while starting camera and pose detection.";
}

const STATUS_LABELS: Record<CameraStatus, string> = {
  idle: "Camera is off",
  requesting: "Waiting for camera permission",
  "loading-model": "Loading pose model",
  running: "Pose detection is running",
  error: "Setup needs attention",
};

export function PoseCameraPanel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<PoseLandmarkerInstance | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sessionIdRef = useRef(0);
  const lastVideoTimeRef = useRef(-1);
  const lastInferenceTimeRef = useRef(0);
  const fpsWindowStartRef = useRef(0);
  const fpsFrameCountRef = useRef(0);
  const poseFoundRef = useRef(false);

  const [status, setStatus] = useState<CameraStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [poseFound, setPoseFound] = useState(false);
  const [fps, setFps] = useState(0);
  const [landmarkCount, setLandmarkCount] = useState(0);
  const [videoSize, setVideoSize] = useState<{ width: number; height: number } | null>(
    null,
  );

  const releaseResources = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    try {
      landmarkerRef.current?.close();
    } catch {
      // Closing a partially initialized model should not prevent camera cleanup.
    }
    landmarkerRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    const video = videoRef.current;
    if (video) {
      video.pause();
      video.srcObject = null;
    }

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const stopCamera = useCallback(() => {
    sessionIdRef.current += 1;
    releaseResources();
    setStatus("idle");
    setErrorMessage(null);
    setPoseFound(false);
    poseFoundRef.current = false;
    setFps(0);
    setLandmarkCount(0);
    setVideoSize(null);
  }, [releaseResources]);

  useEffect(() => {
    return () => {
      sessionIdRef.current += 1;
      releaseResources();
    };
  }, [releaseResources]);

  const startCamera = async () => {
    const sessionId = sessionIdRef.current + 1;
    sessionIdRef.current = sessionId;
    setErrorMessage(null);
    setPoseFound(false);
    poseFoundRef.current = false;
    setFps(0);
    setLandmarkCount(0);
    setStatus("requesting");

    let acquiredStream: MediaStream | null = null;
    let acquiredLandmarker: PoseLandmarkerInstance | null = null;

    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Camera access requires a secure context (HTTPS or localhost) and a browser with webcam support.",
        );
      }

      acquiredStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 30 },
        },
      });

      if (sessionId !== sessionIdRef.current) {
        acquiredStream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = acquiredStream;

      const video = videoRef.current;
      if (!video) {
        throw new Error("The camera preview is not available. Reload the page and try again.");
      }

      video.srcObject = acquiredStream;
      await video.play();

      if (sessionId !== sessionIdRef.current) return;

      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setVideoSize({ width: video.videoWidth, height: video.videoHeight });
      }

      setStatus("loading-model");
      const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks(WASM_ROOT);

      if (sessionId !== sessionIdRef.current) return;

      try {
        acquiredLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: POSE_MODEL_URL,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      } catch {
        // Some browsers or devices cannot initialize the GPU delegate; retry on CPU.
        acquiredLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: POSE_MODEL_URL,
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      }

      if (sessionId !== sessionIdRef.current) {
        acquiredLandmarker.close();
        acquiredStream.getTracks().forEach((track) => track.stop());
        return;
      }

      landmarkerRef.current = acquiredLandmarker;
      setStatus("running");

      lastVideoTimeRef.current = -1;
      lastInferenceTimeRef.current = 0;
      fpsWindowStartRef.current = performance.now();
      fpsFrameCountRef.current = 0;

      const processFrame = (now: number) => {
        if (sessionId !== sessionIdRef.current) return;

        const currentVideo = videoRef.current;
        const currentCanvas = canvasRef.current;
        const currentLandmarker = landmarkerRef.current;

        if (
          currentVideo &&
          currentCanvas &&
          currentLandmarker &&
          currentVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
          currentVideo.videoWidth > 0 &&
          currentVideo.videoHeight > 0
        ) {
          if (
            currentCanvas.width !== currentVideo.videoWidth ||
            currentCanvas.height !== currentVideo.videoHeight
          ) {
            currentCanvas.width = currentVideo.videoWidth;
            currentCanvas.height = currentVideo.videoHeight;
            setVideoSize({
              width: currentVideo.videoWidth,
              height: currentVideo.videoHeight,
            });
          }

          const videoTimeChanged = currentVideo.currentTime !== lastVideoTimeRef.current;
          const intervalElapsed = now - lastInferenceTimeRef.current >= MIN_INFERENCE_INTERVAL_MS;

          if (videoTimeChanged && intervalElapsed) {
            try {
              const result = currentLandmarker.detectForVideo(currentVideo, now);
              const landmarks = (result.landmarks[0] ?? []) as Landmark[];
              const visibleCount = landmarks.filter(isVisible).length;
              const hasPose = visibleCount > 0;
              const context = currentCanvas.getContext("2d");

              if (context) {
                drawPose(
                  context,
                  hasPose ? landmarks : undefined,
                  currentCanvas.width,
                  currentCanvas.height,
                );
              }

              if (poseFoundRef.current !== hasPose) {
                poseFoundRef.current = hasPose;
                setPoseFound(hasPose);
              }

              setLandmarkCount(visibleCount);
              lastVideoTimeRef.current = currentVideo.currentTime;
              lastInferenceTimeRef.current = now;
              fpsFrameCountRef.current += 1;

              const elapsed = now - fpsWindowStartRef.current;
              if (elapsed >= 1000) {
                setFps(Math.round((fpsFrameCountRef.current * 1000) / elapsed));
                fpsFrameCountRef.current = 0;
                fpsWindowStartRef.current = now;
              }
            } catch (error) {
              if (sessionId === sessionIdRef.current) {
                sessionIdRef.current += 1;
                releaseResources();
                setErrorMessage(
                  `Pose detection stopped unexpectedly. Restart the camera to try again. ${getCameraErrorMessage(error)}`,
                );
                setStatus("error");
              }
              return;
            }
          }
        }

        animationFrameRef.current = requestAnimationFrame(processFrame);
      };

      animationFrameRef.current = requestAnimationFrame(processFrame);
    } catch (error) {
      if (sessionId !== sessionIdRef.current) {
        acquiredStream?.getTracks().forEach((track) => track.stop());
        acquiredLandmarker?.close();
        return;
      }

      releaseResources();
      setErrorMessage(getCameraErrorMessage(error));
      setStatus("error");
    }
  };

  const isStarting = status === "requesting" || status === "loading-model";
  const canCancel = isStarting || status === "running";

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,.75fr)]">
      <div className="min-w-0 rounded-3xl border border-[#dfe5dc] bg-white p-3 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <p className="text-sm font-semibold text-[#18241d]">Camera preview</p>
            <p className="mt-1 text-xs text-[#66736b]">Keep your full body inside the frame.</p>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
              status === "running"
                ? "bg-[#e7f2df] text-[#31563a]"
                : status === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-[#f1f3ef] text-[#66736b]"
            }`}
            role="status"
            aria-live="polite"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status === "running"
                  ? "bg-[#5f9c43]"
                  : status === "error"
                    ? "bg-red-500"
                    : "bg-[#a0aaa1]"
              }`}
            />
            {STATUS_LABELS[status]}
          </span>
        </div>

        <div
          className="relative w-full overflow-hidden rounded-2xl bg-[#101b14]"
          style={{
            aspectRatio: videoSize
              ? `${videoSize.width} / ${videoSize.height}`
              : "16 / 9",
          }}
        >
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center px-5 text-center text-white ${
              status === "running" ? "hidden" : "flex"
            }`}
          >
            <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-white/15 bg-white/[0.06]">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2l1.2-1.5h4.6L15.5 6h2A2.5 2.5 0 0 1 20 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </span>
            <p className="text-base font-semibold">
              {status === "loading-model"
                ? "Preparing pose detection"
                : status === "requesting"
                  ? "Waiting for camera access"
                  : status === "error"
                    ? "Camera preview unavailable"
                    : "Ready when you are"}
            </p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/65">
              {status === "loading-model"
                ? "The model is loaded in your browser. The first load may take a little longer."
                : status === "requesting"
                  ? "Allow camera permission in your browser when prompted."
                  : status === "error"
                    ? "Review the message below and try again."
                    : "Start the camera to see your live video with a pose landmark overlay."}
            </p>
          </div>

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            aria-label="Mirrored live camera preview"
            className={`absolute inset-0 h-full w-full -scale-x-100 object-contain ${
              status === "running" ? "visible" : "invisible"
            }`}
          />
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 h-full w-full -scale-x-100 object-contain ${
              status === "running" ? "visible" : "invisible"
            }`}
          />

          {status === "running" && (
            <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
              <span className={`h-1.5 w-1.5 rounded-full ${poseFound ? "bg-[#b9f36d]" : "bg-amber-300"}`} />
              {poseFound ? "Person detected" : "Looking for a person"}
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800" role="alert">
            {errorMessage}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {!canCancel ? (
            <button
              type="button"
              onClick={() => void startCamera()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#203a27] px-5 text-sm font-semibold text-white transition hover:bg-[#31563a] focus-visible:outline-offset-4"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M7 4.8c0-.77.84-1.25 1.5-.86l7.18 4.2a1 1 0 0 1 0 1.72l-7.18 4.2A1 1 0 0 1 7 13.2V4.8Z" />
              </svg>
              Start camera
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCamera}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#dfe5dc] bg-white px-5 text-sm font-semibold text-[#18241d] transition hover:bg-[#f1f3ef] focus-visible:outline-offset-4"
            >
              {isStarting ? "Cancel setup" : "Stop camera"}
            </button>
          )}
          <p className="text-xs leading-5 text-[#66736b]">
            {status === "running"
              ? "Camera is active. Stop it when you finish."
              : "Camera frames stay in this browser. MediaPipe may send usage/performance metrics as described in its privacy notice."}
          </p>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-[#dfe5dc] bg-white p-5 sm:p-6">
          <p className="text-xs font-bold tracking-[0.15em] text-[#658c50]">LIVE SIGNALS</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">Pose status</h2>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#edf0ea] pb-3">
              <span className="text-sm text-[#66736b]">Person in frame</span>
              <span className="text-sm font-semibold">{status === "running" ? (poseFound ? "Detected" : "Not yet") : "—"}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#edf0ea] pb-3">
              <span className="text-sm text-[#66736b]">Visible landmarks</span>
              <span className="text-sm font-semibold">{poseFound ? landmarkCount : "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#66736b]">Inference rate</span>
              <span className="text-sm font-semibold">{status === "running" && fps > 0 ? `${fps} FPS` : "—"}</span>
            </div>
          </div>
          <p className="mt-4 rounded-xl bg-[#f4f6f1] p-3 text-xs leading-5 text-[#66736b]">
            This stage confirms pose landmarks only. It does not grade squat technique or determine whether a movement is safe.
          </p>
        </div>

        <div className="rounded-3xl border border-[#dfe5dc] bg-[#eaf2e4] p-5 sm:p-6">
          <p className="text-xs font-bold tracking-[0.15em] text-[#49634d]">CAMERA SETUP</p>
          <h2 className="mt-2 text-lg font-semibold tracking-[-0.03em]">Help the model see your whole body</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[#49634d]">
            <li className="flex gap-2"><span aria-hidden="true">01</span><span>Place the device far enough away to show your head, hips, knees, and feet.</span></li>
            <li className="flex gap-2"><span aria-hidden="true">02</span><span>Use steady lighting and avoid strong backlighting.</span></li>
            <li className="flex gap-2"><span aria-hidden="true">03</span><span>Wear clothing that makes your body outline easy to distinguish.</span></li>
          </ul>
        </div>
      </aside>
    </section>
  );
}
