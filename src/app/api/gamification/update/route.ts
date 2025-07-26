'use server';

import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { checkAndAwardAchievements } from '@/app/actions';

// This is a conceptual endpoint. In the current setup, achievements are awarded
// automatically when a journey is logged. This endpoint could be used for manual
// progress updates for more complex, non-journey-based achievements if they were added.
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        // This action would typically receive some data in the request body
        // that describes the user's action, which would then be evaluated
        // against achievement conditions. For now, we'll just re-check all achievements.
        // const body = await req.json();

        const newAchievements = await checkAndAwardAchievements(user);
        
        if (newAchievements.length > 0) {
            await user.save();
             return NextResponse.json({
                success: true,
                message: `${newAchievements.length} new achievement(s) awarded!`,
                newAchievements,
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Progress updated. No new achievements awarded at this time.',
        });

    } catch (e) {
        console.error('Error updating achievement progress:', e);
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
        return NextResponse.json({ error: 'Failed to update achievement progress.', details: errorMessage }, { status: 500 });
    }
}
