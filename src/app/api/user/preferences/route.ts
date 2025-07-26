'use server';

import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { z } from 'zod';

const preferencesSchema = z.object({
  favoriteRoutes: z.string().trim().max(100, 'Favorite routes cannot exceed 100 characters.').optional(),
  transportModes: z.string().trim().max(100, 'Transport modes cannot exceed 100 characters.').optional(),
  environmentalPriorities: z.string().trim().max(200, 'Priorities cannot exceed 200 characters.').optional(),
});

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
        await dbConnect();
        const user = await User.findById(session.user.id).select('preferences').lean();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user.preferences || {});
    } catch (e) {
        console.error('Error fetching preferences:', e);
        return NextResponse.json({ error: 'Failed to fetch preferences.' }, { status: 500 });
    }
}


export async function PUT(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
        const body = await req.json();
        const validatedFields = preferencesSchema.safeParse(body);
        
        if (!validatedFields.success) {
            return NextResponse.json({
                error: 'Invalid input.',
                fieldErrors: validatedFields.error.flatten().fieldErrors,
            }, { status: 400 });
        }

        await dbConnect();
        await User.findByIdAndUpdate(session.user.id, {
            preferences: validatedFields.data,
        });

        return NextResponse.json({ success: true, message: 'Your preferences have been updated.' });

    } catch (e) {
        console.error('Error updating preferences:', e);
        return NextResponse.json({ error: 'Failed to update preferences.' }, { status: 500 });
    }
}
