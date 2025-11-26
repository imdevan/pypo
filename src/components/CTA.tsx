import { Button } from "@/components/ui/button";
import { Github, ArrowRight } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-24 px-4 bg-muted/30">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-6xl font-bold">
            Ready to ship?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Clone the repo, run the setup, and start building your next big thing.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
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
                <span className="inline-flex">
                  {"View on GitHub".split("").map((char, i) => (
                    <span 
                      key={i} 
                      className="inline-block group-hover:animate-bounce"
                      style={{ 
                        animationDelay: `${i * 0.05}s`,
                        animationDuration: '0.6s'
                      }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--gradient-1))] via-[hsl(var(--gradient-2))] to-[hsl(var(--gradient-3))] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </a>
          
          <a 
            href="https://github.com/imdevan/pypo#quick-start" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 border-2 border-border hover:bg-muted transition-colors hard-shadow group"
            >
              Quick Start Guide
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
        </div>
        
        <div className="pt-8">
          <p className="text-sm text-muted-foreground">
            MIT License • Free and Open Source
          </p>
        </div>
      </div>
    </section>
  );
};
