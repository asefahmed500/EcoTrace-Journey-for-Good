import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-wrapper';
import { getLeaderboard } from '@/app/actions';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leaderboard = await getLeaderboard();
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error in team leaderboard API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching leaderboard.' },
      { status: 500 }
    );
  }
}