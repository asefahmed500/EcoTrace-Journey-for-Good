'use server';

import { auth } from '@/auth';
import { getCommunityImpactZones as getCommunityImpactZonesFlow } from '@/ai/flows/community-impact-flow';
import {NextResponse} from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { latitude, longitude, radius } = body;

        if (typeof latitude !== 'number' || typeof longitude !== 'number' || typeof radius !== 'number') {
            return NextResponse.json({ error: 'Invalid input. Latitude, longitude, and radius must be numbers.' }, { status: 400 });
        }
        
        const result = await getCommunityImpactZonesFlow({ latitude, longitude, radius });
        return NextResponse.json(result);
    } catch (e) {
        console.error('Error in getCommunityImpactZones:', e);
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
        return NextResponse.json({ error: 'An unexpected error occurred while finding impact zones.', details: errorMessage }, { status: 500 });
    }
}
