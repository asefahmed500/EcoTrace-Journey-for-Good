'use server';

import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Team from '@/models/Team';
import mongoose from 'mongoose';

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();

        const user = await User.findById(session.user.id).select('teamId').lean();
        if (!user || !user.teamId) {
            // Can also fetch global leaderboard if no team
            const globalLeaderboard = await User.find({}).sort({ totalEmissions: 1 }).limit(10).lean();
            const formatted = globalLeaderboard.map((u, index) => ({
                id: u._id.toString(),
                name: u.name || 'Anonymous User',
                image: u.image,
                totalEmissions: u.totalEmissions || 0,
                rank: index + 1,
            }));
            return NextResponse.json({ type: 'global', leaderboard: formatted });
        }
        
        const teamId = user.teamId;
        const team = await Team.findById(teamId).lean();
        if (!team) {
             return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
        }

        const teamMembers = await User.find({ teamId: team._id })
            .select('name image totalEmissions')
            .sort({ totalEmissions: 1 })
            .lean();

        const leaderboard = teamMembers.map((member, index) => ({
            id: member._id.toString(),
            name: member.name || 'Anonymous User',
            image: member.image,
            totalEmissions: member.totalEmissions || 0,
            rank: index + 1,
        }));

        return NextResponse.json({ type: 'team', name: team.name, leaderboard });

    } catch (e) {
        console.error('Error fetching leaderboard:', e);
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
        return NextResponse.json({ error: 'Failed to fetch leaderboard.', details: errorMessage }, { status: 500 });
    }
}
