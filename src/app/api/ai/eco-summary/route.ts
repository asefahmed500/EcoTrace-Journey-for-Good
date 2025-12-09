import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-wrapper';
// import { getAiStory } from '@/app/actions';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    // For now, allow unauthenticated access to avoid blocking the feature
    // In production, you should require authentication
    const userId = session?.user?.id || 'anonymous';

    // Check if Gemini API key is available
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      // Return fallback story if no API key
      const fallbackStory = {
        title: "Your EcoTrace Journey",
        narrative: `# Welcome to EcoTrace! 🌱

Start logging your journeys to see your personalized environmental impact story. Every trip you track helps build a comprehensive picture of your carbon footprint and environmental consciousness.

## What You Can Track:
- **Walking & Cycling**: Zero-emission journeys
- **Public Transport**: Shared mobility solutions
- **Driving**: Personal vehicle emissions
- **Other Modes**: Various transportation options

## Your Impact Matters:
Whether you're walking, cycling, driving, or using public transport, each journey contributes to your unique sustainability narrative. Track your progress and see how small changes make a big difference!`
      };

      return NextResponse.json(fallbackStory);
    }

    // TODO: Implement actual AI story generation with Gemini API
    // For now, return a more detailed fallback story
    const fallbackStory = {
      title: "Your EcoTrace Journey",
      narrative: `# Your Environmental Impact Story 🌍

Welcome to EcoTrace! You're on a journey to understand and reduce your carbon footprint through intelligent journey tracking.

## What We Track:
- **Carbon Emissions**: Every journey's environmental impact
- **Transportation Modes**: From walking to driving
- **Distance Covered**: Total kilometers traveled
- **Eco-Friendly Choices**: Green transportation options

## Your Progress:
Start logging your daily journeys to build a comprehensive picture of your environmental consciousness. Whether you're walking, cycling, driving, or using public transport, each trip contributes to your unique sustainability narrative.

## Next Steps:
1. Log your first journey
2. Track your daily commute
3. Explore alternative routes
4. Monitor your carbon footprint
5. Celebrate eco-friendly choices

*Your journey to sustainability starts with a single step!*`
    };

    return NextResponse.json(fallbackStory);
  } catch (error) {
    console.error('Error in eco-summary API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while generating your AI story.' },
      { status: 500 }
    );
  }
}