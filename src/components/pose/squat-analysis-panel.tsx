"use client";

import type { SquatAnalysisSnapshot, SquatPhase } from "@/features/squat/types";

interface SquatAnalysisPanelProps {
  snapshot: SquatAnalysisSnapshot;
  onDepthTargetChange: (degrees: number) => void;
}

const PHASE_LABELS: Record<SquatPhase, string> = {
  awaiting_standing: "Find starting position",
  standing: "Standing",
  descending: "Lowering",
  bottom: "Bottom position",
  ascending: "Standing up",
};

function formatDegrees(value: number | null): string {
  return value === null ? "—" : `${Math.round(value)}°`;
}

function formatDuration(value: number): string {
  return value < 1000 ? `${Math.round(value)} ms` : `${(value / 1000).toFixed(1)} s`;
}

export function SquatAnalysisPanel({ snapshot, onDepthTargetChange }: SquatAnalysisPanelProps) {
  const isRepActive =
    snapshot.phase === "descending" ||
    snapshot.phase === "bottom" ||
    snapshot.phase === "ascending";
  const phaseColor =
    snapshot.phase === "bottom"
      ? "bg-[#e7f2df] text-[#31563a]"
      : snapshot.phase === "descending" || snapshot.phase === "ascending"
        ? "bg-[#fff4d9] text-[#805b13]"
        : "bg-[#f1f3ef] text-[#66736b]";

  return (
    <section className="rounded-3xl border border-[#dfe5dc] bg-white p-5 sm:p-6" aria-labelledby="squat-analysis-title">
      <p className="text-xs font-bold tracking-[0.15em] text-[#658c50]">SQUAT ANALYSIS</p>
      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <h2 id="squat-analysis-title" className="text-xl font-semibold tracking-[-0.04em]">Rep tracker</h2>
          <p className="mt-1 text-xs text-[#66736b]">Rule-based estimate · not a safety score</p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${snapshot.poseQuality === "ready" ? "bg-[#e7f2df] text-[#31563a]" : "bg-[#f1f3ef] text-[#66736b]"}`}>
          {snapshot.poseQuality === "ready" ? "Tracking" : "Need clearer pose"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-[0.8fr_1.2fr] gap-3">
        <div className="rounded-2xl bg-[#203a27] p-4 text-white">
          <p className="text-xs text-white/65">Completed reps</p>
          <p className="mt-1 text-4xl font-semibold tracking-[-0.06em] tabular-nums">{snapshot.repCount}</p>
        </div>
        <div className="rounded-2xl bg-[#f4f6f1] p-4">
          <p className="text-xs text-[#66736b]">Movement phase</p>
          <p className="mt-2 text-base font-semibold leading-5 text-[#18241d]">{PHASE_LABELS[snapshot.phase]}</p>
          <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${phaseColor}`}>
            {snapshot.phase === "awaiting_standing" ? "Calibration" : "Live"}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#edf0ea] pb-3">
          <span className="text-sm text-[#66736b]">Current knee angle</span>
          <span className="text-sm font-semibold tabular-nums">{formatDegrees(snapshot.kneeAngleDegrees)}</span>
        </div>
        <div className="flex items-center justify-between border-b border-[#edf0ea] pb-3">
          <span className="text-sm text-[#66736b]">Lowest angle (current/last rep)</span>
          <span className="text-sm font-semibold tabular-nums">{formatDegrees(snapshot.deepestKneeAngleDegrees)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#66736b]">Estimated torso lean</span>
          <span className="text-sm font-semibold tabular-nums">{formatDegrees(snapshot.trunkLeanDegrees)}</span>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[#dfe5dc] p-4">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="depth-target" className="text-sm font-semibold text-[#18241d]">Knee-angle target</label>
          <span className="text-sm font-semibold tabular-nums text-[#31563a]">≤ {snapshot.depthTargetDegrees}°</span>
        </div>
        <input
          id="depth-target"
          type="range"
          min={90}
          max={130}
          step={5}
          value={snapshot.depthTargetDegrees}
          disabled={isRepActive}
          onChange={(event) => onDepthTargetChange(Number(event.currentTarget.value))}
          className="mt-3 w-full accent-[#31563a]"
          aria-describedby="depth-target-help"
        />
        <div className="flex justify-between text-[11px] text-[#66736b]">
          <span>Deeper bend · 90°</span>
          <span>Shallower bend · 130°</span>
        </div>
        <p id="depth-target-help" className="mt-2 text-xs leading-5 text-[#66736b]">
          {isRepActive
            ? "The target is locked for the active rep. You can change it when you return to standing."
            : "The target applies to the next rep. Depth is confirmed over consecutive frames to reduce one-frame landmark noise. This is not a universal form standard."}
        </p>
      </div>

      <div className={`mt-4 rounded-2xl p-4 ${snapshot.poseQuality === "insufficient" ? "bg-amber-50 text-amber-900" : "bg-[#f4f6f1] text-[#31563a]"}`} role="status" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-[0.12em] opacity-75">Live guidance</p>
        <p className="mt-1 text-sm leading-6">{snapshot.instruction}</p>
      </div>

      {snapshot.lastRep && (
        <div className={`mt-4 rounded-2xl border p-4 ${snapshot.lastRep.depthTargetMet ? "border-[#cfe5c0] bg-[#f4faef]" : "border-[#f0d9a9] bg-[#fffaf0]"}`}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#18241d]">Last rep · #{snapshot.lastRep.number}</p>
            <span className={`text-xs font-semibold ${snapshot.lastRep.depthTargetMet ? "text-[#31563a]" : "text-[#805b13]"}`}>
              {snapshot.lastRep.depthTargetMet ? "Target reached" : "Target not reached"}
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#66736b]">
            Lowest estimated knee angle: {formatDegrees(snapshot.lastRep.minimumKneeAngleDegrees)} · Target: ≤ {snapshot.lastRep.depthTargetDegrees}° · Duration: {formatDuration(snapshot.lastRep.durationMs)}.
            {!snapshot.lastRep.depthTargetMet
              ? " The rep was counted, but it did not reach the configured angle threshold."
              : " This only confirms the selected angle threshold, not the quality or safety of the whole movement."}
          </p>
        </div>
      )}

      <p className="mt-4 text-[11px] leading-5 text-[#66736b]">
        Best used with a side-on camera view. Angles are 2D image-plane estimates and can be affected by camera placement, occlusion and body proportions. No medical or safety judgment is made.
      </p>
    </section>
  );
}
