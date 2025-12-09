"use client";

import { useState } from 'react';
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
import { Loader2, Sparkles, Leaf, Info, Clock, Route, Zap, TreePine, Car, Bus, Bike, Footprints } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useDashboardStore } from '@/lib/stores/dashboard-store';

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
  departureTime: z.string().optional(),
  includeAlternatives: z.boolean().optional(),
});

interface JourneyLogFormProps {
  onSuccess?: () => void;
}

export function JourneyLogForm({ onSuccess }: JourneyLogFormProps) {
  const [state, setState] = useState<CarbonCalculatorState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { addJourney, refreshData } = useDashboardStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      origin: '',
      destination: '',
      modeOfTransport: 'driving',
      vehicleType: '',
      departureTime: new Date().toTimeString().slice(0, 5),
      includeAlternatives: true,
    },
  });

  const handleOriginPlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      setOriginCoords({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    }
  };

  const handleDestinationPlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      setDestinationCoords({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    }
  };

  const onFormSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setState(initialState);
    
    try {
      // Include coordinates and additional data in the request
      const requestData = {
        ...data,
        originCoords,
        destinationCoords,
        departureTime: data.departureTime || new Date().toTimeString().slice(0, 5),
        includeAlternatives: data.includeAlternatives !== false,
      };

      const response = await fetch('/api/carbon/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        setState({ error: result.error || "An unexpected error occurred", fieldErrors: result.fieldErrors });
        toast({
          variant: 'destructive',
          title: 'Calculation Failed',
          description: result.error || "Please check your input and try again."
        });
        return;
      }
      
      setState({ results: result.results, newAchievements: result.newAchievements });
      
      // Add journeys to store optimistically
      if (result.results && result.results.length > 0) {
        result.results.forEach((journey: any) => {
          addJourney(journey);
        });
      }
      
      if (result.newAchievements && result.newAchievements.length > 0) {
        result.newAchievements.forEach((achievement: any) => {
          toast({
            title: "Achievement Unlocked! 🎉",
            description: `You've earned the "${achievement.name}" badge.`,
          });
        });
      }

      form.reset();
      setOriginCoords(null);
      setDestinationCoords(null);
      
      // Refresh data to sync with server
      refreshData();
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      }

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
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          Smart Journey Analysis
        </CardTitle>
        <CardDescription>
          Real-time CO2 emissions calculator with multi-modal route suggestions and traffic-optimized alternatives.
        </CardDescription>
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
                        onChange={(value, placeDetails) => {
                          field.onChange(value);
                          if (placeDetails) {
                            handleOriginPlaceSelect(placeDetails);
                          }
                        }}
                        placeholder="e.g., San Francisco, CA"
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
                        onChange={(value, placeDetails) => {
                          field.onChange(value);
                          if (placeDetails) {
                            handleDestinationPlaceSelect(placeDetails);
                          }
                        }}
                        placeholder="e.g., Los Angeles, CA"
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
              name="modeOfTransport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Mode of Transport</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a mode of transport" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="driving">🚗 Driving</SelectItem>
                      <SelectItem value="public transit">🚌 Public Transit</SelectItem>
                      <SelectItem value="cycling">🚴 Cycling</SelectItem>
                      <SelectItem value="walking">🚶 Walking</SelectItem>
                      <SelectItem value="ride-sharing">🚕 Ride-sharing</SelectItem>
                      <SelectItem value="micro-mobility">🛴 E-scooter/E-bike</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Type (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Electric, Hybrid, Gasoline" 
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="departureTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure Time</FormLabel>
                    <FormControl>
                      <Input 
                        type="time"
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {isSubmitting ? 'Analyzing Routes...' : 'Analyze & Log Smart Journey'}
            </Button>
            {state.error && (
               <Alert variant="destructive" className="w-full">
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            {state.results && state.results.length > 0 && (
              <div className="w-full space-y-4">
                 <div className="text-center">
                   <h3 className="text-lg font-semibold">Smart Journey Analysis</h3>
                   <p className="text-sm text-muted-foreground">Compare routes and their environmental impact</p>
                 </div>
                 
                 {state.results.map((res, index) => {
                   const isRecommended = index === 0 && !state.error;
                   const isZeroEmission = res.carbon.estimatedEmissionsKgCO2 === 0;
                   const isLowEmission = res.carbon.estimatedEmissionsKgCO2 < 2;
                   const isMultiModal = res.routeType === 'multi-modal';
                   
                   const getModeIcon = (mode: string) => {
                     switch (mode.toLowerCase()) {
                       case 'driving': return <Car className="h-4 w-4" />;
                       case 'public transit': return <Bus className="h-4 w-4" />;
                       case 'cycling': return <Bike className="h-4 w-4" />;
                       case 'walking': return <Footprints className="h-4 w-4" />;
                       case 'ride-sharing': return <Car className="h-4 w-4" />;
                       case 'micro-mobility': return <Zap className="h-4 w-4" />;
                       default: return <Route className="h-4 w-4" />;
                     }
                   };
                   
                   return (
                     <Alert key={index} variant="default" className={cn(
                         "relative overflow-hidden transition-all hover:shadow-md",
                         isRecommended && "border-primary/40 bg-primary/5",
                         isZeroEmission && "border-green-500/40 bg-green-50/50",
                         isMultiModal && "border-purple-500/40 bg-purple-50/50",
                         !isRecommended && !isZeroEmission && !isMultiModal && isLowEmission && "border-blue-500/40 bg-blue-50/50",
                         !isRecommended && !isZeroEmission && !isMultiModal && !isLowEmission && "border-orange-500/40 bg-orange-50/50"
                     )}>
                       {/* Visual indicator bar */}
                       <div className={cn(
                         "absolute left-0 top-0 bottom-0 w-1",
                         isRecommended && "bg-primary",
                         isZeroEmission && "bg-green-500",
                         isMultiModal && "bg-purple-500",
                         !isRecommended && !isZeroEmission && !isMultiModal && isLowEmission && "bg-blue-500",
                         !isRecommended && !isZeroEmission && !isMultiModal && !isLowEmission && "bg-orange-500"
                       )} />
                       
                       <div className="flex items-start gap-3">
                         <div className={cn(
                           "p-2 rounded-full",
                           isRecommended && "bg-primary/10",
                           isZeroEmission && "bg-green-500/10",
                           isMultiModal && "bg-purple-500/10",
                           !isRecommended && !isZeroEmission && !isMultiModal && isLowEmission && "bg-blue-500/10",
                           !isRecommended && !isZeroEmission && !isMultiModal && !isLowEmission && "bg-orange-500/10"
                         )}>
                           {isZeroEmission ? (
                             <TreePine className="h-5 w-5 text-green-600" />
                           ) : isRecommended ? (
                             <Sparkles className="h-5 w-5 text-primary" />
                           ) : isMultiModal ? (
                             <Route className="h-5 w-5 text-purple-600" />
                           ) : (
                             <Info className="h-5 w-5 text-muted-foreground" />
                           )}
                         </div>
                         
                         <div className="flex-1 space-y-3">
                           <div>
                             <AlertTitle className={cn(
                               "font-bold text-base flex items-center gap-2",
                               isRecommended && "text-primary",
                               isZeroEmission && "text-green-700",
                               isMultiModal && "text-purple-700"
                             )}>
                               {isRecommended ? "✓ Recommended & Logged" : 
                                isZeroEmission ? "🌱 Zero Emission Option" :
                                isMultiModal ? "🔄 Multi-Modal Journey" :
                                `Alternative Route ${index}`}
                               {isZeroEmission && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">ECO</span>}
                               {isMultiModal && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">SMART</span>}
                               {res.trafficLevel === 'high' && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">TRAFFIC</span>}
                             </AlertTitle>
                             <p className="text-sm text-muted-foreground mt-1">{res.summary}</p>
                             
                             {/* Transport mode indicators */}
                             {res.modes && res.modes.length > 1 && (
                               <div className="flex items-center gap-1 mt-2">
                                 {res.modes.map((mode: any, idx: number) => (
                                   <div key={idx} className="flex items-center gap-1">
                                     {getModeIcon(mode)}
                                     <span className="text-xs capitalize">{mode.replace('-', ' ')}</span>
                                     {idx < res.modes.length - 1 && <span className="text-xs text-muted-foreground mx-1">→</span>}
                                   </div>
                                 ))}
                               </div>
                             )}
                           </div>
                           
                           <div className="grid grid-cols-4 gap-3 text-sm">
                             <div className="text-center p-2 bg-background/50 rounded">
                               <p className="font-semibold">{res.distance.toFixed(1)} km</p>
                               <p className="text-xs text-muted-foreground">Distance</p>
                             </div>
                             <div className="text-center p-2 bg-background/50 rounded">
                               <p className="font-semibold">{res.duration} min</p>
                               <p className="text-xs text-muted-foreground">Duration</p>
                             </div>
                             <div className="text-center p-2 bg-background/50 rounded">
                               <p className={cn(
                                 "font-bold text-lg",
                                 isZeroEmission && "text-green-600",
                                 !isZeroEmission && isLowEmission && "text-blue-600",
                                 !isZeroEmission && !isLowEmission && "text-orange-600"
                               )}>
                                 {res.carbon.estimatedEmissionsKgCO2.toFixed(2)}
                               </p>
                               <p className="text-xs text-muted-foreground">kg CO2</p>
                             </div>
                             <div className="text-center p-2 bg-background/50 rounded">
                               <p className={cn(
                                 "font-semibold text-sm",
                                 res.trafficLevel === 'low' && "text-green-600",
                                 res.trafficLevel === 'medium' && "text-yellow-600",
                                 res.trafficLevel === 'high' && "text-red-600"
                               )}>
                                 {res.trafficLevel?.toUpperCase() || 'N/A'}
                               </p>
                               <p className="text-xs text-muted-foreground">Traffic</p>
                             </div>
                           </div>
                           
                           {/* Emission breakdown for detailed routes */}
                           {res.carbon.emissionBreakdown && typeof res.carbon.emissionBreakdown === 'object' && (
                             <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                               <p className="text-xs font-medium mb-2">Emission Breakdown:</p>
                               <div className="grid grid-cols-2 gap-2 text-xs">
                                 {Object.entries(res.carbon.emissionBreakdown).map(([key, value]) => (
                                   key !== 'total' && (
                                     <div key={key} className="flex justify-between">
                                       <span className="capitalize">{key}:</span>
                                       <span className="font-mono">{typeof value === 'number' ? value.toFixed(3) : String(value)} kg</span>
                                     </div>
                                   )
                                 ))}
                               </div>
                             </div>
                           )}
                           
                           <div className="space-y-2 text-xs">
                             <div className="flex items-start gap-2">
                               <Info className="size-3 shrink-0 mt-0.5 text-muted-foreground" />
                               <span className="text-muted-foreground">{res.carbon.calculationDetails}</span>
                             </div>
                             <div className="flex items-start gap-2">
                               <Leaf className="size-3 shrink-0 mt-0.5 text-green-600" />
                               <span className="text-muted-foreground">
                                 <strong className="text-foreground">Eco-tip:</strong> {res.carbon.suggestedAlternatives}
                               </span>
                             </div>
                           </div>
                         </div>
                       </div>
                     </Alert>
                   );
                 })}
                 
                 {!state.error?.includes('duplicate') && (
                   <div className="space-y-3">
                     <div className="text-center p-3 bg-muted/30 rounded-lg">
                       <p className="text-xs text-muted-foreground">
                         ✓ Your journey has been logged and will appear in your analytics and history.
                       </p>
                     </div>
                     
                     {/* Environmental Impact Summary */}
                     {state.results && state.results.length > 1 && (
                       <div className="p-4 bg-green-50/50 border border-green-200 rounded-lg">
                         <h4 className="font-semibold text-sm text-green-800 mb-2 flex items-center gap-2">
                           <TreePine className="h-4 w-4" />
                           Environmental Impact Comparison
                         </h4>
                         <div className="space-y-2">
                           {state.results.slice(0, 3).map((route, idx) => {
                             const emissions = route.carbon.estimatedEmissionsKgCO2;
                             const maxEmissions = Math.max(...(state.results || []).map((r: any) => r.carbon.estimatedEmissionsKgCO2));
                             const percentage = maxEmissions > 0 ? (emissions / maxEmissions) * 100 : 0;
                             
                             return (
                               <div key={idx} className="flex items-center gap-3">
                                 <div className="w-20 text-xs truncate">{route.summary.split(' ')[0]}</div>
                                 <div className="flex-1 bg-gray-200 rounded-full h-2">
                                   <div 
                                     className={cn(
                                       "h-2 rounded-full transition-all",
                                       emissions === 0 ? "bg-green-500" :
                                       emissions < 1 ? "bg-blue-500" :
                                       emissions < 3 ? "bg-yellow-500" : "bg-red-500"
                                     )}
                                     style={{ width: `${Math.max(percentage, 5)}%` }}
                                   />
                                 </div>
                                 <div className="text-xs font-mono w-16 text-right">
                                   {emissions.toFixed(2)} kg
                                 </div>
                               </div>
                             );
                           })}
                         </div>
                         <p className="text-xs text-green-700 mt-3">
                           💡 Consider the lower-emission alternatives for your next trip!
                         </p>
                       </div>
                     )}
                   </div>
                 )}
              </div>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}