import { Footprints, GitMerge, LineChart, Award, Users } from "lucide-react";
import React from 'react';

const steps = [
  {
    icon: <Footprints className="size-8 text-primary-foreground" />,
    title: "1. Log Your Journeys",
    description: "Enter your start and end locations and mode of transport into the calculator. Our system fetches real-time route data from Google Maps to ensure accuracy.",
  },
  {
    icon: <GitMerge className="size-8 text-primary-foreground" />,
    title: "2. Analyze & Compare",
    description: "EcoTrace instantly calculates the CO₂ emissions for your trip, considering factors like vehicle type, traffic, and even weather. Compare alternative routes and see how small changes can make a big impact.",
  },
  {
    icon: <LineChart className="size-8 text-primary-foreground" />,
    title: "3. Track Your Progress",
    description: "Every logged journey contributes to your personal analytics dashboard. Visualize your emissions over time, see your most-used transport modes, and identify patterns in your travel habits.",
  },
  {
    icon: <Award className="size-8 text-primary-foreground" />,
    title: "4. Earn & Compete",
    description: "Stay motivated by unlocking achievements for reaching milestones. From your first zero-emission trip to traveling 1000km, our gamified system makes sustainability a rewarding adventure.",
  },
  {
    icon: <Users className="size-8 text-primary-foreground" />,
    title: "5. Make a Collective Impact",
    description: "Join or create a team to see how your collective efforts add up. Compete in challenges, climb the leaderboards, and share your successes with a community of like-minded eco-warriors.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          From A to Green: A Simple Path to Impact
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          EcoTrace makes it easy to understand and reduce your carbon footprint. Follow these simple steps to turn your daily travel into meaningful climate action.
        </p>
      </div>

      <div className="relative mt-16">
        <div className="hidden lg:block absolute left-1/2 top-0 w-0.5 h-full bg-border -translate-x-1/2" />

        <div className="space-y-16">
          {steps.map((step, index) => (
            <div key={step.title} className="grid lg:grid-cols-2 gap-12 items-center">
              <div className={`flex flex-col items-center text-center lg:items-end lg:text-right ${index % 2 === 1 ? 'lg:order-2 lg:items-start lg:text-left' : ''}`}>
                <div className="relative mb-4">
                  <div className="flex items-center justify-center size-16 rounded-full bg-primary text-primary-foreground shadow-lg">
                    {step.icon}
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-2">{step.title}</h2>
                <p className="text-muted-foreground max-w-md">{step.description}</p>
              </div>

              <div className={`flex items-center justify-center ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                 <div className="w-full max-w-[500px] h-[350px] bg-muted/30 rounded-lg shadow-xl flex items-center justify-center p-8">
                    {React.cloneElement(step.icon, {
                        className: 'size-32 text-primary opacity-20',
                    })}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
