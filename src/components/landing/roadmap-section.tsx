export function RoadmapSection() {
  return (
    <section id="roadmap" className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-16 lg:px-12 lg:py-20">
      <div>
        <p className="text-xs font-bold tracking-[0.15em] text-[#658c50]">BUILDING IN THE OPEN</p>
        <h2 className="mt-3 max-w-md text-3xl font-semibold tracking-[-0.055em] sm:text-4xl">Small steps. Tested properly.</h2>
        <p className="mt-4 max-w-md text-sm leading-6 text-[#66736b]">This foundation is intentionally lightweight. Camera processing, pose analysis, and exercise-specific feedback will arrive in separate, testable milestones.</p>
      </div>
      <ol className="divide-y divide-[#dfe5dc] border-y border-[#dfe5dc]">
        <li className="flex items-start gap-4 py-5">
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e7f2df] text-xs font-semibold text-[#31563a]">✓</span>
          <div className="flex-1">
            <p className="font-semibold">01 · Repository review</p>
            <p className="mt-1 text-sm leading-6 text-[#66736b]">Confirm repository state and choose the project foundation.</p>
          </div>
          <span className="text-xs font-semibold text-[#49634d]">Complete</span>
        </li>
        <li className="flex items-start gap-4 py-5">
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#dfe5dc] text-xs font-semibold">02</span>
          <div className="flex-1">
            <p className="font-semibold">02 · Application scaffold</p>
            <p className="mt-1 text-sm leading-6 text-[#66736b]">Next.js, TypeScript, styles, linting, and type-check scripts.</p>
          </div>
          <span className="text-xs font-semibold text-[#49634d]">Complete</span>
        </li>
        <li className="flex items-start gap-4 py-5">
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e7f2df] text-xs font-semibold text-[#31563a]">03</span>
          <div className="flex-1">
            <p className="font-semibold">03 · Camera and pose landmarks</p>
            <p className="mt-1 text-sm leading-6 text-[#66736b]">Webcam preview, MediaPipe inference, and the live pose overlay are implemented.</p>
          </div>
          <span className="text-xs font-semibold text-[#49634d]">Try locally</span>
        </li>
        <li className="flex items-start gap-4 py-5">
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#dfe5dc] text-xs font-semibold">04</span>
          <div className="flex-1">
            <p className="font-semibold">04 · Squat analysis</p>
            <p className="mt-1 text-sm leading-6 text-[#66736b]">Movement phases, repetition counting, and explicit technique criteria.</p>
          </div>
          <span className="text-xs text-[#66736b]">Planned</span>
        </li>
      </ol>
    </section>
  );
}
