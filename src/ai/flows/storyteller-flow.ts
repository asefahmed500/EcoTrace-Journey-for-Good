'use server';
/**
 * @fileOverview Creates a personalized narrative summary of a user's eco-journey.
 *
 * - getAiStory - Generates a story based on user's journeys and achievements.
 * - AiStoryInput - The input type for the getAiStory function.
 * - AiStoryOutput - The return type for the getAiStory function.
 */

import {ai} from '@/ai/genkit';
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
  return storytellerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'storytellerPrompt',
  input: {schema: AiStoryInputSchema},
  output: {schema: AiStoryOutputSchema},
  prompt: `You are an AI Eco-Coach named "Leafy". Your role is to be an encouraging, positive, and insightful companion for users on their sustainability journey.

  Your task is to analyze the user's activity and write a personalized narrative summary. The tone should be like a friendly check-in, not a dry report. Use Markdown for formatting (bolding, lists).

  User's Name: {{{userName}}}
  Number of Journeys Logged: {{journeys.length}}
  Achievements Unlocked: {{achievements.length}}

  Here are the user's achievements:
  {{#each achievements}}
  - {{this.name}}: Earned on {{this.date}}
  {{/each}}

  Based on the data provided, generate a narrative. Here are the steps:
  1.  **Create a catchy, positive title.** Something like "Your Month in Eco-Action!" or "A Great Start, {{{userName}}}!".
  2.  **Write the narrative in Markdown.**
      *   Start with a warm, personal greeting.
      *   Celebrate their overall effort (number of journeys logged).
      *   Highlight 1-2 key achievements they've earned. Connect the achievement to their actions. For example, "I saw you earned the 'Pedal Power' badge - amazing! Those cycling trips are really making a difference."
      *   Analyze their journeys. Find an interesting insight. Did they use public transport a lot? Have they taken a particularly long trip? Or many zero-emission trips? Mention this pattern.
      *   Offer a simple, actionable tip for the future based on their data. For example, if they drive a lot, suggest trying public transit for one trip next week. If they walk a lot, praise them and encourage them to keep it up.
      *   End with an uplifting and motivational sign-off.

  The goal is to make the user feel seen, celebrated, and motivated. Keep it concise, friendly, and positive.
  `,
});

const storytellerFlow = ai.defineFlow(
  {
    name: 'storytellerFlow',
    inputSchema: AiStoryInputSchema,
    outputSchema: AiStoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to generate a valid response for the AI story.');
    }
    return output;
  }
);
