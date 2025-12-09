import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-wrapper';
// import { suggestOptimalDepartureTimes } from '@/ai/flows/predictive-routing';
// import { getAuthenticatedUserData } from '@/app/actions';

function generateFallbackPredictiveRouting(transportMode: string) {
  const currentHour = new Date().getHours();
  
  // Generate realistic optimal times based on transport mode
  const optimalTimes = [];
  
  if (transportMode === 'driving') {
    // Avoid rush hours for driving
    optimalTimes.push('09:30', '14:00', '19:30');
  } else if (transportMode === 'public transit') {
    // Peak efficiency times for public transit
    optimalTimes.push('08:15', '13:45', '18:00');
  } else if (transportMode === 'cycling') {
    // Good weather and daylight times
    optimalTimes.push('07:00', '16:00', '18:30');
  } else {
    // Default times
    optimalTimes.push('09:00', '14:30', '19:00');
  }
  
  return {
    optimalDepartureTimes: optimalTimes,
    reasoning: `Based on typical traffic patterns for ${transportMode}, these times generally offer the best balance of efficiency and lower emissions. Morning times avoid peak rush hour, afternoon times benefit from lighter traffic, and evening times allow for a comfortable commute home.`
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { origin, destination, transportMode } = body;

    if (!origin || !destination || !transportMode) {
      return NextResponse.json(
        { error: 'Missing required fields: origin, destination, transportMode' },
        { status: 400 }
      );
    }

    // Temporarily use fallback while fixing auth issues
    const fallbackResult = generateFallbackPredictiveRouting(transportMode);
    return NextResponse.json(fallbackResult);
  } catch (error) {
    console.error('Error in predict-route API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while predicting optimal routes.' },
      { status: 500 }
    );
  }
}