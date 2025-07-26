import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footprints, GitMerge, LineChart } from "lucide-react";

const steps = [
  {
    icon: <Footprints className="size-8 text-primary" />,
    title: "Log Your Journeys",
    description: "Simply enter your start and end points, and let our AI calculate your route's carbon footprint based on your mode of transport.",
  },
  {
    icon: <GitMerge className="size-8 text-primary" />,
    title: "Get Smart Suggestions",
    description: "Receive AI-powered recommendations for greener routes, alternative transport, and optimal departure times to reduce emissions.",
  },
  {
    icon: <LineChart className="size-8 text-primary" />,
    title: "Track Your Impact",
    description: "Visualize your progress on your personal dashboard. Watch your carbon savings grow and earn achievements along the way.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-muted/50 py-24 sm:py-32">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-lg text-primary font-semibold uppercase tracking-wider">How It Works</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Go from A to Green in 3 Simple Steps
          </p>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Start reducing your carbon footprint today with our intuitive platform.
          </p>
        </div>
        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2" />
          <div className="grid lg:grid-cols-3 gap-12 relative">
            {steps.map((step, index) => (
              <div key={step.title} className="flex flex-col items-center text-center">
                 <div className="relative mb-6">
                    <div className="flex items-center justify-center size-16 rounded-full bg-background border-2 border-primary shadow-lg">
                        {step.icon}
                    </div>
                </div>
                <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
