import { ArrowUpRight } from "@/components/landing/arrow-up-right";
import { PoseIllustration } from "@/components/landing/pose-illustration";

export function HeroSection() {
  return (
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
          <a href="/workout/squat" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#203a27] px-6 text-sm font-semibold text-white transition hover:bg-[#31563a]">
            Try live pose preview <ArrowUpRight />
          </a>
          <a href="#how-it-works" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#dfe5dc] bg-white/65 px-5 text-sm font-semibold text-[#203a27] transition hover:bg-white">
            How it works
          </a>
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
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/65">Illustration</span>
          </div>
          <div className="relative flex min-h-[300px] items-center justify-center sm:min-h-[340px]">
            <div className="absolute left-3 top-5 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.13em] text-white/45">Exercise</p>
              <p className="mt-1 text-sm font-medium text-white">Bodyweight squat</p>
            </div>
            <PoseIllustration />
            <div className="absolute bottom-4 right-2 rounded-xl border border-white/10 bg-[#243d2c]/95 px-3 py-2.5 backdrop-blur sm:right-3">
              <p className="text-[10px] uppercase tracking-[0.13em] text-white/45">Pose detection</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-white"><span className="h-1.5 w-1.5 rounded-full bg-[#d2a64d]" /> Available in preview</p>
            </div>
          </div>
          <div className="relative grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
            <div className="rounded-xl bg-white/[0.06] p-3">
              <p className="text-[10px] uppercase tracking-[0.1em] text-white/45">Rep counter</p>
              <p className="mt-1 text-sm font-medium text-white">Next stage</p>
            </div>
            <div className="rounded-xl bg-white/[0.06] p-3">
              <p className="text-[10px] uppercase tracking-[0.1em] text-white/45">Joint angles</p>
              <p className="mt-1 text-sm font-medium text-white">Next stage</p>
            </div>
            <div className="rounded-xl bg-white/[0.06] p-3">
              <p className="text-[10px] uppercase tracking-[0.1em] text-white/45">Live feedback</p>
              <p className="mt-1 text-sm font-medium text-white">Next stage</p>
            </div>
          </div>
        </div>
        <p className="mt-3 px-2 text-xs leading-5 text-[#66736b]">The landing illustration is static. Open the live preview to test your camera and pose landmarks.</p>
      </div>
    </section>
  );
}
