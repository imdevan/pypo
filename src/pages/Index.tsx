import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { CodeShowcase } from "@/components/CodeShowcase";
import { VideoSection } from "@/components/VideoSection";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

const Index = () => {
  const [navVisible, setNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (currentScrollY / scrollHeight) * 100;
      
      if (Math.abs(currentScrollY - lastScrollY) > scrollHeight * 0.25) {
        setNavVisible(currentScrollY < lastScrollY);
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen bg-background">
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b-2 border-border transition-transform duration-300 ${
          navVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
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
        <CodeShowcase />
        <VideoSection />
        <CTA />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
