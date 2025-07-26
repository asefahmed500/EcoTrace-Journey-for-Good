import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Map, GitBranch, LineChart, Award, Users, Zap, Search, ShieldCheck } from "lucide-react";
import React from 'react';

const features = [
  {
    icon: <Map className="size-10 text-primary" />,
    title: "Carbon Footprint Tracking",
    description: "Effortlessly log your daily travel—whether by car, public transit, bike, or on foot. Our system uses real-time data to accurately calculate the CO₂ emissions for each journey, giving you a clear picture of your environmental impact.",
  },
  {
    icon: <GitBranch className="size-10 text-primary" />,
    title: "AI-Powered Predictive Routing",
    description: "Our intelligent algorithms analyze traffic patterns to suggest the most eco-friendly departure times. Reduce your fuel consumption and emissions by avoiding congestion and choosing the greenest path.",
  },
  {
    icon: <LineChart className="size-10 text-primary" />,
    title: "Personalized Impact Analytics",
    description: "Dive deep into your travel data with our interactive dashboard. Visualize your progress, track trends over time, and understand how your choices contribute to a healthier planet. See your emissions by mode, distance, and more.",
  },
  {
    icon: <Award className="size-10 text-primary" />,
    title: "Gamified Achievements & Leaderboards",
    description: "Stay motivated on your eco-journey with fun, gamified elements. Unlock badges for reaching milestones, complete challenges, and see how you rank against friends and the global community. Making a difference has never been more rewarding.",
  },
  {
    icon: <Users className="size-10 text-primary" />,
    title: "Team & Corporate Challenges",
    description: "Collaborate with colleagues or friends in team-based challenges. Compete to see who can save the most CO₂, fostering a spirit of collective action and making a larger, combined impact.",
  },
  {
    icon: <Zap className="size-10 text-primary" />,
    title: "EV & Green Infrastructure Tools",
    description: "Own an electric vehicle? Find nearby charging stations with real-time availability. Our platform is continuously updated with tools to support and encourage all forms of sustainable transport.",
  },
  {
    icon: <Search className="size-10 text-primary" />,
    title: "Community Impact Analysis",
    description: "Go beyond personal tracking. Use our AI tools to identify areas in your community that would benefit most from improved public transportation, helping to advocate for meaningful, data-driven urban planning changes.",
  },
  {
    icon: <ShieldCheck className="size-10 text-primary" />,
    title: "Privacy and Data Security",
    description: "Your data is yours. We are committed to the highest standards of privacy, giving you full control over your information. Track your impact with the peace of mind that your data is secure and anonymized.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Powerful Features for a Greener Tomorrow
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          EcoTrace is more than just a calculator. It's a comprehensive toolkit designed to empower you with the insights and motivation needed to make a real-world impact.
        </p>
      </div>

      <div className="mt-16 space-y-24">
        {features.map((feature, index) => (
          <div key={feature.title} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-row-dense' : ''}`}>
            <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
              <div className="mb-4 flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                    {feature.icon}
                </div>
                <h2 className="text-3xl font-bold">{feature.title}</h2>
              </div>
              <p className="text-lg text-muted-foreground">
                {feature.description}
              </p>
            </div>
            <div className="flex items-center justify-center">
               <div className="w-full max-w-md h-80 bg-muted/30 rounded-lg shadow-xl flex items-center justify-center p-8 border">
                  {React.cloneElement(feature.icon, {
                      className: 'size-32 md:size-48 text-primary opacity-20',
                  })}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
