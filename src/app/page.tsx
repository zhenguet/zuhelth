import { ApproachSection } from "@/components/landing/approach-section";
import { HeroSection } from "@/components/landing/hero-section";
import { RoadmapSection } from "@/components/landing/roadmap-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <HeroSection />
      <ApproachSection />
      <RoadmapSection />
      <SiteFooter />
    </main>
  );
}
