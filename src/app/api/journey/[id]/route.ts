'use server';

import { getAuthSession } from '@/lib/auth-wrapper';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Journey from '@/models/Journey';
import User from '@/models/User';
import mongoose from 'mongoose';

async function getJourney(id: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
    }
    const journey = await Journey.findOne({ _id: id, userId });
    return journey;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getAuthSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { id } = await params;
        const journey = await getJourney(id, session.user.id);

        if (!journey) {
            return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
        }
        
        return NextResponse.json(journey);
    } catch (e) {
        console.error('Error fetching journey:', e);
        return NextResponse.json({ error: 'Failed to fetch journey.' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getAuthSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { id } = await params;
        const journey = await getJourney(id, session.user.id);

        if (!journey) {
            return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
        }

        const body = await req.json();
        // For simplicity, allowing updates to origin/destination.
        // A more complex implementation might recalculate distance and emissions.
        const { origin, destination, mode, vehicleType } = body;
        
        const oldEmissions = journey.emissions;
        
        // Simple update, not recalculating emissions for this example
        journey.set(body);
        const updatedJourney = await journey.save();
        const newEmissions = updatedJourney.emissions;

        // Update user's total emissions if it changed
        if (oldEmissions !== newEmissions) {
            await User.findByIdAndUpdate(session.user.id, { $inc: { totalEmissions: newEmissions - oldEmissions } });
        }
        
        return NextResponse.json(updatedJourney);
    } catch (e) {
        console.error('Error updating journey:', e);
        return NextResponse.json({ error: 'Failed to update journey.' }, { status: 500 });
    }
}


export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getAuthSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
        await dbConnect();
        const { id } = await params;
        const journey = await getJourney(id, session.user.id);

        if (!journey) {
            return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
        }

        const emissionsToDecrement = journey.emissions;

        await journey.deleteOne();

        // Decrement user's total emissions
        await User.findByIdAndUpdate(session.user.id, { $inc: { totalEmissions: -emissionsToDecrement } });

        return NextResponse.json({ success: true, message: 'Journey deleted successfully.' });

    } catch (e) {
        console.error('Error deleting journey:', e);
        return NextResponse.json({ error: 'Failed to delete journey.' }, { status: 500 });
    }
}
