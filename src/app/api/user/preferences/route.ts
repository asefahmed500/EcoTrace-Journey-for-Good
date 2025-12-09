import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-wrapper';
import { getAuthenticatedUserData, updateUserPreferences } from '@/app/actions';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { preferences } = await getAuthenticatedUserData();
    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error in user preferences GET API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching preferences.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { favoriteRoutes, transportModes, environmentalPriorities } = body;

    // Convert to FormData format expected by the server action
    const formData = new FormData();
    if (favoriteRoutes) formData.append('favoriteRoutes', favoriteRoutes);
    if (transportModes) formData.append('transportModes', transportModes);
    if (environmentalPriorities) formData.append('environmentalPriorities', environmentalPriorities);

    const result = await updateUserPreferences(null, formData);
    
    if (!result?.success) {
      return NextResponse.json({ error: result?.message || 'Failed to update preferences' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error('Error in user preferences PUT API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating preferences.' },
      { status: 500 }
    );
  }
}