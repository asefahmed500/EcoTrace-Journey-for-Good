
"use client";

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, Leaf, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type CarbonCalculatorState = {
  results?: any[];
  newAchievements?: any[];
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const initialState: CarbonCalculatorState = {};


const formSchema = z.object({
  origin: z.string().trim().min(3, { message: 'Origin must be at least 3 characters.' }),
  destination: z.string().trim().min(3, { message: 'Destination must be at least 3 characters.' }),
  modeOfTransport: z.string().min(1, { message: 'Please select a transport mode.' }),
  vehicleType: z.string().optional(),
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Leaf className="mr-2 h-4 w-4" />}
      Calculate & Log Journey
    </Button>
  );
}

export function JourneyLogForm() {
    const [state, setState] = React.useState<CarbonCalculatorState>(initialState);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { toast } = useToast();
    const router = useRouter();


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      origin: '',
      destination: '',
      modeOfTransport: 'driving',
      vehicleType: '',
    },
  });

  const formValues = form.watch();

  useEffect(() => {
    // This effect can be used for debugging or other side effects based on form values
  }, [formValues]);


  const onFormSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setState(initialState);
    try {
        const response = await fetch('/api/carbon/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            setState({ error: result.error || "An unexpected error occurred", fieldErrors: result.fieldErrors });
            toast({
                variant: 'destructive',
                title: 'Calculation Failed',
                description: result.error || "Please check your input and try again."
            })
            return;
        }
        
        setState({ results: result.results, newAchievements: result.newAchievements });
        
        if (result.newAchievements && result.newAchievements.length > 0) {
            result.newAchievements.forEach((achievement: any) => {
                toast({
                title: "Achievement Unlocked! 🎉",
                description: `You've earned the "${achievement.name}" badge.`,
                })
            })
        }

        form.reset();
        // Manually revalidate relevant parts of the app
        router.refresh();

    } catch (error) {
        const errMessage = 'An unexpected network error occurred.';
        setState({ error: errMessage });
        toast({ variant: 'destructive', title: 'Error', description: errMessage });
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Carbon Calculator</CardTitle>
        <CardDescription>Compare route options and estimate the CO2 emissions of your journey.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origin</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., San Francisco, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Los Angeles, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="modeOfTransport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode of Transport</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a mode of transport" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="driving">Driving</SelectItem>
                      <SelectItem value="public transit">Public Transit</SelectItem>
                      <SelectItem value="cycling">Cycling</SelectItem>
                      <SelectItem value="walking">Walking</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vehicleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Type (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Gasoline Car, EV" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
             <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Leaf className="mr-2 h-4 w-4" />}
                Calculate & Log Journey
            </Button>
            {state.error && (
               <Alert variant="destructive" className="w-full">
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            {state.results && state.results.length > 0 && (
              <div className="w-full space-y-4">
                 <h3 className="text-lg font-semibold text-center">Route Comparison</h3>
                 {state.results.map((res, index) => (
                     <Alert key={index} variant="default" className={cn(
                         "bg-card-foreground/5 border-card-foreground/10",
                         index === 0 && !state.error && "border-primary/40 bg-primary/5"
                     )}>
                       <Sparkles className={cn("h-4 w-4", (index === 0 && !state.error) ? "text-primary" : "text-muted-foreground")} />
                       <AlertTitle className={cn("font-bold", (index === 0 && !state.error) && "text-primary")}>
                         {(index === 0 && !state.error) ? "Recommended & Logged" : `Alternative Route ${index}`}
                         <span className="font-normal text-muted-foreground ml-2">({res.summary})</span>
                       </AlertTitle>
                       <AlertDescription asChild>
                         <div className="space-y-2 mt-2">
                          <div className="flex justify-between items-center text-sm">
                              <p><strong>Distance:</strong> {res.distance.toFixed(1)} km</p>
                              <p><strong>Duration:</strong> {res.duration} min</p>
                          </div>
                          <p className="font-bold text-lg">{res.carbon.estimatedEmissionsKgCO2.toFixed(2)} kg CO2</p>
                          <p className="text-xs text-muted-foreground flex items-start gap-2 pt-2"><Info className="size-3 shrink-0 mt-0.5" /><span>{res.carbon.calculationDetails}</span></p>
                          <p className="text-xs text-muted-foreground flex items-start gap-2"><Leaf className="size-3 shrink-0 mt-0.5" /><span><strong>Alternatives:</strong> {res.carbon.suggestedAlternatives}</span></p>
                         </div>
                       </AlertDescription>
                     </Alert>
                 ))}
                 {!state.error?.includes('duplicate') && (
                   <p className="text-xs text-muted-foreground text-center pt-2">The recommended route has been logged to your journey history.</p>
                 )}
              </div>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
