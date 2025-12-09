import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LifeBuoy, FileQuestion, MessageSquare } from "lucide-react";

const faqs = [
  {
    question: "How is the carbon footprint calculated?",
    answer: "Our calculations are based on standard emission factors for different modes of transport, vehicle types, and fuel sources. We combine this with real-time data from Google Maps for distance and duration, and our AI model adjusts for factors like traffic, weather, and public transit load to provide the most accurate estimate possible."
  },
  {
    question: "Is my personal data safe?",
    answer: "Yes. We prioritize your privacy. All personal data is encrypted, and we give you full control over your information. You can export or delete your data at any time. We do not sell your personal information to third parties."
  },
  {
    question: "Can I use EcoTrace for my company?",
    answer: "Absolutely! Our Team and Enterprise plans are designed for organizations of all sizes. They include features like team dashboards, private leaderboards, and corporate challenges to help you drive sustainability initiatives."
  },
  {
    question: "How do I earn achievements?",
    answer: "Achievements are automatically awarded when you meet certain milestones, such as logging your first journey, using a new mode of transport, or traveling a specific total distance. You can view all your earned badges on your dashboard and profile."
  },
  {
    question: "What if I can&apos;t find a specific mode of transport?",
    answer: "We currently support driving, public transit, cycling, and walking. For driving, you can specify vehicle type (e.g., EV, hybrid, SUV) in the optional field for a more accurate calculation. We are always working on adding more options."
  },
];

export default function SupportPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
            <LifeBuoy className="size-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Support Center
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We&apos;re here to help. Find answers to frequently asked questions or get in touch with our support team.
        </p>
      </div>

      <div className="mt-16 grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <FileQuestion className="size-6" />
                        <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>

        <div>
            <Card>
                 <CardHeader>
                    <div className="flex items-center gap-3">
                        <MessageSquare className="size-6" />
                        <CardTitle className="text-2xl">Contact Us</CardTitle>
                    </div>
                    <CardDescription>
                        Can&apos;t find an answer? Send us a message.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name">Name</label>
                        <Input id="name" placeholder="Your Name" />
                    </div>
                     <div className="space-y-2">
                        <label htmlFor="email">Email</label>
                        <Input id="email" type="email" placeholder="your.email@example.com" />
                    </div>
                     <div className="space-y-2">
                        <label htmlFor="message">Message</label>
                        <Textarea id="message" placeholder="How can we help you?" />
                    </div>
                    <Button className="w-full">Send Message</Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
