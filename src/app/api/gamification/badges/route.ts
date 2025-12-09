import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserData } from '@/app/actions';
import { getAuthSession } from '@/lib/auth-wrapper';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { achievements } = await getAuthenticatedUserData();
    return NextResponse.json({ achievements });
  } catch (error) {
    console.error('Error in badges API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching badges.' },
      { status: 500 }
    );
  }
}