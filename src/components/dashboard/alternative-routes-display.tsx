"use client";

import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Route, Leaf, Clock, Car, Bus, Bike, Footprints } from 'lucide-react';
import type { Journey } from '@/lib/types';

interface AlternativeRoute {
  id: string;
  mode: string;
  duration: string;
  distance: string;
  emissions: number;
  cost?: number;
  description: string;
}

interface AlternativeRoutesDisplayProps {
  routes: AlternativeRoute[];
  onSelectRoute?: (route: AlternativeRoute) => void;
}

const getTransportIcon = (mode: string) => {
  switch (mode.toLowerCase()) {
    case 'walking':
      return <Footprints className="h-4 w-4" />;
    case 'cycling':
      return <Bike className="h-4 w-4" />;
    case 'public_transport':
    case 'transit':
      return <Bus className="h-4 w-4" />;
    case 'driving':
    default:
      return <Car className="h-4 w-4" />;
  }
};

const getEmissionColor = (emissions: number) => {
  if (emissions === 0) return 'bg-green-500';
  if (emissions < 1) return 'bg-green-400';
  if (emissions < 3) return 'bg-yellow-400';
  if (emissions < 5) return 'bg-orange-400';
  return 'bg-red-400';
};

const AlternativeRoutesDisplayComponent = ({ routes, onSelectRoute }: AlternativeRoutesDisplayProps) => {
  if (!routes || routes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Alternative Routes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No alternative routes available. Try calculating a journey to see eco-friendly options.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          Alternative Routes ({routes.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {routes.map((route, index) => (
          <div
            key={route.id || index}
            className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getTransportIcon(route.mode)}
                <span className="font-medium capitalize">{route.mode.replace('_', ' ')}</span>
                <Badge 
                  className={`text-white ${getEmissionColor(route.emissions)}`}
                >
                  {route.emissions.toFixed(2)} kg CO₂
                </Badge>
              </div>
              {onSelectRoute && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectRoute(route)}
                >
                  Select
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {route.duration}
              </div>
              <div className="flex items-center gap-1">
                <Route className="h-3 w-3" />
                {route.distance}
              </div>
              {route.cost && (
                <div className="flex items-center gap-1">
                  <span>$</span>
                  {route.cost.toFixed(2)}
                </div>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              {route.description}
            </p>
          </div>
        ))}
        
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <Leaf className="h-4 w-4" />
            <span className="text-sm font-medium">Eco Tip</span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Choose walking or cycling for zero emissions, or public transport to reduce your carbon footprint.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export const AlternativeRoutesDisplay = memo(AlternativeRoutesDisplayComponent);