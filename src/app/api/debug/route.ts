import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db';
import Journey from '@/models/Journey';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Get user data
    const user = await User.findById(session.user.id).lean();
    
    // Get user journeys
    const journeys = await Journey.find({ userId: session.user.id }).lean();
    
    // Get all users for leaderboard
    const allUsers = await User.find({ totalEmissions: { $gt: 0 } })
      .select('name totalEmissions achievements')
      .sort({ totalEmissions: 1 })
      .limit(10)
      .lean();

    const debugInfo = {
      user: {
        id: user?._id,
        name: user?.name,
        totalEmissions: user?.totalEmissions,
        achievementsCount: user?.achievements?.length || 0,
        achievements: user?.achievements || []
      },
      journeys: {
        count: journeys.length,
        totalEmissions: journeys.reduce((sum, j) => sum + j.emissions, 0),
        ecoFriendlyTrips: journeys.filter(j => j.emissions === 0).length,
        recent: journeys.slice(0, 3).map(j => ({
          origin: j.origin,
          destination: j.destination,
          mode: j.mode,
          emissions: j.emissions,
          date: j.date
        }))
      },
      leaderboard: {
        count: allUsers.length,
        users: allUsers.map((u, index) => ({
          name: u.name,
          totalEmissions: u.totalEmissions,
          rank: index + 1,
          achievementsCount: u.achievements?.length || 0
        }))
      }
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Debug API failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}