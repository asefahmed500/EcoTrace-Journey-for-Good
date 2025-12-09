import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-wrapper';
import { findNearbyEvChargers } from '@/app/actions';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { latitude, longitude } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields: latitude, longitude' },
        { status: 400 }
      );
    }

    const stations = await findNearbyEvChargers(latitude, longitude);
    return NextResponse.json(stations);
  } catch (error) {
    console.error('Error in EV stations API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching EV stations.' },
      { status: 500 }
    );
  }
}