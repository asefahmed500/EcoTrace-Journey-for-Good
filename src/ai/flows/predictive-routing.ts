
// src/ai/flows/predictive-routing.ts
'use server';

/**
 * @fileOverview A flow for suggesting optimal departure times for routes based on predicted traffic patterns to minimize carbon emissions.
 *
 * - suggestOptimalDepartureTimes - A function that suggests optimal departure times for a given route.
 * - SuggestOptimalDepartureTimesInput - The input type for the suggestOptimalDepartureTimes function.
 * - SuggestOptimalDepartureTimesOutput - The return type for the suggestOptimalDepartureTimes function.
 */

import {z} from 'zod';

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
  // Mock implementation without Google AI
  const { transportMode, preferences } = input;
  
  let optimalTimes: string[] = [];
  let reasoning = '';
  
  switch (transportMode.toLowerCase()) {
    case 'driving':
      optimalTimes = ['09:30', '14:00', '19:30'];
      reasoning = 'These times avoid peak traffic hours (7-9am and 4-6pm), reducing fuel consumption by up to 20% due to smoother traffic flow. Mid-morning and early afternoon offer the best balance of light traffic and good visibility.';
      break;
      
    case 'public transit':
      optimalTimes = ['09:00', '13:30', '20:00'];
      reasoning = 'Departing after morning rush hour ensures less crowded trains/buses and more reliable schedules. Early afternoon provides excellent service frequency, while evening departure avoids the 4-6pm peak.';
      break;
      
    case 'cycling':
      optimalTimes = ['08:00', '16:00', '18:30'];
      reasoning = 'Early morning offers cooler temperatures and lighter traffic. Late afternoon provides good daylight and moderate temperatures. Early evening avoids peak heat while maintaining good visibility for safety.';
      break;
      
    case 'walking':
      optimalTimes = ['07:30', '15:30', '17:00'];
      reasoning = 'Morning departure provides fresh air and cooler temperatures. Afternoon times offer pleasant weather and good daylight. All suggested times ensure safe visibility and comfortable walking conditions.';
      break;
      
    default:
      optimalTimes = ['09:00', '14:00', '19:00'];
      reasoning = 'General optimal times that avoid peak traffic hours and provide good travel conditions for most transportation modes.';
  }
  
  // Incorporate user preferences if provided
  if (preferences && preferences.toLowerCase().includes('early')) {
    optimalTimes = optimalTimes.map(time => {
      const [hour, minute] = time.split(':').map(Number);
      const newHour = Math.max(6, hour - 1);
      return `${newHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    });
    reasoning += ' Times adjusted earlier based on your preference for early departures.';
  }
  
  if (preferences && preferences.toLowerCase().includes('avoid congestion')) {
    reasoning += ' These recommendations specifically prioritize avoiding traffic congestion to minimize emissions and travel time.';
  }
  
  return {
    optimalDepartureTimes: optimalTimes,
    reasoning
  };
}
