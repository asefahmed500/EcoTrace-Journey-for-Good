'use server';

import { auth } from '@/auth';
import { suggestOptimalDepartureTimes } from '@/ai/flows/predictive-routing';
import { getAuthenticatedUserData } from '@/app/actions';
import { NextResponse } from "next/server";
import { z } from 'zod';

const predictiveRoutingSchema = z.object({
  origin: z.string().trim().min(3, { message: 'Origin must be at least 3 characters.' }),
  destination: z.string().trim().min(3, { message: 'Destination must be at least 3 characters.' }),
  transportMode: z.string().min(1, { message: 'Transport mode is required.' }),
});

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validatedFields = predictiveRoutingSchema.safeParse(body);
        
        if (!validatedFields.success) {
            return NextResponse.json({ error: 'Invalid input.', fieldErrors: validatedFields.error.flatten().fieldErrors }, { status: 400 });
        }

        const { preferences } = await getAuthenticatedUserData();
        const preferencesString = `
            - Favorite Routes: ${preferences.favoriteRoutes || 'Not specified'}
            - Preferred Transport Modes: ${preferences.transportModes || 'Not specified'}
            - Environmental Priorities: ${preferences.environmentalPriorities || 'Not specified'}
        `;

        const result = await suggestOptimalDepartureTimes({
            ...validatedFields.data,
            preferences: preferencesString,
        });

        return NextResponse.json(result);

    } catch (e) {
        console.error('Error in handlePredictiveRouting:', e);
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
        return NextResponse.json({ error: 'An unexpected error occurred while predicting routes.', details: errorMessage }, { status: 500 });
    }
}
