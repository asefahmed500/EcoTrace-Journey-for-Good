'use server';

import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Journey from '@/models/Journey';
import User from '@/models/User';
import { z } from 'zod';
import { calculateRouteCarbonEmissions } from '@/ai/flows/route-carbon-calculator';

// Note: This is a simplified direct "create" endpoint. 
// The main carbon calculation + logging is in /api/carbon/calculate
const createJourneySchema = z.object({
  origin: z.string(),
  destination: z.string(),
  distance: z.number(),
  mode: z.string(),
  emissions: z.number(),
  date: z.string().datetime(),
  originCoords: z.object({ lat: z.number(), lng: z.number() }),
  destinationCoords: z.object({ lat: z.number(), lng: z.number() }),
});

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validatedData = createJourneySchema.parse(body);

        await dbConnect();
        
        const newJourney = await Journey.create({
            ...validatedData,
            userId: session.user.id,
        });

        await User.findByIdAndUpdate(session.user.id, { $inc: { totalEmissions: validatedData.emissions } });

        return NextResponse.json(newJourney, { status: 201 });
    } catch (e) {
        if (e instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data', details: e.errors }, { status: 400 });
        }
        console.error('Error creating journey:', e);
        return NextResponse.json({ error: 'Failed to create journey.' }, { status: 500 });
    }
}


export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const journeys = await Journey.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        
        return NextResponse.json(journeys);
    } catch (e) {
        console.error('Error fetching journeys:', e);
        return NextResponse.json({ error: 'Failed to fetch journey history.' }, { status: 500 });
    }
}
