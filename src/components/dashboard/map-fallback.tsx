"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, RefreshCw, ExternalLink } from 'lucide-react';

interface MapFallbackProps {
  error?: string;
  onRetry?: () => void;
  className?: string;
}

export function MapFallback({ error, onRetry, className }: MapFallbackProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Map Temporarily Unavailable
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            {error || 'The interactive map is temporarily disabled to resolve performance issues. Your journey data is still being tracked.'}
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Loading Map
            </Button>
          )}
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => window.open('https://maps.google.com', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Google Maps
          </Button>
        </div>
        
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Map Features Available:
          </h3>
          <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <li>• Route planning and CO₂ calculation</li>
            <li>• Alternative transport options</li>
            <li>• Journey tracking and analytics</li>
            <li>• Emission comparisons</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}