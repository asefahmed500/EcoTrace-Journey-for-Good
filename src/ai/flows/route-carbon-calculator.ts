'use server';

/**
 * @fileOverview This file defines a Genkit flow for calculating the carbon emissions of different travel routes and modes of transport.
 *
 * - calculateRouteCarbonEmissions - A function that calculates the carbon emissions for a given route and mode of transport.
 * - RouteCarbonCalculatorInput - The input type for the calculateRouteCarbonEmissions function.
 * - RouteCarbonCalculatorOutput - The return type for the calculateRouteCarbonEmissions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {getWeather} from '@/ai/tools/weather-tool';
import {getEmissionFactor} from '@/ai/tools/emission-factors-tool';

const RouteCarbonCalculatorInputSchema = z.object({
  routeDescription: z
    .string()
    .describe('A description of the travel route, including start and end locations.'),
  modeOfTransport: z
    .string()
    .describe(
      'The mode of transportation used for the route (e.g., driving, public transit, cycling, walking).'
    ),
  distanceInKilometers: z.number().describe('The distance of the route in kilometers.'),
  durationInMinutes: z
    .number()
    .describe('The estimated travel time in minutes, considering current traffic.'),
  vehicleType: z
    .string()
    .optional()
    .describe(
      'The type of vehicle used, if applicable (e.g., gasoline car, electric car, bus, train).'
    ),
  originCoords: z.object({
      lat: z.number(),
      lng: z.number()
  }).describe("The coordinates of the origin.")
});
export type RouteCarbonCalculatorInput = z.infer<typeof RouteCarbonCalculatorInputSchema>;

const RouteCarbonCalculatorOutputSchema = z.object({
  estimatedEmissionsKgCO2: z
    .number()
    .describe('The estimated carbon emissions for the route in kilograms of CO2.'),
  calculationDetails: z
    .string()
    .describe('A detailed breakdown of how the carbon emissions were calculated.'),
  suggestedAlternatives: z
    .string()
    .describe('Alternative routes or modes of transport with lower carbon emissions.'),
});
export type RouteCarbonCalculatorOutput = z.infer<typeof RouteCarbonCalculatorOutputSchema>;

export async function calculateRouteCarbonEmissions(
  input: RouteCarbonCalculatorInput
): Promise<RouteCarbonCalculatorOutput> {
  return calculateRouteCarbonEmissionsFlow(input);
}

const calculateRouteCarbonEmissionsPrompt = ai.definePrompt({
  name: 'calculateRouteCarbonEmissionsPrompt',
  input: {schema: RouteCarbonCalculatorInputSchema},
  output: {schema: RouteCarbonCalculatorOutputSchema},
  tools: [getWeather, getEmissionFactor],
  prompt: `You are a highly advanced environmental science AI. Your core function is to be a precise Carbon Calculation Engine for transportation. Your task is to accurately calculate the carbon emissions for a journey and provide actionable, eco-friendly alternatives based on detailed emission factors.

  The journey data (distance, duration) is derived from Google Maps, incorporating real-time traffic. The current time can be inferred to be within a standard working day (e.g., 9am-7pm on a weekday).

  **Input Data:**
  - Route: {{{routeDescription}}}
  - Origin Coordinates: Lat: {{{originCoords.lat}}}, Lng: {{{originCoords.lng}}}
  - Mode of Transport: {{{modeOfTransport}}}
  - Distance: {{{distanceInKilometers}}} km
  - Duration: {{{durationInMinutes}}} minutes
  - Vehicle Type: {{{vehicleType}}}

  **Your Task:**

  1.  **Select Emission Factor**: If the mode of transport is 'walking' or 'cycling', the emission factor is 0. For all other motorized transport, you **must** use the 'getEmissionFactor' tool. Provide the tool with the mode of transport, and vehicle type if available. If no vehicle type is provided for a 'driving' or 'car' trip, you should use 'Driving (Gasoline - Medium/SUV)' as the default for the tool. Use the origin coordinates for the location parameter of the tool.

  2.  **Adjust for Weather (Seasonal Adjustment)**: For motorized transport, use the getWeather tool with the origin coordinates to check the current weather.
      *   If the temperature is below 0°C (32°F) or above 35°C (95°F), apply a 10% penalty to the emission factor. This accounts for increased energy use from heating/cooling and reduced battery efficiency in EVs.
      *   Mention this adjustment in the calculation details if applied.

  3.  **Adjust for Traffic**: For motorized transport, calculate the average speed (km/h). If the average speed is below 30 km/h, assume heavy traffic and apply a multiplier to the base emission factor. Increase emissions by 15% for speeds 20-30 km/h, and by 30% for speeds below 20 km/h. This accounts for increased fuel consumption from idling and stop-and-go conditions.

  4.  **Adjust for Public Transit Load Factor**: For 'public transit' modes, infer the time of day from the 'duration' and current context. Assume peak hours are 7-9am and 4-6pm. During peak hours, occupancy is high, so reduce the per-passenger emission factor by 20%. During off-peak hours, occupancy is lower, so increase the per-passenger emission factor by 15%. This simulates the distribution of total vehicle emissions over more or fewer passengers.

  5.  **Calculate Total Emissions**:
      *   Calculate the adjusted emission factor based on all relevant adjustments (weather, traffic, load factor).
      *   Multiply the adjusted factor by the distance in kilometers.
      *   Convert the final result to kilograms of CO2 and round to two decimal places.

  6.  **Provide Detailed Breakdown ('calculationDetails')**: Explain your calculation clearly. State the base emission factor used (including which tool was called and with what parameters), and ANY adjustments made (weather, traffic, load factor), and show the final calculation. Example: "Based on a bus trip (90 g/km) during off-peak hours, a 15% load factor penalty was applied, resulting in an adjusted factor of 103.5 g/km. Total emissions: 103.5 g/km * 10 km = 1.04 kg CO2."

  7.  **Suggest Smart Alternatives ('suggestedAlternatives')**: Provide at least two specific, lower-carbon alternatives. Compare the emissions saved. Example: "Taking the subway would generate only 0.6 kg CO2 for this trip, saving 2.71 kg. A cycling trip would produce zero emissions."

  Your output must strictly follow the JSON schema provided.
`,
});

const calculateRouteCarbonEmissionsFlow = ai.defineFlow(
  {
    name: 'calculateRouteCarbonEmissionsFlow',
    inputSchema: RouteCarbonCalculatorInputSchema,
    outputSchema: RouteCarbonCalculatorOutputSchema,
  },
  async input => {
    const {output} = await calculateRouteCarbonEmissionsPrompt(input);
    if (!output) {
      throw new Error('The AI model failed to generate a valid response for carbon calculation.');
    }
    return output;
  }
);
