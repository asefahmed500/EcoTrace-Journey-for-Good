"use client";

import React, { memo, useMemo } from 'react';
import { CoreMap } from './core-map';
import { AlternativeRoutesDisplay } from './alternative-routes-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Route } from 'lucide-react';
import type { Journey } from '@/lib/types';

interface OptimizedFootprintMapProps {
  journeys: Journey[];
}

const OptimizedFootprintMapComponent = ({ journeys }: OptimizedFootprintMapProps) => {
  // Memoize journeys to prevent unnecessary re-renders
  const memoizedJourneys = useMemo(() => journeys, [journeys]);

  // Generate sample alternative routes for demonstration
  const sampleRoutes = useMemo(() => {
    if (journeys.length === 0) return [];
    
    return [
      {
        id: 'walking',
        mode: 'walking',
        duration: '25 min',
        distance: '2.1 km',
        emissions: 0,
        description: 'Eco-friendly walking route with minimal emissions'
      },
      {
        id: 'cycling',
        mode: 'cycling',
        duration: '12 min',
        distance: '2.3 km',
        emissions: 0,
        description: 'Fast cycling route through bike lanes'
      },
      {
        id: 'transit',
        mode: 'public_transport',
        duration: '18 min',
        distance: '2.0 km',
        emissions: 0.8,
        cost: 2.50,
        description: 'Public transport with one transfer'
      },
      {
        id: 'driving',
        mode: 'driving',
        duration: '8 min',
        distance: '2.2 km',
        emissions: 2.4,
        cost: 5.20,
        description: 'Direct driving route via main roads'
      }
    ];
  }, [journeys.length]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Carbon Footprint Map
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="map" className="w-full">
          <div className="px-6 pb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="map" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Journey Map
              </TabsTrigger>
              <TabsTrigger value="routes" className="flex items-center gap-2">
                <Route className="h-4 w-4" />
                Alternative Routes
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="map" className="px-6 pb-6 mt-0">
            <CoreMap journeys={memoizedJourneys} />
          </TabsContent>
          
          <TabsContent value="routes" className="px-6 pb-6 mt-0">
            <AlternativeRoutesDisplay 
              routes={sampleRoutes}
              onSelectRoute={(route) => {
                console.log('Selected route:', route);
                // Here you could integrate with routing logic
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Memo comparison function to prevent re-renders when journeys haven't changed
const areEqual = (prevProps: OptimizedFootprintMapProps, nextProps: OptimizedFootprintMapProps) => {
  // Only re-render if the number of journeys changed or if journey data actually changed
  if (prevProps.journeys.length !== nextProps.journeys.length) {
    return false;
  }
  
  // Check if any journey has actually changed
  for (let i = 0; i < prevProps.journeys.length; i++) {
    const prev = prevProps.journeys[i];
    const next = nextProps.journeys[i];
    
    if (prev?.id !== next?.id || prev?.emissions !== next?.emissions || prev?.mode !== next?.mode) {
      return false;
    }
  }
  
  return true;
};

export const OptimizedFootprintMap = memo(OptimizedFootprintMapComponent, areEqual);