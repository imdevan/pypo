import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export const Hero = () => {
  return (
    <section className="min-h-[90vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-5xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
            🐍 + 🏃🏻‍♂️ = ❤️
          </h1>
          <h2 className="text-4xl md:text-6xl font-light text-gradient">
            PyPo
          </h2>
        </div>
        
        <p className="text-xl md:text-2xl font-light text-muted-foreground max-w-3xl mx-auto">
          A silly name for serious business. Ship fullstack apps with Python + Expo.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <a 
            href="https://github.com/imdevan/pypo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group"
          >
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground transition-all duration-300 hard-shadow relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Github className="h-5 w-5" />
                Get Started
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--gradient-1))] via-[hsl(var(--gradient-2))] to-[hsl(var(--gradient-3))] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </a>
          
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg px-8 py-6 border-2 border-border hover:bg-muted transition-colors hard-shadow"
          >
            Watch Demo
          </Button>
        </div>
      </div>
    </section>
  );
};
