import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart, Map, Award, Users, GitBranch, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: <Map className="size-8 text-primary" />,
    title: "Carbon Tracking",
    description: "Automatically track emissions from your daily journeys, whether you're driving, on public transit, or cycling.",
  },
  {
    icon: <GitBranch className="size-8 text-primary" />,
    title: "AI-Powered Routing",
    description: "Our AI suggests optimal departure times and eco-friendly routes to minimize your carbon footprint.",
  },
  {
    icon: <BarChart className="size-8 text-primary" />,
    title: "Impact Analytics",
    description: "Visualize your progress with detailed dashboards and see your environmental impact over time.",
  },
  {
    icon: <Award className="size-8 text-primary" />,
    title: "Gamified Achievements",
    description: "Earn badges and climb leaderboards for your eco-friendly choices, making sustainability fun and rewarding.",
  },
  {
    icon: <Users className="size-8 text-primary" />,
    title: "Community Challenges",
    description: "Join team challenges and compete with others to see who can save the most CO2.",
  },
  {
    icon: <ShieldCheck className="size-8 text-primary" />,
    title: "Privacy First",
    description: "Your data is yours. We provide powerful insights while respecting your privacy every step of the way.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="container py-24 sm:py-32">
      <div className="text-center mb-16">
        <h2 className="text-lg text-primary font-semibold uppercase tracking-wider">Features</h2>
        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Everything You Need to Make a Difference
        </p>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          EcoTrace is packed with powerful features designed to make tracking and reducing your carbon footprint simple and engaging.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <Card key={feature.title} className="bg-card-foreground/5 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                {feature.icon}
              </div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
