const steps = [
  {
    number: "01",
    title: "Set your camera",
    description:
      "Simple positioning guidance helps keep the movement in frame before a set begins.",
  },
  {
    number: "02",
    title: "Understand your movement",
    description:
      "Pose landmarks will provide the base signals for measuring joint angles and movement phases.",
  },
  {
    number: "03",
    title: "Review each rep",
    description:
      "Clear, specific feedback will help you review chosen technique criteria—not replace a qualified coach.",
  },
];

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path
        d="M5 15 15 5M6 5h9v9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BrandMark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#b9f36d] text-[#203a27]">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M5 8v8M8 5v14M16 5v14M19 8v8M8 12h8"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function PoseIllustration() {
  return (
    <svg
      aria-label="Illustration of a person in a squat pose with a simplified pose landmark overlay"
      role="img"
      viewBox="0 0 360 340"
      fill="none"
      className="h-full w-full max-w-[360px]"
    >
      <defs>
        <linearGradient id="body" x1="92" y1="58" x2="263" y2="286" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d7f3b6" />
          <stop offset="1" stopColor="#75b957" />
        </linearGradient>
      </defs>
      <ellipse cx="180" cy="302" rx="112" ry="12" fill="#101d16" fillOpacity=".35" />
      <path d="M86 290h188" stroke="#dce7d6" strokeOpacity=".25" strokeDasharray="4 7" />
      <path d="M184 79 151 131 111 157 92 211" stroke="url(#body)" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M155 131 205 174 252 183 278 227" stroke="url(#body)" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M151 131 202 126 233 144" stroke="#91cf68" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M184 79 209 110 202 126" stroke="#c2eb9d" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="185" cy="57" r="21" fill="#d7f3b6" />
      <path d="M165 53c3-17 29-25 42-5-7-6-13-7-20-5-6 2-11 7-22 10Z" fill="#244b31" />
      <g stroke="#c9f49e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m184 79 27 31-7 16-49 5-44 26-19 54" />
        <path d="m155 131 50 43 47 9 26 44" />
        <path d="m151 131 51-5 31 18" />
      </g>
      <g fill="#f4ffe9" stroke="#6caf4d" strokeWidth="3">
        <circle cx="184" cy="79" r="5" />
        <circle cx="155" cy="131" r="5" />
        <circle cx="111" cy="157" r="5" />
        <circle cx="92" cy="211" r="5" />
        <circle cx="205" cy="174" r="5" />
        <circle cx="252" cy="183" r="5" />
        <circle cx="278" cy="227" r="5" />
        <circle cx="202" cy="126" r="5" />
        <circle cx="233" cy="144" r="5" />
      </g>
      <g stroke="#b9f36d" strokeWidth="1.5" strokeDasharray="3 4" opacity=".75">
        <path d="M155 131 92 211" />
        <path d="M155 131 252 183" />
        <path d="M184 79 202 126" />
      </g>
      <path d="M58 99h50M58 99v22M302 252h-36M302 252v-22" stroke="#dce7d6" strokeOpacity=".45" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <a href="#top" aria-label="Zuhelth home" className="flex items-center gap-3">
          <BrandMark />
          <span className="text-lg font-semibold tracking-[-0.04em]">zuhelth</span>
        </a>
        <nav aria-label="Main navigation" className="hidden items-center gap-8 text-sm font-medium text-[#66736b] sm:flex">
          <a className="transition hover:text-[#18241d]" href="#how-it-works">How it works</a>
          <a className="transition hover:text-[#18241d]" href="#roadmap">Roadmap</a>
        </nav>
        <a href="#roadmap" className="inline-flex items-center gap-2 rounded-full border border-[#dfe5dc] bg-white/70 px-4 py-2.5 text-sm font-semibold transition hover:border-[#b9f36d] hover:bg-white">
          Project status <ArrowUpRight />
        </a>
      </header>

      <section id="top" className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 md:pt-16 lg:grid-cols-[1.02fr_.98fr] lg:gap-16 lg:px-12 lg:pb-28 lg:pt-14">
        <div className="max-w-2xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#dfe5dc] bg-white/65 px-3.5 py-2 text-xs font-semibold tracking-[0.09em] text-[#49634d]">
            <span className="h-2 w-2 rounded-full bg-[#6bb64d]" />
            YOUR WORKOUT, WITH MORE CONTEXT
          </div>
          <h1 className="max-w-xl text-5xl font-semibold leading-[.99] tracking-[-0.07em] sm:text-6xl lg:text-7xl">
            Move better.<br />
            <span className="text-[#658c50]">Rep by rep.</span>
          </h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-[#66736b] sm:text-lg sm:leading-8">
            Zuhelth is being built as a camera-first workout companion to help you understand your movement, review technique criteria, and make each set more intentional.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#how-it-works" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#203a27] px-6 text-sm font-semibold text-white transition hover:bg-[#31563a]">
              Explore the approach <ArrowUpRight />
            </a>
            <span className="inline-flex min-h-12 items-center gap-2 px-2 text-sm text-[#66736b]">
              <span className="h-2 w-2 rounded-full bg-[#d2a64d]" />
              Foundation phase
            </span>
          </div>
          <div className="mt-12 grid max-w-lg grid-cols-3 border-t border-[#dfe5dc] pt-5">
            <div className="pr-3">
              <p className="text-2xl font-semibold tracking-[-0.05em]">01</p>
              <p className="mt-1 text-xs leading-5 text-[#66736b] sm:text-sm">Exercise first</p>
            </div>
            <div className="border-l border-[#dfe5dc] px-4">
              <p className="text-xl font-semibold tracking-[-0.05em] sm:text-2xl">On-device</p>
              <p className="mt-1 text-xs leading-5 text-[#66736b] sm:text-sm">Target processing model</p>
            </div>
            <div className="border-l border-[#dfe5dc] pl-4">
              <p className="text-2xl font-semibold tracking-[-0.05em]">No DB</p>
              <p className="mt-1 text-xs leading-5 text-[#66736b] sm:text-sm">For the MVP</p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div aria-hidden="true" className="absolute -right-16 -top-12 h-48 w-48 rounded-full bg-[#d9edc8] blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] bg-[#1c3023] p-4 shadow-[0_28px_80px_-38px_rgba(24,36,29,.55)] sm:p-6">
            <div className="grid-paper absolute inset-0 opacity-60" />
            <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.12em] text-[#b9f36d]">MOVEMENT LAB</p>
                <p className="mt-1 text-sm text-white/80">Squat form check</p>
              </div>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/65">Preview only</span>
            </div>
            <div className="relative flex min-h-[300px] items-center justify-center sm:min-h-[340px]">
              <div className="absolute left-3 top-5 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 backdrop-blur">
                <p className="text-[10px] uppercase tracking-[0.13em] text-white/45">Exercise</p>
                <p className="mt-1 text-sm font-medium text-white">Bodyweight squat</p>
              </div>
              <PoseIllustration />
              <div className="absolute bottom-4 right-2 rounded-xl border border-white/10 bg-[#243d2c]/95 px-3 py-2.5 backdrop-blur sm:right-3">
                <p className="text-[10px] uppercase tracking-[0.13em] text-white/45">Pose detection</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-white"><span className="h-1.5 w-1.5 rounded-full bg-[#d2a64d]" /> Planned next phase</p>
              </div>
            </div>
            <div className="relative grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
              <div className="rounded-xl bg-white/[0.06] p-3">
                <p className="text-[10px] uppercase tracking-[0.1em] text-white/45">Rep counter</p>
                <p className="mt-1 text-sm font-medium text-white">Planned</p>
              </div>
              <div className="rounded-xl bg-white/[0.06] p-3">
                <p className="text-[10px] uppercase tracking-[0.1em] text-white/45">Joint angles</p>
                <p className="mt-1 text-sm font-medium text-white">Planned</p>
              </div>
              <div className="rounded-xl bg-white/[0.06] p-3">
                <p className="text-[10px] uppercase tracking-[0.1em] text-white/45">Live feedback</p>
                <p className="mt-1 text-sm font-medium text-white">Planned</p>
              </div>
            </div>
          </div>
          <p className="mt-3 px-2 text-xs leading-5 text-[#66736b]">Illustrative concept only. This screen does not access your camera or evaluate exercise form yet.</p>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-[#dfe5dc] bg-white/55">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.15em] text-[#658c50]">THE APPROACH</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.055em] sm:text-4xl">Useful feedback starts with good signals.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#66736b]">The first release will focus on one exercise and clear, testable criteria before expanding to a larger workout library.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number} className="rounded-2xl border border-[#dfe5dc] bg-[#fbfcf9] p-6 sm:p-7">
                <p className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f2df] text-sm font-semibold text-[#31563a]">{step.number}</p>
                <h3 className="mt-6 text-lg font-semibold tracking-[-0.03em]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#66736b]">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

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
            <span className="text-xs font-semibold text-[#49634d]">In progress</span>
          </li>
          <li className="flex items-start gap-4 py-5">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#dfe5dc] text-xs font-semibold">03</span>
            <div className="flex-1">
              <p className="font-semibold">03 · Camera and pose landmarks</p>
              <p className="mt-1 text-sm leading-6 text-[#66736b]">Connect webcam input to MediaPipe and draw the pose overlay.</p>
            </div>
            <span className="text-xs text-[#66736b]">Next</span>
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

      <footer className="border-t border-[#dfe5dc]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-xs text-[#66736b] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <a href="#top" className="flex items-center gap-2 font-semibold text-[#18241d]"><BrandMark /> zuhelth</a>
          <p>Built to support technique review—not to replace qualified coaching or medical advice.</p>
        </div>
      </footer>
    </main>
  );
}
