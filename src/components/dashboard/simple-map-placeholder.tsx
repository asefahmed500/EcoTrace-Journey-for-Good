'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Route, AlertCircle } from 'lucide-react';

interface SimpleMapPlaceholderProps {
  journeys: any[];
}

export function SimpleMapPlaceholder({ journeys }: SimpleMapPlaceholderProps) {
  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Journey Map
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="text-center space-y-2">
          <Route className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-medium">Map Temporarily Disabled</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            The interactive map has been temporarily disabled to resolve performance issues. 
            Your journey data is still being tracked.
          </p>
        </div>
        
        {journeys.length > 0 && (
          <div className="bg-muted rounded-lg p-4 w-full max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Journey Summary</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Total Journeys: {journeys.length}</p>
              <p>Total Emissions: {journeys.reduce((sum, j) => sum + (j.emissions || 0), 0).toFixed(2)} kg CO2</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}