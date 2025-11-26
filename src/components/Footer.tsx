import { Github } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t-2 border-border py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-2xl font-bold mb-1">PyPo</p>
            <p className="text-sm text-muted-foreground">
              Python + Expo = ❤️
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/imdevan/pypo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-6 w-6" />
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            Built with ❤️ by developers, for developers. MIT Licensed.
          </p>
        </div>
      </div>
    </footer>
  );
};
