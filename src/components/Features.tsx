import { Code, Zap, Package, Shield, Database, Box } from "lucide-react";

const features = [
  {
    icon: Code,
    title: "Full-Stack Type Safety",
    description: "Python-driven database models with end-to-end type safety across your entire stack."
  },
  {
    icon: Zap,
    title: "FastAPI Powered",
    description: "Lightning-fast Python backend with Swagger docs and DB admin built right in."
  },
  {
    icon: Package,
    title: "Battle-Tested Frontend",
    description: "React Native boilerplate from Infinite Red's Ignite Expo—production ready from day one."
  },
  {
    icon: Shield,
    title: "Docker Ready",
    description: "Complete Docker setup included. Deploy anywhere with confidence."
  },
  {
    icon: Database,
    title: "Modern Python Stack",
    description: "SQLModel, Alembic, and FastAPI working in perfect harmony for your backend needs."
  },
  {
    icon: Box,
    title: "Turborepo Management",
    description: "Monorepo architecture with Turborepo for lightning-fast builds and caching."
  }
];

export const Features = () => {
  return (
    <section className="py-24 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Everything you need.<br />Nothing you don't.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start building instead of configuring. PyPo gives you the tools to ship fast.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-6 bg-card border-2 border-border hard-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200"
            >
              <feature.icon className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
