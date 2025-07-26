'use server';

import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { getAuthenticatedUserData } from '@/app/actions';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { achievements } = await getAuthenticatedUserData();
        return NextResponse.json(achievements);
    } catch (e) {
        console.error('Error fetching achievements:', e);
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
        return NextResponse.json({ error: 'Failed to fetch achievements.', details: errorMessage }, { status: 500 });
    }
}
