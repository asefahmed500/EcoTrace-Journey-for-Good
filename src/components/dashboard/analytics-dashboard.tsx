
"use client";

import type { Journey } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval, parse } from 'date-fns';
import { Leaf, Award, TrendingUp, Milestone, LineChart as LineChartIcon } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface AnalyticsDashboardProps {
  journeys: Journey[];
}

export function AnalyticsDashboard({ journeys }: AnalyticsDashboardProps) {

  const analyticsData = useMemo(() => {
    if (journeys.length === 0) {
      return {
        chartData: [],
        weeklyData: [],
        monthlyData: [],
        averageEmissions: 0,
        bestDay: null,
        mostCommonMode: 'N/A',
        totalDistance: 0,
        ecoFriendlyPercentage: 0,
        carbonSaved: 0,
      };
    }

    const totalEmissions = journeys.reduce((acc, j) => acc + j.emissions, 0);
    const averageEmissions = totalEmissions / journeys.length;
    const totalDistance = journeys.reduce((acc, j) => acc + j.distance, 0);

    const modeCounts = journeys.reduce((acc, j) => {
      acc[j.mode] = (acc[j.mode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonMode = Object.keys(modeCounts).reduce((a, b) => modeCounts[a] > modeCounts[b] ? a : b, 'N/A');

    const endDate = new Date();
    const startDate = subDays(endDate, 29);
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });

    const emissionsByDay: Record<string, number> = {};
    for (const journey of journeys) {
        const journeyDate = new Date(journey.date);
        if (journeyDate >= startDate && journeyDate <= endDate) {
            const dayKey = format(journeyDate, 'yyyy-MM-dd');
            emissionsByDay[dayKey] = (emissionsByDay[dayKey] || 0) + journey.emissions;
        }
    }
    
    let bestDay: { date: string; emissions: number } | null = null;
    if (Object.keys(emissionsByDay).length > 0) {
        bestDay = Object.entries(emissionsByDay).reduce((min, current) => {
            return current[1] < min.emissions ? { date: current[0], emissions: current[1] } : min;
        }, { date: Object.keys(emissionsByDay)[0], emissions: Object.values(emissionsByDay)[0] });
    }
    

    const chartData = dateInterval.map(date => {
      const dayKey = format(date, 'yyyy-MM-dd');
      return {
        date: format(date, 'MMM d'),
        fullDate: dayKey,
        emissions: parseFloat((emissionsByDay[dayKey] || 0).toFixed(2)),
      };
    });

    return { chartData, averageEmissions, bestDay, mostCommonMode, totalDistance };
  }, [journeys]);

  const chartConfig = {
    emissions: {
      label: "CO2 (kg)",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;


  if (journeys.length === 0) {
    return (
        <Card className="flex flex-col items-center justify-center text-center py-20">
            <CardHeader>
                <div className="mx-auto bg-muted/50 p-4 rounded-full mb-4">
                    <LineChartIcon className="size-12 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl">Your Analytics Will Appear Here</CardTitle>
                <CardDescription className="max-w-md mx-auto">
                    Once you start logging your journeys using the calculator, this dashboard will come to life with charts and stats about your carbon footprint.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <p className="text-sm text-muted-foreground">Log your first trip to get started!</p>
            </CardContent>
        </Card>
    )
  }

  const formatTick = (tick: string) => {
    const date = parse(tick, 'MMM d', new Date());
    // Only show date for every 5th day to prevent clutter
    if (date.getDate() % 5 === 0) {
        return format(date, 'MMM d');
    }
    return '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Emissions Over Last 30 Days</CardTitle>
          <CardDescription>A visual breakdown of your daily carbon footprint.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={analyticsData.chartData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                fontSize={12}
                tickFormatter={formatTick}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                unit="kg"
                fontSize={12}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="emissions" fill="var(--color-emissions)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Emissions / Trip</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.averageEmissions.toFixed(2)} kg</div>
            <p className="text-xs text-muted-foreground">Across all your journeys</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Eco-Friendly Day</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.bestDay ? `${analyticsData.bestDay.emissions.toFixed(2)} kg` : 'N/A'}</div>
            <p className="text-xs text-muted-foreground">{analyticsData.bestDay ? `on ${new Date(analyticsData.bestDay.date + 'T00:00:00').toLocaleDateString()}` : 'in the last 30 days'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorite Transport</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{analyticsData.mostCommonMode}</div>
            <p className="text-xs text-muted-foreground">Your most used mode of transport</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
            <Milestone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalDistance.toFixed(0)} km</div>
            <p className="text-xs text-muted-foreground">Total distance of all journeys</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
