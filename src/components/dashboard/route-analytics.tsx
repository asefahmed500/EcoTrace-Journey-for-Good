"use client";

import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingDown, 
  TrendingUp, 
  Leaf, 
  Car, 
  Bus, 
  Bike, 
  Footprints,
  BarChart3,
  Target
} from 'lucide-react';
import { useMapStore } from '@/lib/stores/map-store';

interface RouteAnalyticsProps {
  className?: string;
}

const RouteAnalyticsComponent = ({ className }: RouteAnalyticsProps) => {
  const { currentRoutes, selectedRoute } = useMapStore();

  if (currentRoutes.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Route Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Calculate routes to see CO₂ emissions analysis and eco-friendly alternatives.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'walking': return <Footprints className="h-4 w-4" />;
      case 'cycling': return <Bike className="h-4 w-4" />;
      case 'transit': return <Bus className="h-4 w-4" />;
      case 'driving': return <Car className="h-4 w-4" />;
      default: return <Car className="h-4 w-4" />;
    }
  };

  const getEmissionLevel = (emissions: number) => {
    if (emissions === 0) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (emissions < 1) return { level: 'Good', color: 'text-green-500', bgColor: 'bg-green-50' };
    if (emissions < 3) return { level: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (emissions < 5) return { level: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { level: 'Very High', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const maxEmissions = Math.max(...currentRoutes.map(r => r.emissions));
  const minEmissions = Math.min(...currentRoutes.map(r => r.emissions));
  const ecoFriendlyRoutes = currentRoutes.filter(r => r.emissions === 0);
  const potentialSavings = selectedRoute ? maxEmissions - selectedRoute.emissions : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Route Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Leaf className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Eco Options
              </span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {ecoFriendlyRoutes.length}
            </div>
            <div className="text-xs text-green-600/80">
              Zero emission routes
            </div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Best Savings
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {potentialSavings.toFixed(1)}
            </div>
            <div className="text-xs text-blue-600/80">
              kg CO₂ saved
            </div>
          </div>
        </div>

        {/* Route Comparison */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Emission Comparison</h3>
          {currentRoutes.map((route) => {
            const emissionLevel = getEmissionLevel(route.emissions);
            const percentage = maxEmissions > 0 ? (route.emissions / maxEmissions) * 100 : 0;
            const isSelected = selectedRoute?.id === route.id;
            
            return (
              <div 
                key={route.id}
                className={`p-3 rounded-lg border transition-colors ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTransportIcon(route.mode)}
                    <span className="font-medium text-sm capitalize">
                      {route.mode.replace('_', ' ')}
                    </span>
                    {isSelected && (
                      <Badge variant="secondary" className="text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={`text-xs ${emissionLevel.color} ${emissionLevel.bgColor}`}
                      variant="secondary"
                    >
                      {emissionLevel.level}
                    </Badge>
                    <span className="font-semibold text-sm">
                      {route.emissions.toFixed(2)} kg CO₂
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{route.duration}</span>
                    <span>{route.distance}</span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2"
                    style={{
                      '--progress-background': route.emissions === 0 
                        ? '#10B981' 
                        : route.emissions < 2 
                        ? '#F59E0B' 
                        : '#EF4444'
                    } as React.CSSProperties}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Environmental Impact */}
        {selectedRoute && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Environmental Impact
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Your route emissions:</span>
                <span className="font-medium">{selectedRoute.emissions.toFixed(2)} kg CO₂</span>
              </div>
              
              {minEmissions < selectedRoute.emissions && (
                <div className="flex justify-between text-green-600">
                  <span>Potential savings:</span>
                  <span className="font-medium flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    {(selectedRoute.emissions - minEmissions).toFixed(2)} kg CO₂
                  </span>
                </div>
              )}
              
              {selectedRoute.emissions > 0 && (
                <div className="text-xs text-muted-foreground mt-2 p-2 bg-white dark:bg-gray-700 rounded">
                  💡 <strong>Tip:</strong> {
                    ecoFriendlyRoutes.length > 0 
                      ? `Try ${ecoFriendlyRoutes[0].mode} for zero emissions!`
                      : 'Consider public transport to reduce your carbon footprint.'
                  }
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const RouteAnalytics = memo(RouteAnalyticsComponent);