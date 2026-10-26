import { ArrowUpRight } from "@/components/landing/arrow-up-right";
import { BrandMark } from "@/components/landing/brand-mark";

export function SiteHeader() {
  return (
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
  );
}
