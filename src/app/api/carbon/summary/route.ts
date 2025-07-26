'use server';

import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Journey from '@/models/Journey';
import User from '@/models/User';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        
        const user = await User.findById(session.user.id).select('totalEmissions').lean();
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const journeys = await Journey.find({ userId: session.user.id }).lean();
        const ecoFriendlyTrips = journeys.filter(j => j.emissions === 0).length;

        const summary = {
            totalEmissions: user.totalEmissions,
            totalJourneys: journeys.length,
            ecoFriendlyTrips,
        };

        return NextResponse.json(summary);

    } catch (e) {
        console.error('Error fetching carbon summary:', e);
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
        return NextResponse.json({ error: 'Failed to fetch carbon summary.', details: errorMessage }, { status: 500 });
    }
}
