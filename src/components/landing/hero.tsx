import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlayCircle, Footprints } from "lucide-react";

export function Hero() {
  return (
    <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
      <div className="text-center lg:text-start space-y-6">
        <main className="text-5xl md:text-6xl font-bold">
          <h1 className="inline">
            Turn Every Journey Into{" "}
            <span className="inline bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Climate Action
            </span>
          </h1>
        </main>
        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
          Track, reduce, and gamify your carbon footprint with AI-powered journey insights. Make a real impact, one trip at a time.
        </p>
        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <Button className="w-full md:w-1/3 text-lg" asChild>
            <Link href="/login">Start Your Eco Journey</Link>
          </Button>
          <Button variant="outline" className="w-full md:w-1/3 text-lg" asChild>
            <Link href="#">
              <PlayCircle className="mr-2" />
              Watch Demo
            </Link>
          </Button>
        </div>
      </div>

      <div className="z-10">
        <div className="w-[300px] h-[300px] lg:w-[450px] lg:h-[450px] bg-muted/50 rounded-full flex items-center justify-center border-8 border-background shadow-2xl">
          <Footprints className="size-48 lg:size-72 text-primary/80" strokeWidth={1} />
        </div>
      </div>

      <div className="hidden lg:block shadow-inner-glow absolute -z-10 top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-background to-background" />
    </section>
  );
}
