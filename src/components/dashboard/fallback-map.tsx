"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Zap, AlertTriangle } from 'lucide-react';
import type { Journey } from '@/lib/types';

interface FallbackMapProps {
  journeys: Journey[];
  error?: string;
}

export function FallbackMap({ journeys, error }: FallbackMapProps) {
  const totalEmissions = journeys.reduce((sum, j) => sum + j.emissions, 0);
  const ecoFriendlyTrips = journeys.filter(j => j.emissions === 0).length;
  
  // Group journeys by mode
  const modeStats = journeys.reduce((acc, journey) => {
    const mode = journey.mode;
    if (!acc[mode]) {
      acc[mode] = { count: 0, emissions: 0 };
    }
    acc[mode].count++;
    acc[mode].emissions += journey.emissions;
    return acc;
  }, {} as Record<string, { count: number; emissions: number }>);

  const getModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'driving': return '🚗';
      case 'public transit': return '🚌';
      case 'cycling': return '🚴';
      case 'walking': return '🚶';
      default: return '🚶';
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'driving': return 'bg-red-100 text-red-800 border-red-200';
      case 'public transit': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cycling': return 'bg-green-100 text-green-800 border-green-200';
      case 'walking': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white/80 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Journey Overview</h3>
              <p className="text-sm text-gray-600">
                {error ? 'Map temporarily unavailable' : 'Visual map representation'}
              </p>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Map Loading Issue</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/80">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{journeys.length}</div>
              <div className="text-sm text-gray-600">Total Journeys</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{totalEmissions.toFixed(1)} kg</div>
              <div className="text-sm text-gray-600">CO₂ Emissions</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{ecoFriendlyTrips}</div>
              <div className="text-sm text-gray-600">Eco-Friendly Trips</div>
            </CardContent>
          </Card>
        </div>

        {/* Journey Modes */}
        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle className="text-lg">Transport Modes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(modeStats).map(([mode, stats]) => (
                <div key={mode} className={`p-4 rounded-lg border ${getModeColor(mode)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getModeIcon(mode)}</span>
                      <div>
                        <div className="font-semibold capitalize">{mode}</div>
                        <div className="text-sm opacity-80">{stats.count} trips</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{stats.emissions.toFixed(1)} kg</div>
                      <div className="text-sm opacity-80">CO₂</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Journeys */}
        {journeys.length > 0 && (
          <Card className="bg-white/80">
            <CardHeader>
              <CardTitle className="text-lg">Recent Journeys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {journeys.slice(0, 5).map((journey, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getModeIcon(journey.mode)}</span>
                      <div>
                        <div className="font-medium text-sm">
                          {journey.origin} → {journey.destination}
                        </div>
                        <div className="text-xs text-gray-600">
                          {new Date(journey.date).toLocaleDateString()} • {journey.distance.toFixed(1)} km
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">{journey.emissions.toFixed(2)} kg</div>
                      <div className="text-xs text-gray-600">CO₂</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-800">Map Temporarily Unavailable</div>
                  <div className="text-sm text-amber-700 mt-1">
                    {error}
                  </div>
                  <div className="text-xs text-amber-600 mt-2">
                    Your journey data is still being tracked. The interactive map will return shortly.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}