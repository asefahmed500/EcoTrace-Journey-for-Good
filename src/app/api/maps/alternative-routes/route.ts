import { NextRequest, NextResponse } from 'next/server';

interface RouteOption {
  id: string;
  mode: string;
  duration: string;
  distance: string;
  emissions: number;
  cost?: number;
  description: string;
  route: any; // Google Maps route data
}

// CO2 emissions per km for different transport modes (kg CO2/km)
const EMISSIONS_FACTORS = {
  driving: 0.2, // Average car
  walking: 0,
  cycling: 0,
  public_transport: 0.05, // Bus/train average
  transit: 0.05,
  bus: 0.05,
  train: 0.04,
  subway: 0.04,
  tram: 0.04,
};

export async function POST(request: NextRequest) {
  try {
    const { origin, destination, preferredMode } = await request.json();

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    // Get routes for different transport modes
    const transportModes = ['driving', 'transit', 'walking', 'bicycling'];
    const routes: RouteOption[] = [];

    for (const mode of transportModes) {
      try {
        const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}&key=${apiKey}`;
        
        const response = await fetch(directionsUrl);
        const data = await response.json();

        if (data.status === 'OK' && data.routes.length > 0) {
          const route = data.routes[0];
          const leg = route.legs[0];
          
          // Calculate distance in km
          const distanceKm = leg.distance.value / 1000;
          
          // Calculate emissions
          const emissionsFactor = EMISSIONS_FACTORS[mode as keyof typeof EMISSIONS_FACTORS] || 0.2;
          const emissions = distanceKm * emissionsFactor;

          routes.push({
            id: `${mode}-${Date.now()}`,
            mode: mode,
            duration: leg.duration.text,
            distance: leg.distance.text,
            emissions: emissions,
            description: getRouteDescription(mode, emissions, distanceKm),
            route: route,
          });
        }
      } catch (error) {
        console.error(`Error fetching ${mode} route:`, error);
      }
    }

    // Sort routes by emissions (lowest first)
    routes.sort((a, b) => a.emissions - b.emissions);

    // Add AI suggestions based on emissions
    const suggestions = generateAISuggestions(routes, preferredMode);

    return NextResponse.json({
      routes,
      suggestions,
      summary: {
        totalRoutes: routes.length,
        lowestEmissions: routes[0]?.emissions || 0,
        highestEmissions: routes[routes.length - 1]?.emissions || 0,
        bestMode: routes[0]?.mode || 'unknown',
      }
    });

  } catch (error) {
    console.error('Error in alternative routes API:', error);
    return NextResponse.json(
      { error: 'Failed to get alternative routes' },
      { status: 500 }
    );
  }
}

function getRouteDescription(mode: string, emissions: number, distance: number): string {
  switch (mode) {
    case 'walking':
      return `Zero-emission journey. Great for short distances and your health!`;
    case 'bicycling':
      return `Zero-emission journey. Perfect for moderate distances and staying active.`;
    case 'transit':
      return `Shared transportation with low emissions. Reduces traffic congestion.`;
    case 'driving':
      return emissions < 1 
        ? `Low-emission driving route. Consider carpooling to reduce impact further.`
        : `Standard driving route. Consider alternatives for better environmental impact.`;
    default:
      return `Transportation option with ${emissions.toFixed(2)} kg CO2 emissions.`;
  }
}

function generateAISuggestions(routes: RouteOption[], preferredMode?: string): string[] {
  const suggestions: string[] = [];
  
  if (routes.length === 0) {
    return ['No routes available for this journey.'];
  }

  const bestRoute = routes[0];
  const worstRoute = routes[routes.length - 1];
  
  if (bestRoute.emissions === 0) {
    suggestions.push(`🌱 **Best choice**: ${bestRoute.mode} - Zero emissions!`);
  } else if (bestRoute.emissions < 1) {
    suggestions.push(`🌱 **Eco-friendly**: ${bestRoute.mode} - Only ${bestRoute.emissions.toFixed(2)} kg CO2`);
  }

  if (worstRoute.emissions > 5) {
    suggestions.push(`⚠️ **Avoid**: ${worstRoute.mode} - High emissions (${worstRoute.emissions.toFixed(2)} kg CO2)`);
  }

  const walkingRoute = routes.find(r => r.mode === 'walking');
  const cyclingRoute = routes.find(r => r.mode === 'bicycling');
  
  if (walkingRoute && walkingRoute.route.legs[0].distance.value < 2000) {
    suggestions.push(`🚶 **Walking recommended**: Only ${walkingRoute.distance} - great for short trips!`);
  }
  
  if (cyclingRoute && cyclingRoute.route.legs[0].distance.value < 10000) {
    suggestions.push(`🚴 **Cycling option**: ${cyclingRoute.distance} - healthy and zero emissions!`);
  }

  const transitRoute = routes.find(r => r.mode === 'transit');
  if (transitRoute && transitRoute.emissions < worstRoute.emissions * 0.5) {
    suggestions.push(`🚌 **Public transport**: ${transitRoute.emissions.toFixed(2)} kg CO2 vs ${worstRoute.emissions.toFixed(2)} kg CO2`);
  }

  return suggestions;
} 