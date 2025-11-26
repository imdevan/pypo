import { ThemeToggle } from "@/components/ThemeToggle";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { VideoSection } from "@/components/VideoSection";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b-2 border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">PyPo</span>
          </div>
          <ThemeToggle />
        </div>
      </nav>
      
      <div className="pt-20">
        <Hero />
        <Features />
        <VideoSection />
        <CTA />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
