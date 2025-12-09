
"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlacesAutocompleteInput } from '@/components/ui/places-autocomplete-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, Clock, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type PredictiveRoutingState = {
  result?: any;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const initialState: PredictiveRoutingState = {};

const formSchema = z.object({
  origin: z.string().trim().min(3, { message: 'Origin must be at least 3 characters.' }),
  destination: z.string().trim().min(3, { message: 'Destination must be at least 3 characters.' }),
  transportMode: z.string().min(1, { message: 'Please select a transport mode.' }),
});


export function PredictiveRoutingForm() {
  const [state, setState] = useState<PredictiveRoutingState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      origin: '',
      destination: '',
      transportMode: 'driving',
    },
  });

  const onFormSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setState({}); // Clear previous results
    try {
        const response = await fetch('/api/ai/predict-route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();

        if (!response.ok) {
            setState({ error: result.error, fieldErrors: result.fieldErrors });
             toast({
                variant: 'destructive',
                title: 'Prediction Failed',
                description: result.error || "Please check your input and try again."
            })
            return;
        }

        setState({ result });
        form.reset();

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
        <CardTitle>Predictive Routing</CardTitle>
        <CardDescription>Find the best departure times to minimize emissions.</CardDescription>
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
                      <PlacesAutocompleteInput
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        placeholder="e.g., Downtown"
                        disabled={isSubmitting}
                      />
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
                      <PlacesAutocompleteInput
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        placeholder="e.g., Airport"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="transportMode"
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
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
                Find Optimal Times
            </Button>
            {state.result && (
               <Alert variant="default" className="bg-accent/10 border-accent/20">
                <Sparkles className="h-4 w-4 text-accent-foreground" />
                <AlertTitle className="text-accent-foreground">Optimal Departure Times</AlertTitle>
                <AlertDescription className="space-y-2">
                  <div className="flex flex-wrap gap-2 my-2">
                      {state.result.optimalDepartureTimes.map((time: string) => (
                          <span key={time} className="bg-accent/20 text-accent-foreground font-mono p-2 rounded-md text-lg">{time}</span>
                      ))}
                  </div>
                  <p className="text-sm flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>{state.result.reasoning}</span></p>
                </AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
