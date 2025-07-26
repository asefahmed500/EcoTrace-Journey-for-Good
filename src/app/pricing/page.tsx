import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Individual",
    price: "Free",
    priceDetail: "For personal use",
    description: "Start your journey to a smaller carbon footprint today. Perfect for individuals who want to track their impact.",
    features: [
      "Unlimited Journey Tracking",
      "AI-Powered Route Suggestions",
      "Personal Analytics Dashboard",
      "Gamified Achievements",
      "Community Leaderboard Access",
    ],
    cta: "Get Started for Free",
    href: "/login",
    isFeatured: false,
  },
  {
    name: "Team",
    price: "$49",
    priceDetail: "per month",
    description: "Collaborate with your group or small organization to make a collective impact. Ideal for small businesses, clubs, or groups of friends.",
    features: [
      "All Individual features",
      "Up to 25 members",
      "Team-based Dashboard",
      "Private Team Leaderboards",
      "Custom Team Challenges",
      "Priority Support",
    ],
    cta: "Choose Team Plan",
    href: "#",
    isFeatured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    priceDetail: "for your organization",
    description: "Drive sustainability initiatives across your entire organization with powerful tools, analytics, and dedicated support.",
    features: [
      "All Team features",
      "Unlimited Members",
      "Organization-wide Analytics",
      "API Access for Integrations",
      "Dedicated Account Manager",
      "Single Sign-On (SSO)",
    ],
    cta: "Contact Sales",
    href: "/support",
    isFeatured: false,
  },
];

export default function PricingPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Choose Your Plan, Amplify Your Impact
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Whether you're an individual, a small team, or a large organization, we have a plan that fits your needs.
        </p>
      </div>

      <div className="mt-16 grid lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col ${plan.isFeatured ? 'border-primary ring-2 ring-primary' : ''}`}>
            <CardHeader className="flex-grow">
              {plan.isFeatured && <div className="text-center bg-primary text-primary-foreground text-sm font-bold py-1 rounded-t-lg -mt-6 mx-[-1px]">MOST POPULAR</div>}
              <CardTitle className="text-2xl pt-4">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground"> {plan.priceDetail}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="size-5 text-primary mr-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild size="lg" className="w-full" variant={plan.isFeatured ? 'default' : 'outline'}>
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
