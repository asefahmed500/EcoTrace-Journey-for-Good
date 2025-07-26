import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Users, Bike, Lock } from "lucide-react";
import React from 'react';

const featuredPost = {
  title: "The Future is Green: How AI is Revolutionizing Sustainable Travel",
  description: "Artificial intelligence is no longer science fiction; it's a powerful tool in the fight against climate change. Discover how EcoTrace is leveraging AI to provide smarter, greener routing and help users make impactful decisions every day.",
  icon: <BrainCircuit className="size-32 md:size-48 text-primary opacity-20" />,
  author: "Jane Doe",
  authorRole: "Chief Technology Officer",
  authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
  authorAvatarHint: "professional woman",
  date: "October 26, 2023",
  category: "Technology",
  href: "#"
};

const posts = [
  {
    title: "Our 2023 Community Impact Report",
    description: "A look back at the incredible achievements of the EcoTrace community over the past year. See the numbers and read the stories behind our collective success.",
    icon: <Users className="size-24 text-primary opacity-20" />,
    category: "Community",
    href: "#"
  },
  {
    title: "5 Simple Ways to Reduce Your Commute's Carbon Footprint",
    description: "Think you can't make a difference on your daily commute? Think again. Here are five easy-to-implement tips that can drastically lower your emissions.",
    icon: <Bike className="size-24 text-primary opacity-20" />,
    category: "Tips & Tricks",
    href: "#"
  },
  {
    title: "Why We Championed Privacy from Day One",
    description: "In a world of data, privacy matters. Learn about our philosophy on data ownership and the steps we take to ensure your information is always secure and under your control.",
    icon: <Lock className="size-24 text-primary opacity-20" />,
    category: "Company",
    href: "#"
  }
];

export default function BlogPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          The EcoTrace Blog
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          News, insights, and stories from the front lines of sustainable technology and community action.
        </p>
      </div>

      <div className="mt-16">
        <Link href={featuredPost.href} className="group block">
        <Card className="grid lg:grid-cols-2 overflow-hidden transition-all hover:shadow-xl hover:border-primary/30">
          <div className="p-8 flex flex-col justify-between">
            <div>
              <Badge variant="outline" className="mb-2">{featuredPost.category}</Badge>
              <CardTitle className="text-3xl font-bold group-hover:text-primary transition-colors">{featuredPost.title}</CardTitle>
              <CardDescription className="mt-4 text-base">
                {featuredPost.description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4 mt-6">
               <Avatar>
                  <AvatarImage src={featuredPost.authorAvatar} alt={featuredPost.author} data-ai-hint={featuredPost.authorAvatarHint} />
                  <AvatarFallback>{featuredPost.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{featuredPost.author}</p>
                    <p className="text-sm text-muted-foreground">{featuredPost.authorRole} &middot; {featuredPost.date}</p>
                </div>
            </div>
          </div>
          <div className="min-h-[250px] lg:min-h-full bg-muted/30 flex items-center justify-center p-8 border-l">
             {featuredPost.icon}
          </div>
        </Card>
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link href={post.href} key={post.title} className="group block">
            <Card className="h-full overflow-hidden transition-all group-hover:shadow-xl group-hover:border-primary/30 flex flex-col">
                <div className="w-full h-48 bg-muted/30 flex items-center justify-center">
                    {post.icon}
                </div>
                <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2">{post.category}</Badge>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{post.title}</CardTitle>
                </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>
                  {post.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
       <div className="mt-16 text-center">
            <Button variant="outline" size="lg">Load More Posts</Button>
       </div>
    </div>
  );
}
