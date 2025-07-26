
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, Search, Loader2, Zap, MapPinOff } from 'lucide-react';
import { GoogleMap } from './google-map';
import type { Journey, CommunityImpactZone, EvChargingStation } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

interface FootprintMapProps {
  journeys: Journey[];
}

export function FootprintMap({ journeys }: FootprintMapProps) {
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [impactZones, setImpactZones] = useState<CommunityImpactZone[]>([]);
  const [isLoadingZones, setIsLoadingZones] = useState(false);
  const [chargingStations, setChargingStations] = useState<EvChargingStation[]>([]);
  const [isLoadingChargers, setIsLoadingChargers] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [showJourneys, setShowJourneys] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const locationCheckedRef = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Effect for initial location permission and map centering
  useEffect(() => {
    if (mapInstance && !locationCheckedRef.current) {
        locationCheckedRef.current = true; // Ensure this runs only once
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    mapInstance.setCenter(userLocation);
                    mapInstance.setZoom(12);
                    toast({
                        title: "Location Found",
                        description: "Map centered on your current location.",
                    });
                },
                (error) => {
                     // Handle user denying permission or other errors
                    let errorMessage = "Could not access your location. Map is centered on the US.";
                    if (error.code === error.PERMISSION_DENIED) {
                        errorMessage = "Location permission denied. Please enable it in your browser settings to use location-based features.";
                    }
                    setLocationError(errorMessage);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        } else {
            setLocationError("Geolocation is not supported by your browser.");
        }
    }
  }, [mapInstance, toast]);


  const handleFindImpactZones = async () => {
    if (!mapInstance) return;
    setIsLoadingZones(true);
    setImpactZones([]); // Clear previous results
    try {
      const center = mapInstance.getCenter();
      if (!center) {
        toast({
            variant: "destructive",
            title: "Map Error",
            description: "Could not get map center. Please try again.",
        });
        return;
      };
      
      const response = await fetch('/api/ai/community-impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: center.lat(), longitude: center.lng(), radius: 10 }), // 10km radius
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setImpactZones(result.communityImpactZones);
        toast({
          title: "Analysis Complete",
          description: `Found ${result.communityImpactZones.length} potential impact zones near you.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: result.error || 'An unexpected error occurred.',
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An Error Occurred",
        description: "Could not fetch community impact zones.",
      });
    } finally {
      setIsLoadingZones(false);
    }
  };

  const handleFindEvChargers = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation.",
      });
      return;
    }

    setLocationError(null); // Clear previous errors
    setIsLoadingChargers(true);
    setChargingStations([]); // Clear previous results
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            const response = await fetch('/api/maps/ev-stations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latitude, longitude }),
            });
            const result = await response.json();

            if (response.ok) {
                setChargingStations(result);
                if (mapInstance) {
                    mapInstance.setCenter({ lat: latitude, lng: longitude });
                    mapInstance.setZoom(13);
                }
                toast({
                    title: "EV Chargers Found",
                    description: `Found ${result.length} charging stations within 5km.`,
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Search Failed",
                    description: result.error || 'An unexpected error occurred.',
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "An Error Occurred",
                description: "Could not fetch EV charging stations.",
            });
        } finally {
            setIsLoadingChargers(false);
        }
      },
      (error) => {
        let errorMessage = "Could not access your location.";
        if (error.code === error.PERMISSION_DENIED) {
            errorMessage = "Location permission denied. Please enable it in your browser settings to use this feature.";
        }
        setLocationError(errorMessage);
        setIsLoadingChargers(false);
      }
    );
  };

  return (
    <Card className="h-full flex flex-col min-h-[400px] lg:min-h-[550px]">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>My Carbon Footprint</CardTitle>
                <CardDescription>Visualize your travel impact over time.</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
                <Button variant="outline" size="sm" onClick={handleFindImpactZones} disabled={isLoadingZones || !isClient}>
                    {isLoadingZones ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Search className="mr-2 h-4 w-4" />
                    )}
                    Impact Zones
                </Button>
                <Button variant="outline" size="sm" onClick={handleFindEvChargers} disabled={isLoadingChargers || !isClient}>
                    {isLoadingChargers ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Zap className="mr-2 h-4 w-4" />
                    )}
                    EV Chargers
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Layers className="mr-2 h-4 w-4" /> Layers
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Map Layers</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={showJourneys}
                            onCheckedChange={setShowJourneys}
                        >
                            Show Journeys
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={showHeatmap}
                            onCheckedChange={setShowHeatmap}
                        >
                            Show Heatmap
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow relative">
        {locationError && (
             <Alert variant="destructive" className="absolute top-2 left-2 z-10 w-auto max-w-md">
                <MapPinOff className="h-4 w-4" />
                <AlertTitle>Location Access Denied</AlertTitle>
                <AlertDescription>
                    {locationError}
                </AlertDescription>
            </Alert>
        )}
        {isClient ? (
          <GoogleMap 
            center={{ lat: 39.8283, lng: -98.5795 }} // Center of the US
            zoom={4}
            journeys={journeys}
            impactZones={impactZones}
            chargingStations={chargingStations}
            onMapLoad={setMapInstance}
            showHeatmap={showHeatmap}
            showJourneys={showJourneys}
          />
        ) : (
          <Skeleton className="h-full w-full rounded-md" />
        )}
      </CardContent>
    </Card>
  );
}
