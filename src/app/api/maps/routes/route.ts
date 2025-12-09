import { NextRequest, NextResponse } from 'next/server';

interface RouteRequest {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  includeAlternatives?: boolean;
}

interface RouteOption {
  id: string;
  mode: 'driving' | 'walking' | 'cycling' | 'transit';
  duration: string;
  distance: string;
  emissions: number;
  cost?: number;
  description: string;
  polyline?: string;
  steps?: any[];
  bounds?: any;
}

// Emission factors (kg CO2 per km)
const EMISSION_FACTORS = {
  driving: 0.21,    // Average car
  transit: 0.05,    // Public transport
  cycling: 0,       // Zero emissions
  walking: 0        // Zero emissions
};

// Cost estimates (per km)
const COST_ESTIMATES = {
  driving: 0.56,    // Gas + wear
  transit: 0.10,    // Average fare per km
  cycling: 0.02,    // Maintenance
  walking: 0        // Free
};

function calculateEmissions(distanceKm: number, mode: string): number {
  const factor = EMISSION_FACTORS[mode as keyof typeof EMISSION_FACTORS] || 0;
  return distanceKm * factor;
}

function calculateCost(distanceKm: number, mode: string): number {
  const factor = COST_ESTIMATES[mode as keyof typeof COST_ESTIMATES] || 0;
  return distanceKm * factor;
}

function parseDistance(distanceText: string): number {
  // Extract numeric value from distance text (e.g., "5.2 km" -> 5.2)
  const match = distanceText.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
}

async function getGoogleDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: string
): Promise<any> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  // Map our modes to Google's travel modes
  const travelModeMap: { [key: string]: string } = {
    driving: 'DRIVING',
    walking: 'WALKING',
    cycling: 'BICYCLING',
    transit: 'TRANSIT'
  };

  const travelMode = travelModeMap[mode] || 'DRIVING';
  
  const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
  url.searchParams.set('origin', `${origin.lat},${origin.lng}`);
  url.searchParams.set('destination', `${destination.lat},${destination.lng}`);
  url.searchParams.set('mode', travelMode);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('alternatives', 'true');

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Google Directions API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.status !== 'OK') {
    throw new Error(`Google Directions API status: ${data.status}`);
  }

  return data;
}

export async function POST(request: NextRequest) {
  try {
    const body: RouteRequest = await request.json();
    const { origin, destination, includeAlternatives = true } = body;

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    const routes: RouteOption[] = [];
    const modes = ['driving', 'walking', 'cycling', 'transit'];

    // Get routes for each transportation mode
    for (const mode of modes) {
      try {
        const directionsData = await getGoogleDirections(origin, destination, mode);
        
        if (directionsData.routes && directionsData.routes.length > 0) {
          directionsData.routes.forEach((route: any, index: number) => {
            const leg = route.legs[0]; // Assuming single leg journey
            if (!leg) return;

            const distanceKm = parseDistance(leg.distance.text);
            const emissions = calculateEmissions(distanceKm, mode);
            const cost = calculateCost(distanceKm, mode);

            const routeOption: RouteOption = {
              id: `${mode}-${index}`,
              mode: mode as any,
              duration: leg.duration.text,
              distance: leg.distance.text,
              emissions,
              cost: cost > 0 ? cost : undefined,
              description: getRouteDescription(mode, distanceKm, emissions),
              polyline: route.overview_polyline?.points,
              steps: leg.steps,
              bounds: route.bounds
            };

            routes.push(routeOption);
          });
        }
      } catch (error) {
        console.warn(`Failed to get ${mode} directions:`, error);
        // Continue with other modes even if one fails
      }
    }

    if (routes.length === 0) {
      return NextResponse.json(
        { error: 'No routes found between the specified locations' },
        { status: 404 }
      );
    }

    // Sort routes by emissions (eco-friendly first)
    routes.sort((a, b) => a.emissions - b.emissions);

    return NextResponse.json({
      routes,
      summary: {
        totalRoutes: routes.length,
        ecoFriendlyOptions: routes.filter(r => r.emissions === 0).length,
        bestEmission: Math.min(...routes.map(r => r.emissions))
      }
    });

  } catch (error) {
    console.error('Route calculation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to calculate routes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getRouteDescription(mode: string, distanceKm: number, emissions: number): string {
  const descriptions: { [key: string]: string } = {
    walking: emissions === 0 
      ? `Eco-friendly walking route. Great exercise and zero emissions!`
      : `Walking route covering ${distanceKm.toFixed(1)} km`,
    cycling: emissions === 0
      ? `Carbon-neutral cycling route. Fast and environmentally friendly!`
      : `Cycling route covering ${distanceKm.toFixed(1)} km`,
    transit: `Public transport route. Shared transportation reduces individual carbon footprint.`,
    driving: `Driving route. Consider carpooling or alternative transport to reduce emissions.`
  };

  return descriptions[mode] || `${mode} route covering ${distanceKm.toFixed(1)} km`;
}