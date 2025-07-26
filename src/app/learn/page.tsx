import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, TreeDeciduous, Car, Wind, Users, Factory } from "lucide-react";
import Link from "next/link";
import React from 'react';

const articles = [
  {
    title: "Understanding Your Carbon Footprint",
    description: "What exactly is a carbon footprint and how is it calculated? This guide breaks down the basics.",
    icon: <BookOpen className="size-6 text-primary" />,
    bigIcon: <BookOpen className="size-24 text-primary opacity-20" />,
    href: "#",
  },
  {
    title: "The Power of Sustainable Transportation",
    description: "Discover how choosing to walk, bike, or use public transit can have a massive positive impact on the environment.",
    icon: <TreeDeciduous className="size-6 text-primary" />,
    bigIcon: <TreeDeciduous className="size-24 text-primary opacity-20" />,
    href: "#",
  },
  {
    title: "EVs, Hybrids, and Gasoline: A Comparison",
    description: "A deep dive into the real-world emissions of different vehicle types, including the impact of electricity grids on EVs.",
    icon: <Car className="size-6 text-primary" />,
    bigIcon: <Car className="size-24 text-primary opacity-20" />,
    href: "#",
  },
   {
    title: "How Traffic Congestion Affects Emissions",
    description: "Learn the science behind why stop-and-go traffic is so bad for the environment and how to plan around it.",
    icon: <Wind className="size-6 text-primary" />,
    bigIcon: <Wind className="size-24 text-primary opacity-20" />,
    href: "#",
  },
  {
    title: "The Role of Public Transit in Modern Cities",
    description: "Explore the importance of robust public transportation systems for creating greener, more equitable cities.",
    icon: <Users className="size-6 text-primary" />,
    bigIcon: <Users className="size-24 text-primary opacity-20" />,
    href: "#",
  },
  {
    title: "Beyond Transportation: Other Ways to Reduce Your Footprint",
    description: "Your journey is just one part. Learn about other lifestyle changes that can contribute to a healthier planet.",
    icon: <Factory className="size-6 text-primary" />,
    bigIcon: <Factory className="size-24 text-primary opacity-20" />,
    href: "#",
  },
];

export default function LearnPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Knowledge is Power
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Empower yourself with knowledge about climate change, sustainability, and how your choices can make a difference. Explore our curated resources to become a more informed eco-warrior.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <Link href={article.href} key={article.title} className="group block">
            <Card className="h-full overflow-hidden transition-all group-hover:shadow-xl group-hover:border-primary/30 flex flex-col">
                <div className="w-full h-48 bg-muted/30 flex items-center justify-center border-b">
                  {article.bigIcon}
                </div>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        {article.icon}
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{article.title}</CardTitle>
                    </div>
                </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>
                  {article.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
