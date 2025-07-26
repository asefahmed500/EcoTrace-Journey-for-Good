'use server';

import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Team from '@/models/Team';
import Journey from '@/models/Journey';

export async function DELETE() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }

        // If user is in a team, remove them from the team's member list
        if (user.teamId) {
            await Team.findByIdAndUpdate(user.teamId, { 
                $pull: { members: user._id }
            });
        }

        // Delete all journeys associated with the user
        await Journey.deleteMany({ userId: session.user.id });

        // Finally, delete the user document
        await User.findByIdAndDelete(session.user.id);

        return NextResponse.json({
            success: true,
            message: 'Your account and all associated data have been permanently deleted.',
        });

    } catch (e) {
        console.error('Error in deleteAccount:', e);
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
        return NextResponse.json({ error: 'An unexpected error occurred while deleting your account.', details: errorMessage }, { status: 500 });
    }
}
