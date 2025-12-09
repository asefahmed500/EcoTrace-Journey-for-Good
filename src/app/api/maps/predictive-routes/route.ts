import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import dbConnect from '@/lib/db';
import Journey from '@/models/Journey';

interface PredictiveRoute {
  origin: string;
  destination: string;
  suggestedMode: string;
  optimalTimes: string[];
  predictedEmissions: number;
  confidence: number;
  reasoning: string;
  alternativeRoutes: Array<{
    mode: string;
    emissions: number;
    duration: number;
    cost: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { origin, destination, currentTime, preferences } = await request.json();

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Get user's historical journey data for pattern analysis
    const userJourneys = await Journey.find({ userId: session.user.id }).lean();
    
    // Generate predictive routes based on historical data and real-time conditions
    const predictiveRoutes = await generatePredictiveRoutes(
      origin, 
      destination, 
      userJourneys, 
      currentTime, 
      preferences
    );

    return NextResponse.json({
      routes: predictiveRoutes,
      timestamp: new Date().toISOString(),
      basedOnJourneys: userJourneys.length
    });
  } catch (error) {
    console.error('Error generating predictive routes:', error);
    return NextResponse.json(
      { error: 'Failed to generate predictive routes' },
      { status: 500 }
    );
  }
}

async function generatePredictiveRoutes(
  origin: string,
  destination: string,
  historicalJourneys: any[],
  currentTime?: string,
  preferences?: any
): Promise<PredictiveRoute[]> {
  const routes: PredictiveRoute[] = [];
  
  // Analyze historical patterns for this route
  const similarRoutes = historicalJourneys.filter(journey => 
    journey.origin.toLowerCase().includes(origin.toLowerCase().split(',')[0]) ||
    journey.destination.toLowerCase().includes(destination.toLowerCase().split(',')[0])
  );
  
  // Calculate current traffic conditions (mock)
  const currentHour = currentTime ? parseInt(currentTime.split(':')[0]) : new Date().getHours();
  const trafficMultiplier = getTrafficMultiplier(currentHour);
  
  // Generate predictions for different transport modes
  const transportModes = ['driving', 'public transit', 'cycling', 'walking'];
  
  for (const mode of transportModes) {
    const modeJourneys = similarRoutes.filter(j => j.mode.toLowerCase() === mode);
    const confidence = Math.min(95, Math.max(20, modeJourneys.length * 15));
    
    // Calculate base emissions and adjust for current conditions
    const baseEmissions = calculateBaseEmissions(mode, 15); // Assume 15km average
    const adjustedEmissions = baseEmissions * trafficMultiplier;
    
    // Generate optimal departure times
    const optimalTimes = generateOptimalTimes(mode, currentHour, modeJourneys);
    
    // Generate reasoning based on data
    const reasoning = generateReasoning(mode, modeJourneys, trafficMultiplier, currentHour);
    
    // Generate alternative routes
    const alternativeRoutes = generateAlternativeRoutes(mode, adjustedEmissions);
    
    routes.push({
      origin,
      destination,
      suggestedMode: mode,
      optimalTimes,
      predictedEmissions: Math.round(adjustedEmissions * 100) / 100,
      confidence,
      reasoning,
      alternativeRoutes
    });
  }
  
  // Sort by predicted emissions (lowest first)
  return routes.sort((a, b) => a.predictedEmissions - b.predictedEmissions);
}

function getTrafficMultiplier(hour: number): number {
  // Rush hour increases emissions due to congestion
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
    return 1.4; // 40% increase during rush hour
  } else if ((hour >= 6 && hour <= 10) || (hour >= 16 && hour <= 20)) {
    return 1.2; // 20% increase during busy periods
  } else if (hour >= 22 || hour <= 6) {
    return 0.8; // 20% decrease during night hours
  }
  return 1.0; // Normal conditions
}

function calculateBaseEmissions(mode: string, distance: number): number {
  const emissionFactors = {
    'driving': 0.21, // kg CO2 per km
    'public transit': 0.089,
    'cycling': 0,
    'walking': 0
  };
  
  const factor = emissionFactors[mode as keyof typeof emissionFactors] || 0.21;
  return distance * factor;
}

function generateOptimalTimes(mode: string, currentHour: number, historicalData: any[]): string[] {
  const times: string[] = [];
  
  // Analyze historical departure times if available
  if (historicalData.length > 0) {
    const hourCounts = historicalData.reduce((acc, journey) => {
      const hour = new Date(journey.date).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    // Get top 3 most common hours
    const topHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
    
    topHours.forEach(hour => {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
    });
  }
  
  // Add mode-specific optimal times if no historical data
  if (times.length === 0) {
    switch (mode) {
      case 'driving':
        times.push('09:30', '14:00', '19:30'); // Avoid rush hours
        break;
      case 'public transit':
        times.push('08:15', '13:45', '18:00'); // Peak service times
        break;
      case 'cycling':
        times.push('07:00', '16:00', '18:30'); // Good weather times
        break;
      case 'walking':
        times.push('08:00', '15:00', '17:00'); // Comfortable times
        break;
    }
  }
  
  return times.slice(0, 3); // Return top 3 times
}

function generateReasoning(mode: string, historicalData: any[], trafficMultiplier: number, currentHour: number): string {
  let reasoning = `Based on `;
  
  if (historicalData.length > 0) {
    reasoning += `${historicalData.length} similar trips, `;
  } else {
    reasoning += `general patterns, `;
  }
  
  reasoning += `${mode} is `;
  
  if (mode === 'cycling' || mode === 'walking') {
    reasoning += `the most eco-friendly option with zero emissions. `;
  } else if (mode === 'public transit') {
    reasoning += `efficient for longer distances with shared emissions. `;
  } else {
    reasoning += `convenient but has higher emissions. `;
  }
  
  if (trafficMultiplier > 1.2) {
    reasoning += `Current traffic conditions may increase travel time and emissions by ${Math.round((trafficMultiplier - 1) * 100)}%.`;
  } else if (trafficMultiplier < 0.9) {
    reasoning += `Light traffic conditions favor efficient travel with reduced emissions.`;
  }
  
  return reasoning;
}

function generateAlternativeRoutes(primaryMode: string, baseEmissions: number) {
  const alternatives: Array<{mode: string, emissions: number, duration: number, cost: number}> = [];
  const modes = ['driving', 'public transit', 'cycling', 'walking'];
  
  modes.filter(mode => mode !== primaryMode).forEach(mode => {
    const emissions = calculateBaseEmissions(mode, 15);
    const duration = getDurationEstimate(mode, 15);
    const cost = getCostEstimate(mode, 15);
    
    alternatives.push({
      mode,
      emissions: Math.round(emissions * 100) / 100,
      duration,
      cost
    });
  });
  
  return alternatives.sort((a, b) => a.emissions - b.emissions);
}

function getDurationEstimate(mode: string, distance: number): number {
  const speeds = {
    'driving': 35, // km/h in city
    'public transit': 25,
    'cycling': 15,
    'walking': 5
  };
  
  const speed = speeds[mode as keyof typeof speeds] || 35;
  return Math.round((distance / speed) * 60); // minutes
}

function getCostEstimate(mode: string, distance: number): number {
  const costs = {
    'driving': distance * 0.5, // $0.50 per km (gas + wear)
    'public transit': 3.5, // Fixed fare
    'cycling': 0.1, // Minimal maintenance
    'walking': 0
  };
  
  return Math.round((costs[mode as keyof typeof costs] || 0) * 100) / 100;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      message: 'Predictive Routing API - Use POST with origin/destination to get route predictions',
      supportedModes: ['driving', 'public transit', 'cycling', 'walking'],
      features: [
        'Historical pattern analysis',
        'Real-time traffic consideration',
        'Optimal departure time suggestions',
        'Multi-modal route comparison',
        'Emission predictions',
        'Cost estimates'
      ]
    });
  } catch (error) {
    console.error('Error in predictive routing API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}