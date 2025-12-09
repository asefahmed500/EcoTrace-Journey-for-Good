import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Sarah L.",
    role: "Daily Commuter",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
    avatarHint: "woman smiling",
    text: "EcoTrace has completely changed how I think about my commute. Seeing the actual CO2 numbers for each trip motivates me to choose my bike over my car. The gamification makes it so much fun!",
  },
  {
    name: "Michael B.",
    role: "Urban Planner",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop",
    avatarHint: "man professional",
    text: "As an urban planner, I&apos;m blown away by the potential of EcoTrace. The community impact features provide invaluable insights. It&apos;s a powerful tool for both individuals and cities.",
  },
  {
    name: "GreenTech Corp",
    role: "Corporate Partner",
    avatar: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=100&auto=format&fit=crop",
    avatarHint: "green logo",
    text: "We implemented EcoTrace for our company-wide 'Go Green' challenge. Employee engagement was off the charts, and we collectively reduced our carbon footprint by 15% in just one month!",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-background py-24 sm:py-32">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-lg text-primary font-semibold uppercase tracking-wider">Testimonials</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Loved by Eco-Warriors Worldwide
          </p>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Don&apos;t just take our word for it. Here&apos;s what our users are saying about their journey with EcoTrace.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="flex flex-col justify-between">
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
    </section>
  );
}
