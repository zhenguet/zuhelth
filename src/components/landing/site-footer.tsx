import { BrandMark } from "@/components/landing/brand-mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#dfe5dc]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-xs text-[#66736b] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <a href="#top" className="flex items-center gap-2 font-semibold text-[#18241d]">
          <BrandMark /> zuhelth
        </a>
        <p>Built to support technique review—not to replace qualified coaching or medical advice.</p>
      </div>
    </footer>
  );
}
