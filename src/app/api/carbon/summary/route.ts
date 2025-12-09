import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-wrapper';
import { getJourneys } from '@/app/actions';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const journeys = await getJourneys();
    
    // Calculate summary statistics
    const totalEmissions = journeys.reduce((sum, journey) => sum + journey.emissions, 0);
    const totalDistance = journeys.reduce((sum, journey) => sum + journey.distance, 0);
    const ecoFriendlyTrips = journeys.filter(journey => journey.emissions === 0).length;
    const averageEmissions = journeys.length > 0 ? totalEmissions / journeys.length : 0;
    
    // Group by transport mode
    const modeStats = journeys.reduce((acc, journey) => {
      const mode = journey.mode;
      if (!acc[mode]) {
        acc[mode] = { count: 0, emissions: 0, distance: 0 };
      }
      acc[mode].count++;
      acc[mode].emissions += journey.emissions;
      acc[mode].distance += journey.distance;
      return acc;
    }, {} as Record<string, { count: number; emissions: number; distance: number }>);

    const summary = {
      totalEmissions: Math.round(totalEmissions * 100) / 100,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalJourneys: journeys.length,
      ecoFriendlyTrips,
      averageEmissions: Math.round(averageEmissions * 100) / 100,
      modeStats,
      recentJourneys: journeys.slice(0, 5), // Last 5 journeys
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error in carbon summary API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching carbon summary.' },
      { status: 500 }
    );
  }
}