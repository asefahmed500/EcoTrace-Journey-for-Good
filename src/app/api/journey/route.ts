import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-wrapper';
import { getJourneys } from '@/app/actions';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const journeys = await getJourneys();
    return NextResponse.json(journeys);
  } catch (error) {
    console.error('Error in journey API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching journeys.' },
      { status: 500 }
    );
  }
}