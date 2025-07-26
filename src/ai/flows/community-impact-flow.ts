'use server';
/**
 * @fileOverview Identifies community impact zones for public transport.
 *
 * - getCommunityImpactZones - A function that handles finding community impact zones.
 * - CommunityImpactInput - The input type for the getCommunityImpactZones function.
 * - CommunityImpactOutput - The return type for the getCommunityImpactZones function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CommunityImpactInputSchema = z.object({
  latitude: z.number().describe('The latitude of the map center.'),
  longitude: z.number().describe('The longitude of the map center.'),
  radius: z.number().describe('The radius in kilometers to search within.'),
});
export type CommunityImpactInput = z.infer<typeof CommunityImpactInputSchema>;

const CommunityImpactZoneSchema = z.object({
  name: z.string().describe('A descriptive name for the identified zone.'),
  lat: z.number().describe('The latitude of the center of the zone.'),
  lng: z.number().describe('The longitude of the center of the zone.'),
  reasoning: z
    .string()
    .describe(
      'A brief explanation of why this zone would benefit from improved public transportation.'
    ),
});

const CommunityImpactOutputSchema = z.object({
  communityImpactZones: z
    .array(CommunityImpactZoneSchema)
    .describe('A list of community impact zones.'),
});
export type CommunityImpactOutput = z.infer<typeof CommunityImpactOutputSchema>;

export async function getCommunityImpactZones(
  input: CommunityImpactInput
): Promise<CommunityImpactOutput> {
  return communityImpactFlow(input);
}

const prompt = ai.definePrompt({
  name: 'communityImpactPrompt',
  input: {schema: CommunityImpactInputSchema},
  output: {schema: CommunityImpactOutputSchema},
  prompt: `You are an expert urban planner and data analyst. Your task is to identify areas that would significantly benefit from improved public transportation.

  Analyze the area around latitude {{{latitude}}} and longitude {{{longitude}}} within a {{{radius}}}km radius.

  Identify up to 5 specific zones (e.g., neighborhoods, districts, industrial parks) where improved public transit could have the highest positive impact.

  For each zone, consider factors like:
  - Population density
  - Proximity to essential services (hospitals, schools, grocery stores)
  - Current public transit accessibility (or lack thereof)
  - Economic conditions and employment centers
  - Potential for reducing traffic congestion and carbon emissions

  Provide a concise name for each zone and a compelling reason why it's a priority area. Be specific and data-driven in your reasoning, even if you have to infer the data based on typical urban layouts.
  `,
});

const communityImpactFlow = ai.defineFlow(
  {
    name: 'communityImpactFlow',
    inputSchema: CommunityImpactInputSchema,
    outputSchema: CommunityImpactOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to generate a valid response for community impact zones.');
    }
    return output;
  }
);
