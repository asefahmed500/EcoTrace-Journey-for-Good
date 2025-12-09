import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { createTeam, joinTeam } from '@/app/actions';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const body = await request.json();

    if (action === 'create') {
      const { teamName } = body;
      if (!teamName) {
        return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
      }

      const formData = new FormData();
      formData.append('teamName', teamName);

      const result = await createTeam({ message: '', type: 'create' }, formData);
      
      if (result.message && !result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: result.message });
    } else if (action === 'join') {
      const { inviteCode } = body;
      if (!inviteCode) {
        return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });
      }

      const formData = new FormData();
      formData.append('inviteCode', inviteCode);

      const result = await joinTeam({ message: '', type: 'join' }, formData);
      
      if (result.message && !result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: result.message });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in team API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing team request.' },
      { status: 500 }
    );
  }
}