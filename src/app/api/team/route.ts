'use server';

import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Team from '@/models/Team';
import { z } from 'zod';
import crypto from 'crypto';

const createTeamSchema = z.object({
  teamName: z.string().min(3, 'Team name must be at least 3 characters.').max(50, 'Team name cannot exceed 50 characters.'),
});

const joinTeamSchema = z.object({
  inviteCode: z.string().trim().length(8, 'Invite code must be 8 characters.'),
});

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action'); // 'create' or 'join'
    const body = await req.json();

    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    if (user.teamId) {
        return NextResponse.json({ error: 'You are already in a team.' }, { status: 400 });
    }

    if (action === 'create') {
        const validated = createTeamSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json({ error: 'Invalid data', details: validated.error.flatten().fieldErrors }, { status: 400 });
        }
        const { teamName } = validated.data;
        
        const newTeam = await Team.create({
            name: teamName,
            members: [user._id],
            inviteCode: crypto.randomBytes(4).toString('hex').toUpperCase(),
        });

        user.teamId = newTeam._id;
        await user.save();

        return NextResponse.json({ success: true, message: `Successfully created team: ${teamName}`, team: newTeam }, { status: 201 });

    } else if (action === 'join') {
        const validated = joinTeamSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json({ error: 'Invalid data', details: validated.error.flatten().fieldErrors }, { status: 400 });
        }
        const { inviteCode } = validated.data;
        
        const team = await Team.findOne({ inviteCode: inviteCode.toUpperCase() });
        if (!team) {
            return NextResponse.json({ error: 'Invalid invite code.' }, { status: 404 });
        }

        team.members.push(user._id);
        await team.save();

        user.teamId = team._id;
        await user.save();
        
        return NextResponse.json({ success: true, message: `Successfully joined team: ${team.name}`, team });

    } else {
        return NextResponse.json({ error: 'Invalid action. Must be "create" or "join".' }, { status: 400 });
    }
}
