import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Leaf, Target, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const team = [
  {
    name: "John Carter",
    role: "Founder & CEO",
    avatar: "https://images.unsplash.com/photo-1627161683011-c883de44d06d?q=80&w=100&auto=format&fit=crop",
    avatarHint: "professional man"
  },
  {
    name: "Jane Doe",
    role: "Chief Technology Officer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
    avatarHint: "professional woman"
  },
  {
    name: "Michael Chen",
    role: "Head of Product",
    avatar: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?q=80&w=100&auto=format&fit=crop",
    avatarHint: "man headshot"
  },
  {
    name: "Sarah Kim",
    role: "Lead Environmental Scientist",
    avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=100&auto=format&fit=crop",
    avatarHint: "woman headshot"
  }
];

export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="container py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
                 <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                    Our Mission: Turn Every Journey into a Step Towards a Greener Planet
                </h1>
                <p className="mt-6 text-lg text-muted-foreground">
                    EcoTrace was founded on a simple but powerful idea: that technology can empower individuals and communities to make a tangible, positive impact on the environment. We believe that by making carbon footprint data accessible, understandable, and actionable, we can collectively shift our travel habits towards a more sustainable future.
                </p>
            </div>
            <div>
                 <Image
                    src="https://images.unsplash.com/photo-1516542076529-1ea3854896f2?q=80&w=600&h=400&auto=format&fit=crop"
                    alt="Team working on a project"
                    width={600}
                    height={400}
                    className="rounded-lg shadow-xl"
                    data-ai-hint="diverse team planning"
                  />
            </div>
        </div>
      </div>
      
      <div className="py-16 md:py-24 bg-muted/30">
        <div className="container">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold">Our Core Values</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-6">
                    <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                        <Leaf className="size-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Sustainability</h3>
                    <p className="mt-2 text-muted-foreground">Every feature we build is designed to promote and support environmentally-conscious choices.</p>
                </div>
                 <div className="text-center p-6">
                    <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                        <Target className="size-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Impact</h3>
                    <p className="mt-2 text-muted-foreground">We focus on providing tools that lead to measurable reductions in carbon emissions for our users and partners.</p>
                </div>
                 <div className="text-center p-6">
                    <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                        <Users className="size-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Community</h3>
                    <p className="mt-2 text-muted-foreground">We believe that collective action is the key to solving global challenges. Our platform is built to foster collaboration.</p>
                </div>
            </div>
        </div>
      </div>

      <div className="container py-16 md:py-24">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Meet the Team</h2>
            <p className="mt-2 text-muted-foreground">The passionate individuals dedicated to building a sustainable future.</p>
        </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {team.map((member) => (
            <div key={member.name} className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.avatarHint} />
                <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
      
       <div className="py-16 md:py-24 bg-primary/5">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to Join Our Mission?
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Become part of the EcoTrace community and start making a difference today.
          </p>
          <div className="mt-10">
            <Button asChild size="lg">
              <Link href="/login">Get Started for Free</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
