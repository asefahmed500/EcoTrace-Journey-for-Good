
"use client";
import React, { memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, Search, Loader2, Zap, MapPinOff, Calendar, TrendingUp, Activity, Globe, Clock, BarChart3, Leaf, Bus, Bike, Footprints } from 'lucide-react';
import { SimpleMapPlaceholder } from './simple-map-placeholder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { VisualImpactAnalytics } from './visual-impact-analytics';
import type { Journey } from '@/lib/types';
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
import { FallbackMap } from './fallback-map';
import { loadMapsAPI } from '@/lib/maps-loader';
import { useMapStore } from '@/lib/stores/map-store';

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
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [locationRequested, setLocationRequested] = useState(false);

  const [showJourneys, setShowJourneys] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showNeighborhoodImpact, setShowNeighborhoodImpact] = useState(false);
  const [timeRange, setTimeRange] = useState('all');
  const [emissionIntensity, setEmissionIntensity] = useState([0, 100]);
  const [selectedTransportMode, setSelectedTransportMode] = useState('all');
  const [timeVisualizationMode, setTimeVisualizationMode] = useState('monthly');
  const locationCheckedRef = useRef(false);
  
  // Custom map layer states
  const [showAirQuality, setShowAirQuality] = useState(false);
  const [showCarbonEfficient, setShowCarbonEfficient] = useState(false);
  const [showPublicTransit, setShowPublicTransit] = useState(false);
  const [showBikeLanes, setShowBikeLanes] = useState(false);
  const [showWalkingPaths, setShowWalkingPaths] = useState(false);
  const [enableSmartClustering, setEnableSmartClustering] = useState(false);
  const [showPredictiveRouting, setShowPredictiveRouting] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Test Google Maps API availability
    const testMapsAPI = async () => {
      try {
        await loadMapsAPI();
        setMapError(null);
      } catch (error) {
        console.error('Google Maps API failed to load:', error);
        setMapError(`Google Maps is temporarily unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    
    testMapsAPI();
  }, []);

  // Effect for initial location permission and map centering - OPTIMIZED
  useEffect(() => {
    if (mapInstance && !locationCheckedRef.current && !locationRequested) {
        locationCheckedRef.current = true;
        setLocationRequested(true);
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    mapInstance.setCenter(userLocation);
                    mapInstance.setZoom(12);
                    setLocationError(null); // Clear any previous errors
                    console.log('Map centered on user location');
                },
                (error) => {
                    // Handle user denying permission or other errors more gracefully
                    let errorMessage = "Using default map location. Enable location access for personalized features.";
                    if (error.code === error.PERMISSION_DENIED) {
                        errorMessage = "Location access denied. You can still use the map with manual location entry.";
                    } else if (error.code === error.TIMEOUT) {
                        errorMessage = "Location request timed out. Using default map location.";
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        errorMessage = "Location unavailable. Using default map location.";
                    }
                    setLocationError(errorMessage);
                    console.log('Location access issue:', errorMessage);
                },
                {
                    enableHighAccuracy: false, // Reduce accuracy for faster response
                    timeout: 3000, // Reduce timeout to prevent hanging
                    maximumAge: 600000, // Cache location for 10 minutes
                }
            );
        } else {
            setLocationError("Geolocation not supported. You can still use the map manually.");
        }
    }
  }, [mapInstance, locationRequested]);


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

  // Filter journeys based on selected criteria
  const filteredJourneys = journeys.filter(journey => {
    // Time range filter
    const journeyDate = new Date(journey.date);
    const now = new Date();
    let timeMatch = true;
    
    switch (timeRange) {
      case 'week':
        timeMatch = journeyDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        timeMatch = journeyDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3months':
        timeMatch = journeyDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        timeMatch = journeyDate >= new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        timeMatch = true;
    }
    
    // Emission intensity filter
    const emissionPercentile = journeys.length > 0 ? 
      (journey.emissions / Math.max(...journeys.map(j => j.emissions))) * 100 : 0;
    const intensityMatch = emissionPercentile >= emissionIntensity[0] && 
                          emissionPercentile <= emissionIntensity[1];
    
    // Transport mode filter
    const modeMatch = selectedTransportMode === 'all' || 
                     journey.mode.toLowerCase() === selectedTransportMode.toLowerCase();
    
    return timeMatch && intensityMatch && modeMatch;
  });

  // Calculate neighborhood impact statistics
  const neighborhoodStats = {
    totalEmissions: filteredJourneys.reduce((sum, j) => sum + j.emissions, 0),
    averageEmission: filteredJourneys.length > 0 ? 
      filteredJourneys.reduce((sum, j) => sum + j.emissions, 0) / filteredJourneys.length : 0,
    mostUsedMode: filteredJourneys.reduce((acc, j) => {
      acc[j.mode] = (acc[j.mode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    ecoFriendlyTrips: filteredJourneys.filter(j => j.emissions === 0).length
  };

  const topMode = Object.entries(neighborhoodStats.mostUsedMode)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

  return (
    <Card className="h-full flex flex-col min-h-[400px] lg:min-h-[700px]">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Visual Impact Dashboard
                </CardTitle>
                <CardDescription>
                  Personal carbon heatmap, neighborhood impact zones, and time-travel visualization
                </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
                <Badge variant="secondary" className="text-xs">
                  {filteredJourneys.length} journeys
                </Badge>
                <Badge variant={neighborhoodStats.totalEmissions > 50 ? "destructive" : "default"} className="text-xs">
                  {neighborhoodStats.totalEmissions.toFixed(1)} kg CO2
                </Badge>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow relative">
        <Tabs defaultValue="heatmap" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="heatmap" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Carbon Heatmap
            </TabsTrigger>
            <TabsTrigger value="neighborhood" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Neighborhood Impact
            </TabsTrigger>
            <TabsTrigger value="timetravel" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Travel
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="heatmap" className="flex-grow flex flex-col space-y-4">
            {/* Personal Carbon Heatmap Controls */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Range</label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="3months">Last 3 Months</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Transport Mode</label>
                  <Select value={selectedTransportMode} onValueChange={setSelectedTransportMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modes</SelectItem>
                      <SelectItem value="driving">🚗 Driving</SelectItem>
                      <SelectItem value="public transit">🚌 Public Transit</SelectItem>
                      <SelectItem value="cycling">🚴 Cycling</SelectItem>
                      <SelectItem value="walking">🚶 Walking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Emission Intensity (%)</label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={emissionIntensity[1]}
                      onChange={(e) => setEmissionIntensity([emissionIntensity[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{emissionIntensity[0]}%</span>
                      <span>{emissionIntensity[1]}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Basic Layers</label>
                  <div className="flex gap-2">
                    <Button 
                      variant={showHeatmap ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setShowHeatmap(!showHeatmap)}
                    >
                      Heatmap
                    </Button>
                    <Button 
                      variant={showJourneys ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setShowJourneys(!showJourneys)}
                    >
                      Routes
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Custom Map Layers Controls */}
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-sm mb-3 text-blue-800">🗺️ Custom Map Layers</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button 
                    variant={showAirQuality ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setShowAirQuality(!showAirQuality)}
                    className="flex items-center gap-2"
                  >
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Air Quality
                  </Button>
                  <Button 
                    variant={showCarbonEfficient ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setShowCarbonEfficient(!showCarbonEfficient)}
                    className="flex items-center gap-2"
                  >
                    <Leaf className="h-3 w-3" />
                    Eco Routes
                  </Button>
                  <Button 
                    variant={showPublicTransit ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setShowPublicTransit(!showPublicTransit)}
                    className="flex items-center gap-2"
                  >
                    <Bus className="h-3 w-3" />
                    Transit Data
                  </Button>
                  <Button 
                    variant={showBikeLanes ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setShowBikeLanes(!showBikeLanes)}
                    className="flex items-center gap-2"
                  >
                    <Bike className="h-3 w-3" />
                    Bike Lanes
                  </Button>
                  <Button 
                    variant={showWalkingPaths ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setShowWalkingPaths(!showWalkingPaths)}
                    className="flex items-center gap-2"
                  >
                    <Footprints className="h-3 w-3" />
                    Walk Paths
                  </Button>
                  <Button 
                    variant={enableSmartClustering ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setEnableSmartClustering(!enableSmartClustering)}
                    className="flex items-center gap-2"
                  >
                    <Activity className="h-3 w-3" />
                    Clustering
                  </Button>
                  <Button 
                    variant={showPredictiveRouting ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setShowPredictiveRouting(!showPredictiveRouting)}
                    className="flex items-center gap-2"
                  >
                    <TrendingUp className="h-3 w-3" />
                    Predictions
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Map Container */}
            <div className="flex-grow relative">
              {locationError && (
                <Alert variant="destructive" className="absolute top-2 left-2 z-10 w-auto max-w-md">
                  <MapPinOff className="h-4 w-4" />
                  <AlertTitle>Location Access Denied</AlertTitle>
                  <AlertDescription>{locationError}</AlertDescription>
                </Alert>
              )}
              {isClient ? (
                mapError ? (
                  <FallbackMap journeys={filteredJourneys} error={mapError} />
                ) : (
                  <SimpleMapPlaceholder journeys={filteredJourneys} />
                )
              ) : (
                <Skeleton className="h-full w-full rounded-md" />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="neighborhood" className="flex-grow flex flex-col space-y-4">
            {/* Neighborhood Impact Zone Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{neighborhoodStats.totalEmissions.toFixed(1)} kg</div>
                <div className="text-sm text-muted-foreground">Total CO2 Impact</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{neighborhoodStats.averageEmission.toFixed(2)} kg</div>
                <div className="text-sm text-muted-foreground">Average per Trip</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{neighborhoodStats.ecoFriendlyTrips}</div>
                <div className="text-sm text-muted-foreground">Zero Emission Trips</div>
              </div>
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleFindImpactZones} 
                disabled={isLoadingZones || !isClient}
              >
                {isLoadingZones ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Analyze Local Impact
              </Button>
              <Button 
                variant={showNeighborhoodImpact ? "default" : "outline"} 
                size="sm"
                onClick={() => setShowNeighborhoodImpact(!showNeighborhoodImpact)}
              >
                <Globe className="mr-2 h-4 w-4" />
                Community Zones
              </Button>
            </div>
            
            <div className="flex-grow relative">
              {isClient ? (
                mapError ? (
                  <FallbackMap journeys={filteredJourneys} error={mapError} />
                ) : (
                  <SimpleMapPlaceholder journeys={filteredJourneys} />
                )
              ) : (
                <Skeleton className="h-full w-full rounded-md" />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="timetravel" className="flex-grow flex flex-col space-y-4">
            {/* Time Travel Visualization Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Visualization Mode</label>
                <Select value={timeVisualizationMode} onValueChange={setTimeVisualizationMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly Evolution</SelectItem>
                    <SelectItem value="weekly">Weekly Patterns</SelectItem>
                    <SelectItem value="seasonal">Seasonal Changes</SelectItem>
                    <SelectItem value="yearly">Year-over-Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Most Used Mode</label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {topMode}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {Object.values(neighborhoodStats.mostUsedMode).reduce((a, b) => Math.max(a, b), 0)} trips
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex-grow relative">
              {isClient ? (
                mapError ? (
                  <FallbackMap journeys={filteredJourneys} error={mapError} />
                ) : (
                  <SimpleMapPlaceholder journeys={filteredJourneys} />
                )
              ) : (
                <Skeleton className="h-full w-full rounded-md" />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="flex-grow space-y-4">
            <VisualImpactAnalytics journeys={filteredJourneys} timeRange={timeRange} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
