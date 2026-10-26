import type { Metadata } from "next";
import Link from "next/link";
import { PoseCameraPanel } from "@/components/pose/pose-camera-panel";

export const metadata: Metadata = {
  title: "Live Squat Analysis",
  description:
    "Track estimated bodyweight squat reps and knee-angle movement using MediaPipe Pose Landmarker in the browser.",
};

export default function SquatWorkoutPage() {
  return (
    <main className="min-h-screen bg-[#f4f6f1]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#49634d] transition hover:text-[#18241d]">
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <path d="M12.5 4.5 7 10l5.5 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Zuhelth
        </Link>
        <span className="rounded-full border border-[#dfe5dc] bg-white px-3 py-1.5 text-xs font-semibold text-[#66736b]">
          Stage 4 · Squat analysis
        </span>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-16 pt-6 sm:px-8 lg:px-12 lg:pb-20">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-bold tracking-[0.16em] text-[#658c50]">BODYWEIGHT SQUAT ANALYSIS</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-[#18241d] sm:text-5xl">
            Track each rep.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#66736b]">
            Start your camera to track squat movement phases, count full down-and-up reps, and compare the estimated knee angle with a configurable reference threshold. This is a rule-based preview, not a complete form or safety assessment.
          </p>
        </div>

        <PoseCameraPanel />

        <p className="mt-6 max-w-4xl text-xs leading-5 text-[#66736b]">
          Privacy note: this feature processes video frames in the browser and does not upload the camera stream to the app server. The MediaPipe runtime and model are downloaded from their configured public asset hosts, and MediaPipe may send usage/performance metrics under its privacy notice. Review the relevant terms before public release.
        </p>
      </section>
    </main>
  );
}
