import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CtaSection() {
  return (
    <section id="cta" className="bg-muted/50 py-24 sm:py-32">
      <div className="container text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Ready to Start Your Eco-Journey?
        </h2>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          Join thousands of users making a positive impact on the planet. Sign up for free and take the first step towards a greener future.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg">
            <Link href="/login">Get Started for Free</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/features">Learn More &rarr;</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
