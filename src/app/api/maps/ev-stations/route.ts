'use server';

import { auth } from '@/auth';
import { NextResponse } from "next/server";
import { z } from 'zod';

const evStationsSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validated = evStationsSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: 'Invalid input. Latitude and longitude are required.' }, { status: 400 });
        }
        
        const { latitude, longitude } = validated.data;
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Google Maps API key is not configured.' }, { status: 500 });
        }

        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=electric_vehicle_charging_station&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK') {
            return NextResponse.json({ error: `Could not find nearby chargers. Google Places API status: ${data.status}`, details: data.error_message || '' }, { status: 500 });
        }

        const stations = data.results.map((place: any) => ({
            id: place.place_id,
            name: place.name,
            vicinity: place.vicinity,
            location: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
            },
            isOpenNow: place.opening_hours?.open_now ?? 'unknown',
        }));

        return NextResponse.json(stations);

    } catch (e) {
        console.error('Error in findNearbyEvChargers:', e);
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
        return NextResponse.json({ error: 'An unexpected error occurred while finding EV chargers.', details: errorMessage }, { status: 500 });
    }
}
