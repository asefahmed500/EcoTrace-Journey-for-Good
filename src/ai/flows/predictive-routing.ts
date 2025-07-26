
// src/ai/flows/predictive-routing.ts
'use server';

/**
 * @fileOverview A flow for suggesting optimal departure times for routes based on predicted traffic patterns to minimize carbon emissions.
 *
 * - suggestOptimalDepartureTimes - A function that suggests optimal departure times for a given route.
 * - SuggestOptimalDepartureTimesInput - The input type for the suggestOptimalDepartureTimes function.
 * - SuggestOptimalDepartureTimesOutput - The return type for the suggestOptimalDepartureTimes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalDepartureTimesInputSchema = z.object({
  origin: z.string().describe('The starting point of the route.'),
  destination: z.string().describe('The destination of the route.'),
  transportMode: z
    .string()
    .describe(
      'The mode of transportation (e.g., driving, public transit, cycling, walking).'
    ),
  preferences: z
    .string()
    .optional()
    .describe(
      'The users personal preferences such as favorite routes, transport types and environmental priorities.'
    ),
});
export type SuggestOptimalDepartureTimesInput = z.infer<
  typeof SuggestOptimalDepartureTimesInputSchema
>;

const SuggestOptimalDepartureTimesOutputSchema = z.object({
  optimalDepartureTimes: z
    .array(z.string())
    .describe(
      'A list of suggested departure times that minimize carbon emissions, formatted as HH:mm.'
    ),
  reasoning: z
    .string()
    .describe(
      'Explanation of why these departure times are optimal regarding traffic and emissions.'
    ),
});

export type SuggestOptimalDepartureTimesOutput = z.infer<
  typeof SuggestOptimalDepartureTimesOutputSchema
>;

export async function suggestOptimalDepartureTimes(
  input: SuggestOptimalDepartureTimesInput
): Promise<SuggestOptimalDepartureTimesOutput> {
  return suggestOptimalDepartureTimesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalDepartureTimesPrompt',
  input: {schema: SuggestOptimalDepartureTimesInputSchema},
  output: {schema: SuggestOptimalDepartureTimesOutputSchema},
  prompt: `You are a sophisticated AI traffic and logistics analyst. Your goal is to predict the best departure times to minimize both travel time and carbon emissions for a given journey, while respecting the user's stated preferences.

  You will analyze the following request:
  - Origin: {{{origin}}}
  - Destination: {{{destination}}}
  - Mode of Transport: {{{transportMode}}}
  - User Preferences: {{{preferences}}}
  
  Based on this, perform the following analysis:
  1.  **Analyze by Transport Mode**: Your analysis MUST be tailored to the transport mode.
      *   If 'driving', predict traffic patterns to avoid congestion. Consider time of day, day of the week, and common congestion points. The goal is to avoid stop-and-go traffic.
      *   If 'public transit', the goal is to suggest times that avoid peak-hour crowding for a more pleasant journey, which also correlates with efficient service operation. Assume peak hours are 7-9am and 4-6pm.
      *   If 'cycling' or 'walking', the goal is to suggest times with good daylight (e.g., not too late at night) and potentially less vehicle traffic for safety and air quality.

  2.  **Identify Optimal Windows**: Based on your mode-specific analysis, identify up to 3 optimal departure times (formatted as HH:mm) that would likely result in the best experience.
  
  3.  **Provide Reasoning**: For each suggestion, provide a concise explanation. Justify *why* these times are better from the perspective of the chosen transport mode (e.g., traffic for driving, crowds for transit, safety for cycling). For example: "Departing at 10:00 avoids the peak morning commute, leading to smoother travel and about 15% lower fuel consumption."

  4.  **Incorporate Preferences**: Carefully review the user's preferences. If they've listed a favorite route, factor that into your traffic analysis. If they have environmental priorities like 'avoiding traffic congestion', emphasize how your suggestions meet that goal. If their preferred mode matches the request, acknowledge it. Your reasoning should explicitly mention how it aligns with their priorities. For example: "Since you prioritize avoiding congestion, leaving at 10:00 is ideal."
  
  Your output must strictly follow the JSON schema provided.
  `,
});

const suggestOptimalDepartureTimesFlow = ai.defineFlow(
  {
    name: 'suggestOptimalDepartureTimesFlow',
    inputSchema: SuggestOptimalDepartureTimesInputSchema,
    outputSchema: SuggestOptimalDepartureTimesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to generate a valid response for predictive routing.');
    }
    return output;
  }
);
