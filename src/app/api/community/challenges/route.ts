import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Journey from '@/models/Journey';
import { ecoChallenges } from '@/lib/achievements';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Get user's active challenges (this would be stored in user model in real app)
    const user = await User.findById(session.user.id);
    const activeChallenges = user?.activeChallenges || [];
    
    // Get available challenges (not currently active)
    const availableChallenges = ecoChallenges.filter(
      challenge => !activeChallenges.some((ac: any) => ac.challengeId === challenge.id)
    );

    return NextResponse.json({
      activeChallenges,
      availableChallenges
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { challengeId } = await request.json();
    
    if (!challengeId) {
      return NextResponse.json(
        { error: 'Challenge ID is required' },
        { status: 400 }
      );
    }

    const challenge = ecoChallenges.find(c => c.id === challengeId);
    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    await dbConnect();
    
    // Add challenge to user's active challenges
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const newActiveChallenge = {
      challengeId: challenge.id,
      startDate: new Date(),
      progress: 0,
      completed: false
    };

    user.activeChallenges = user.activeChallenges || [];
    user.activeChallenges.push(newActiveChallenge);
    await user.save();

    return NextResponse.json({
      success: true,
      message: `Started challenge: ${challenge.name}`,
      activeChallenge: newActiveChallenge
    });
  } catch (error) {
    console.error('Error starting challenge:', error);
    return NextResponse.json(
      { error: 'Failed to start challenge' },
      { status: 500 }
    );
  }
}