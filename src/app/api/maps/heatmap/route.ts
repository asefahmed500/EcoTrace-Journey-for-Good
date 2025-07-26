'use server';

import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Journey from '@/models/Journey';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const journeys = await Journey.find({ userId: session.user.id })
            .select('originCoords destinationCoords emissions')
            .lean();

        const heatmapData = journeys
            .filter(j => j.originCoords && j.destinationCoords)
            .flatMap(j => [
                { location: { lat: j.originCoords.lat, lng: j.originCoords.lng }, weight: j.emissions || 0.1 },
                { location: { lat: j.destinationCoords.lat, lng: j.destinationCoords.lng }, weight: j.emissions || 0.1 }
            ]);
        
        return NextResponse.json(heatmapData);
    } catch (e) {
        console.error('Error fetching heatmap data:', e);
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
        return NextResponse.json({ error: 'Failed to fetch heatmap data.', details: errorMessage }, { status: 500 });
    }
}
