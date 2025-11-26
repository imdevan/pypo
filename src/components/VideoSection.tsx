export const VideoSection = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            See it in action
          </h2>
          <p className="text-xl text-muted-foreground">
            Watch how PyPo helps you ship fullstack apps in minutes, not days.
          </p>
        </div>
        
        <div className="relative aspect-video bg-muted border-2 border-border hard-shadow">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl">🎬</div>
              <p className="text-muted-foreground">
                Video demo coming soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
