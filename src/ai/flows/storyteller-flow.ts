'use server';
/**
 * @fileOverview Creates a personalized narrative summary of a user's eco-journey.
 *
 * - getAiStory - Generates a story based on user's journeys and achievements.
 * - AiStoryInput - The input type for the getAiStory function.
 * - AiStoryOutput - The return type for the getAiStory function.
 */

import {z} from 'zod';
import type {Journey, Achievement} from '@/lib/types';

const AiStoryInputSchema = z.object({
  journeys: z.array(z.any()).describe("A list of the user's logged journeys."),
  achievements: z
    .array(z.any())
    .describe("A list of the user's earned achievements."),
  userName: z.string().describe("The user's name."),
});
export type AiStoryInput = z.infer<typeof AiStoryInputSchema>;

const AiStoryOutputSchema = z.object({
  title: z.string().describe('A catchy, encouraging title for the story.'),
  narrative: z
    .string()
    .describe(
      'The personalized story in Markdown format. It should be engaging, positive, and insightful.'
    ),
});
export type AiStoryOutput = z.infer<typeof AiStoryOutputSchema>;

export async function getAiStory(
  input: AiStoryInput
): Promise<AiStoryOutput> {
  // Mock implementation without Google AI
  const totalEmissions = input.journeys.reduce((sum: number, journey: any) => sum + (journey.emissions || 0), 0);
  const avgEmissions = totalEmissions / Math.max(input.journeys.length, 1);
  const mostUsedMode = getMostUsedTransportMode(input.journeys);
  
  const title = input.journeys.length > 10 
    ? `Amazing Progress, ${input.userName}!` 
    : `Great Start, ${input.userName}!`;

  const narrative = generatePersonalizedNarrative(input, totalEmissions, avgEmissions, mostUsedMode);

  return {
    title,
    narrative
  };
}

function getMostUsedTransportMode(journeys: any[]): string {
  const modeCounts: Record<string, number> = {};
  journeys.forEach(journey => {
    const mode = journey.mode || 'unknown';
    modeCounts[mode] = (modeCounts[mode] || 0) + 1;
  });
  
  return Object.entries(modeCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'various modes';
}

function generatePersonalizedNarrative(
  input: AiStoryInput, 
  totalEmissions: number, 
  avgEmissions: number, 
  mostUsedMode: string
): string {
  const { userName, journeys, achievements } = input;
  
  let narrative = `Hello ${userName}! 🌱\n\n`;
  
  // Celebrate their effort
  if (journeys.length > 0) {
    narrative += `**Fantastic work!** You've logged ${journeys.length} journey${journeys.length > 1 ? 's' : ''} and are actively tracking your environmental impact. `;
    
    if (totalEmissions < avgEmissions * journeys.length * 0.8) {
      narrative += `Your commitment to eco-friendly travel is really showing - you're keeping your emissions lower than average! 🎉\n\n`;
    } else {
      narrative += `Every journey logged is a step toward greater environmental awareness! 🚀\n\n`;
    }
  }
  
  // Highlight achievements
  if (achievements.length > 0) {
    narrative += `**Achievements Unlocked:** ${achievements.length} badge${achievements.length > 1 ? 's' : ''}! `;
    const recentAchievement = achievements[achievements.length - 1];
    if (recentAchievement) {
      narrative += `Your latest achievement "${recentAchievement.name}" shows your dedication to sustainable travel. `;
    }
    narrative += `Keep up the excellent work! 🏆\n\n`;
  }
  
  // Analyze travel patterns
  narrative += `**Your Travel Insights:**\n`;
  narrative += `- Primary transport mode: **${mostUsedMode}**\n`;
  narrative += `- Total emissions tracked: **${totalEmissions.toFixed(2)} kg CO₂**\n`;
  narrative += `- Average per journey: **${avgEmissions.toFixed(2)} kg CO₂**\n\n`;
  
  // Provide encouragement and tips
  if (mostUsedMode === 'walking' || mostUsedMode === 'cycling') {
    narrative += `**Amazing!** Your preference for ${mostUsedMode} is making a real difference. You're not just reducing emissions - you're staying healthy and setting a great example! 💪\n\n`;
  } else if (mostUsedMode === 'public transit') {
    narrative += `**Great choice!** Using public transit significantly reduces your carbon footprint compared to driving. You're part of the solution! 🚌\n\n`;
  } else {
    narrative += `**Tip for next week:** Consider trying public transit or cycling for just one of your regular trips. Small changes can make a big impact! 🌍\n\n`;
  }
  
  narrative += `Keep tracking, keep improving, and remember - every sustainable choice matters!\n\n`;
  narrative += `*Stay green,*  \n**Your EcoTrace Team** 🌿`;
  
  return narrative;
}
