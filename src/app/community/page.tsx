import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Globe, Users, Award, Leaf } from "lucide-react";
import Link from "next/link";

const communityStats = [
  {
    icon: <Globe className="size-8 text-primary" />,
    value: "1M+ Tons",
    label: "CO₂ Saved Collectively",
  },
  {
    icon: <Users className="size-8 text-primary" />,
    value: "50,000+",
    label: "Active Eco-Warriors",
  },
  {
    icon: <Award className="size-8 text-primary" />,
    value: "200,000+",
    label: "Achievements Unlocked",
  },
  {
    icon: <Leaf className="size-8 text-primary" />,
    value: "1.2M",
    label: "Green Journeys Logged",
  },
];

const testimonials = [
  {
    name: "Alex Johnson",
    role: "Daily Commuter",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop",
    avatarHint: "smiling man",
    text: "Being part of the EcoTrace community has been a game-changer. Seeing the collective impact we're all making together is incredibly motivating. My small choices feel like part of something big.",
  },
  {
    name: "Maria Garcia",
    role: "Student",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
    avatarHint: "young woman portrait",
    text: "I love the team challenges! My friends and I created a group and we compete to see who can have the greenest week. It's fun, educational, and we're actually making a difference.",
  },
];


export default function CommunityPage() {
  return (
    <div className="bg-muted/20">
      <div className="container py-16 md:py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Join a Movement of Changemakers
        </h1>
        <p className="mt-4 mx-auto max-w-2xl text-lg text-muted-foreground">
          You&apos;re not alone on this journey. The EcoTrace community is a growing global network of individuals, teams, and organizations committed to creating a sustainable future, one trip at a time.
        </p>
        <div className="mt-8">
            <Button asChild size="lg">
                <Link href="/login">Become an Eco-Warrior</Link>
            </Button>
        </div>
      </div>

      <div className="py-16 bg-background">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {communityStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex justify-center mb-4">{stat.icon}</div>
                <p className="text-3xl lg:text-4xl font-bold">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-16 md:py-24">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Stories from the Community</h2>
            <p className="mt-2 text-muted-foreground">Hear from fellow EcoTrace users making a difference.</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
             <Card key={testimonial.name} className="flex flex-col justify-between">
              <CardContent className="pt-6">
                <blockquote className="text-lg text-foreground mb-6">
                  &ldquo;{testimonial.text}&rdquo;
                </blockquote>
              </CardContent>
              <div className="bg-muted/50 p-6 flex items-center gap-4 rounded-b-lg">
                <Avatar>
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.avatarHint} />
                  <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
