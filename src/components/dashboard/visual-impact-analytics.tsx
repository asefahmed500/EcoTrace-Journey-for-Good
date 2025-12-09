"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, MapPin, Calendar, Zap } from 'lucide-react';
import type { Journey } from '@/lib/types';

interface VisualImpactAnalyticsProps {
  journeys: Journey[];
  timeRange: string;
}

export function VisualImpactAnalytics({ journeys, timeRange }: VisualImpactAnalyticsProps) {
  const analytics = useMemo(() => {
    if (journeys.length === 0) {
      return {
        totalEmissions: 0,
        averageEmission: 0,
        emissionTrend: 0,
        hotspots: [],
        timePatterns: {},
        transportModeBreakdown: {},
        emissionDistribution: { zero: 0, low: 0, medium: 0, high: 0 },
        geographicSpread: 0
      };
    }

    // Calculate basic metrics
    const totalEmissions = journeys.reduce((sum, j) => sum + j.emissions, 0);
    const averageEmission = totalEmissions / journeys.length;

    // Calculate emission trend (comparing first half vs second half)
    const midpoint = Math.floor(journeys.length / 2);
    const firstHalf = journeys.slice(0, midpoint);
    const secondHalf = journeys.slice(midpoint);
    const firstHalfAvg = firstHalf.length > 0 ? 
      firstHalf.reduce((sum, j) => sum + j.emissions, 0) / firstHalf.length : 0;
    const secondHalfAvg = secondHalf.length > 0 ? 
      secondHalf.reduce((sum, j) => sum + j.emissions, 0) / secondHalf.length : 0;
    const emissionTrend = firstHalfAvg > 0 ? 
      ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

    // Identify emission hotspots
    const locationEmissions = new Map();
    journeys.forEach(journey => {
      if (journey.originCoords) {
        const key = `${Math.round(journey.originCoords.lat * 100) / 100}_${Math.round(journey.originCoords.lng * 100) / 100}`;
        const current = locationEmissions.get(key) || { emissions: 0, count: 0, lat: journey.originCoords.lat, lng: journey.originCoords.lng };
        current.emissions += journey.emissions;
        current.count += 1;
        locationEmissions.set(key, current);
      }
    });

    const hotspots = Array.from(locationEmissions.entries())
      .map(([key, data]) => ({
        location: key,
        ...data,
        averageEmission: data.emissions / data.count
      }))
      .sort((a, b) => b.emissions - a.emissions)
      .slice(0, 5);

    // Time patterns analysis
    const timePatterns = journeys.reduce((acc, journey) => {
      const date = new Date(journey.date);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();
      const month = date.getMonth();

      acc.hourly = acc.hourly || {};
      acc.daily = acc.daily || {};
      acc.monthly = acc.monthly || {};

      acc.hourly[hour] = (acc.hourly[hour] || 0) + journey.emissions;
      acc.daily[dayOfWeek] = (acc.daily[dayOfWeek] || 0) + journey.emissions;
      acc.monthly[month] = (acc.monthly[month] || 0) + journey.emissions;

      return acc;
    }, {} as any);

    // Transport mode breakdown
    const transportModeBreakdown = journeys.reduce((acc, journey) => {
      acc[journey.mode] = acc[journey.mode] || { count: 0, emissions: 0 };
      acc[journey.mode].count += 1;
      acc[journey.mode].emissions += journey.emissions;
      return acc;
    }, {} as Record<string, { count: number; emissions: number }>);

    // Emission distribution
    const emissionDistribution = journeys.reduce((acc, journey) => {
      if (journey.emissions === 0) acc.zero += 1;
      else if (journey.emissions < 2) acc.low += 1;
      else if (journey.emissions < 10) acc.medium += 1;
      else acc.high += 1;
      return acc;
    }, { zero: 0, low: 0, medium: 0, high: 0 });

    // Geographic spread (calculate bounding box area)
    const coords = journeys
      .filter(j => j.originCoords && j.destinationCoords)
      .flatMap(j => [j.originCoords, j.destinationCoords]);
    
    let geographicSpread = 0;
    if (coords.length > 0) {
      const lats = coords.map(c => c.lat);
      const lngs = coords.map(c => c.lng);
      const latRange = Math.max(...lats) - Math.min(...lats);
      const lngRange = Math.max(...lngs) - Math.min(...lngs);
      geographicSpread = latRange * lngRange * 111 * 111; // Rough km² calculation
    }

    return {
      totalEmissions,
      averageEmission,
      emissionTrend,
      hotspots,
      timePatterns,
      transportModeBreakdown,
      emissionDistribution,
      geographicSpread
    };
  }, [journeys]);

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (trend < -5) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Activity className="h-4 w-4 text-blue-500" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 5) return "text-red-600";
    if (trend < -5) return "text-green-600";
    return "text-blue-600";
  };

  const getDayName = (dayIndex: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  };

  const getMonthName = (monthIndex: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthIndex];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Emission Trend Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Emission Trend</CardTitle>
          {getTrendIcon(analytics.emissionTrend)}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.averageEmission.toFixed(2)} kg</div>
          <p className="text-xs text-muted-foreground">Average per trip</p>
          <div className={`text-sm ${getTrendColor(analytics.emissionTrend)} mt-2`}>
            {analytics.emissionTrend > 0 ? '+' : ''}{analytics.emissionTrend.toFixed(1)}% vs previous period
          </div>
        </CardContent>
      </Card>

      {/* Geographic Spread Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Geographic Impact</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.geographicSpread.toFixed(0)} km²</div>
          <p className="text-xs text-muted-foreground">Area covered</p>
          <div className="text-sm text-muted-foreground mt-2">
            {analytics.hotspots.length} emission hotspots identified
          </div>
        </CardContent>
      </Card>

      {/* Emission Distribution Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Emission Distribution</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Zero Emission</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {analytics.emissionDistribution.zero}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Low (&lt;2kg)</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {analytics.emissionDistribution.low}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Medium (2-10kg)</span>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {analytics.emissionDistribution.medium}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">High (&gt;10kg)</span>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {analytics.emissionDistribution.high}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transport Mode Breakdown */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Transport Mode Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics.transportModeBreakdown).map(([mode, data]) => {
              const percentage = (data.emissions / analytics.totalEmissions) * 100;
              return (
                <div key={mode} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm capitalize">{mode}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{data.count} trips</span>
                      <span className="text-sm font-medium">{data.emissions.toFixed(1)} kg</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Peak Emission Times</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="text-xs text-muted-foreground">Daily Pattern</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(analytics.timePatterns.daily || {})
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 3)
                  .map(([day, emissions]) => (
                    <Badge key={day} variant="outline" className="text-xs">
                      {getDayName(parseInt(day))}: {(emissions as number).toFixed(1)}kg
                    </Badge>
                  ))}
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Monthly Pattern</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(analytics.timePatterns.monthly || {})
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 3)
                  .map(([month, emissions]) => (
                    <Badge key={month} variant="outline" className="text-xs">
                      {getMonthName(parseInt(month))}: {(emissions as number).toFixed(1)}kg
                    </Badge>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Emission Hotspots */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Emission Hotspots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.hotspots.slice(0, 6).map((hotspot, index) => (
              <div key={hotspot.location} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <span className="text-sm font-medium">{hotspot.emissions.toFixed(1)} kg CO2</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <div>Trips: {hotspot.count}</div>
                  <div>Avg: {hotspot.averageEmission.toFixed(2)} kg/trip</div>
                  <div>Location: {hotspot.lat.toFixed(3)}, {hotspot.lng.toFixed(3)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}