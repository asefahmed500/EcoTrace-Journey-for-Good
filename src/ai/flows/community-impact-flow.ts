'use server';
/**
 * @fileOverview Identifies community impact zones for public transport.
 *
 * - getCommunityImpactZones - A function that handles finding community impact zones.
 * - CommunityImpactInput - The input type for the getCommunityImpactZones function.
 * - CommunityImpactOutput - The return type for the getCommunityImpactZones function.
 */

import {z} from 'zod';

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
  // Mock implementation without Google AI
  const { latitude, longitude, radius } = input;
  
  // Generate mock community impact zones based on typical urban patterns
  const zones = [
    {
      name: "Downtown Business District",
      lat: latitude + 0.01,
      lng: longitude + 0.01,
      reasoning: "High employment density with limited parking creates significant demand for public transit. Improved connections could reduce 40% of daily commuter traffic."
    },
    {
      name: "Residential Suburbs North",
      lat: latitude + 0.02,
      lng: longitude - 0.01,
      reasoning: "Growing residential area with poor transit connectivity. Many residents drive 15+ km daily to reach employment centers, creating high emissions per capita."
    },
    {
      name: "University Campus Area",
      lat: latitude - 0.015,
      lng: longitude + 0.02,
      reasoning: "Large student population relies heavily on personal vehicles. Enhanced transit could serve 8,000+ daily trips and reduce campus parking demand by 60%."
    },
    {
      name: "Industrial Park East",
      lat: latitude + 0.005,
      lng: longitude + 0.025,
      reasoning: "Major employment hub with shift workers needing reliable transit. Current bus service is limited, forcing workers to drive, contributing to peak-hour congestion."
    },
    {
      name: "Medical District",
      lat: latitude - 0.01,
      lng: longitude - 0.015,
      reasoning: "Hospital and clinic complex serves the entire region. Patients and staff generate high traffic volumes. Better transit access would improve healthcare accessibility."
    }
  ];
  
  // Filter zones within the specified radius (simplified calculation)
  const filteredZones = zones.filter(zone => {
    const distance = Math.sqrt(
      Math.pow(zone.lat - latitude, 2) + Math.pow(zone.lng - longitude, 2)
    ) * 111; // Rough km conversion
    return distance <= radius;
  });
  
  return {
    communityImpactZones: filteredZones.slice(0, 5)
  };
}
