import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-wrapper';

interface AirQualityZone {
  coordinates: Array<{ lat: number; lng: number }>;
  aqi: number;
  location: string;
  pollutants: {
    pm25: number;
    pm10: number;
    no2: number;
    o3: number;
    co: number;
  };
  healthRecommendations: string[];
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { latitude, longitude, radius = 10 } = await request.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // In a real application, you would call an actual air quality API
    // For demo purposes, we'll generate realistic mock data
    const airQualityZones = generateAirQualityZones(latitude, longitude, radius);

    return NextResponse.json({
      zones: airQualityZones,
      timestamp: new Date().toISOString(),
      source: 'EcoTrace Air Quality Network'
    });
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch air quality data' },
      { status: 500 }
    );
  }
}

function generateAirQualityZones(centerLat: number, centerLng: number, radius: number): AirQualityZone[] {
  const zones: AirQualityZone[] = [];
  const numZones = Math.floor(Math.random() * 8) + 5; // 5-12 zones
  
  for (let i = 0; i < numZones; i++) {
    // Generate random offset within radius
    const offsetLat = (Math.random() - 0.5) * (radius / 111); // Rough conversion to degrees
    const offsetLng = (Math.random() - 0.5) * (radius / 111);
    
    const zoneLat = centerLat + offsetLat;
    const zoneLng = centerLng + offsetLng;
    
    // Generate realistic AQI based on urban density simulation
    const urbanDensity = Math.random();
    const baseAQI = urbanDensity > 0.7 ? 80 + Math.random() * 100 : 20 + Math.random() * 60;
    const aqi = Math.round(Math.max(10, Math.min(300, baseAQI)));
    
    // Generate pollutant levels based on AQI
    const pm25 = Math.round(aqi * 0.4 + Math.random() * 10);
    const pm10 = Math.round(pm25 * 1.5 + Math.random() * 15);
    const no2 = Math.round(aqi * 0.3 + Math.random() * 20);
    const o3 = Math.round(aqi * 0.5 + Math.random() * 25);
    const co = Math.round(aqi * 0.1 + Math.random() * 5);
    
    // Generate zone boundaries (roughly rectangular)
    const zoneSize = 0.01 + Math.random() * 0.02; // 1-3km zones
    const coordinates = [
      { lat: zoneLat + zoneSize, lng: zoneLng + zoneSize },
      { lat: zoneLat + zoneSize, lng: zoneLng - zoneSize },
      { lat: zoneLat - zoneSize, lng: zoneLng - zoneSize },
      { lat: zoneLat - zoneSize, lng: zoneLng + zoneSize }
    ];
    
    // Generate health recommendations based on AQI
    const healthRecommendations = generateHealthRecommendations(aqi);
    
    zones.push({
      coordinates,
      aqi,
      location: `Zone ${i + 1} (${zoneLat.toFixed(3)}, ${zoneLng.toFixed(3)})`,
      pollutants: { pm25, pm10, no2, o3, co },
      healthRecommendations
    });
  }
  
  return zones;
}

function generateHealthRecommendations(aqi: number): string[] {
  const recommendations: string[] = [];
  
  if (aqi <= 50) {
    recommendations.push('Air quality is good - perfect for outdoor activities');
    recommendations.push('Great conditions for cycling and walking');
  } else if (aqi <= 100) {
    recommendations.push('Air quality is moderate - outdoor activities are generally safe');
    recommendations.push('Sensitive individuals should consider reducing prolonged outdoor exertion');
  } else if (aqi <= 150) {
    recommendations.push('Unhealthy for sensitive groups');
    recommendations.push('Consider indoor alternatives for exercise');
    recommendations.push('People with respiratory conditions should limit outdoor activities');
  } else if (aqi <= 200) {
    recommendations.push('Air quality is unhealthy - limit outdoor activities');
    recommendations.push('Wear a mask if you must go outside');
    recommendations.push('Consider postponing outdoor exercise');
  } else {
    recommendations.push('Air quality is very unhealthy - avoid outdoor activities');
    recommendations.push('Stay indoors with windows closed');
    recommendations.push('Use air purifiers if available');
  }
  
  return recommendations;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return general air quality information
    return NextResponse.json({
      message: 'Air Quality API - Use POST with coordinates to get zone data',
      supportedPollutants: ['PM2.5', 'PM10', 'NO2', 'O3', 'CO'],
      aqiScale: {
        'Good': '0-50',
        'Moderate': '51-100',
        'Unhealthy for Sensitive': '101-150',
        'Unhealthy': '151-200',
        'Very Unhealthy': '201-300'
      }
    });
  } catch (error) {
    console.error('Error in air quality API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}