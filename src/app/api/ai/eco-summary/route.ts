'use server';

import { auth } from '@/auth';
import { getAiStory as getAiStoryFlow } from '@/ai/flows/storyteller-flow';
import { getJourneys, getAuthenticatedUserData } from '@/app/actions';
import { NextResponse } from "next/server";
import type { AiStoryInput } from '@/ai/flows/storyteller-flow';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name } = session.user;
        const journeys = await getJourneys();
        const { achievements } = await getAuthenticatedUserData();

        const input: AiStoryInput = {
            journeys: journeys.map(j => ({
                distance: j.distance,
                mode: j.mode,
                emissions: j.emissions,
            })),
            achievements: achievements.map(a => ({
                name: a.name,
                date: new Date(a.date).toLocaleDateString(),
            })),
            userName: name || 'Eco-Warrior',
        };

        const result = await getAiStoryFlow(input);
        return NextResponse.json(result);

    } catch (e) {
        console.error('Error in getAiStory:', e);
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
        return NextResponse.json({ error: 'An unexpected error occurred while generating your story.', details: errorMessage }, { status: 500 });
    }
}
