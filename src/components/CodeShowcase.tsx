import { useState, useEffect } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/themes/prism-tomorrow.css";

const codeExamples = [
  {
    title: "Backend",
    comment: "# fully dockerized environment",
    code: `cd app/backend/
docker compose up --build # to seed the db`
  },
  {
    title: "Frontend",
    comment: "# run the expo project",
    code: `yarn i
yarn dev`
  },
  {
    title: "Build",
    comment: "# turbo package manager",
    code: `turbo build`
  }
];

export const CodeShowcase = () => {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    Prism.highlightAll();
  }, [activeTab]);

  return (
    <section className="py-24 px-4 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Quick to start
          </h2>
          <p className="text-xl text-muted-foreground">
            Get up and running in seconds with our battle-tested setup
          </p>
        </div>

        <div className="border-2 border-border hard-shadow bg-card">
          <div className="flex border-b-2 border-border">
            {codeExamples.map((example, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-6 py-3 font-medium transition-colors border-r-2 border-border last:border-r-0 ${
                  activeTab === index
                    ? "bg-foreground text-background"
                    : "bg-card hover:bg-muted"
                }`}
              >
                {example.title}
              </button>
            ))}
          </div>

          <div className="p-6">
            <div className="text-gradient font-bold mb-3 text-sm">
              {codeExamples[activeTab].comment}
            </div>
            <pre className="!bg-transparent !p-0 !m-0">
              <code className="language-bash !text-sm">
                {codeExamples[activeTab].code}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};
