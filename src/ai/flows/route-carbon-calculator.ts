'use server';

/**
 * @fileOverview This file defines a flow for calculating the carbon emissions of different travel routes and modes of transport.
 *
 * - calculateRouteCarbonEmissions - A function that calculates the carbon emissions for a given route and mode of transport.
 * - RouteCarbonCalculatorInput - The input type for the calculateRouteCarbonEmissions function.
 * - RouteCarbonCalculatorOutput - The return type for the calculateRouteCarbonEmissions function.
 */

import {z} from 'zod';

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
  // Mock implementation without Google AI
  const { modeOfTransport, distanceInKilometers, durationInMinutes, vehicleType } = input;
  
  let baseEmissionFactor = 0; // g CO2 per km
  let calculationDetails = '';
  
  // Determine base emission factor
  switch (modeOfTransport.toLowerCase()) {
    case 'walking':
    case 'cycling':
      baseEmissionFactor = 0;
      calculationDetails = `Zero emissions for ${modeOfTransport} - human-powered transport produces no direct CO2.`;
      break;
      
    case 'driving':
    case 'car':
      if (vehicleType?.toLowerCase().includes('electric')) {
        baseEmissionFactor = 50; // Electric vehicle
        calculationDetails = 'Electric vehicle: 50g CO2/km (including electricity generation emissions).';
      } else {
        baseEmissionFactor = 180; // Gasoline car
        calculationDetails = 'Gasoline vehicle: 180g CO2/km (medium-sized car, average fuel efficiency).';
      }
      break;
      
    case 'public transit':
    case 'bus':
      baseEmissionFactor = 90;
      calculationDetails = 'Public bus: 90g CO2/km per passenger (average occupancy considered).';
      break;
      
    case 'train':
    case 'subway':
      baseEmissionFactor = 45;
      calculationDetails = 'Electric train/subway: 45g CO2/km per passenger (efficient mass transit).';
      break;
      
    default:
      baseEmissionFactor = 150;
      calculationDetails = 'Default mixed transport: 150g CO2/km (estimated average).';
  }
  
  // Apply traffic adjustment for motorized transport
  let adjustedFactor = baseEmissionFactor;
  if (baseEmissionFactor > 0) {
    const averageSpeed = (distanceInKilometers / durationInMinutes) * 60; // km/h
    
    if (averageSpeed < 20) {
      adjustedFactor *= 1.3; // 30% increase for heavy traffic
      calculationDetails += ` Heavy traffic penalty applied (30% increase) due to low average speed (${averageSpeed.toFixed(1)} km/h).`;
    } else if (averageSpeed < 30) {
      adjustedFactor *= 1.15; // 15% increase for moderate traffic
      calculationDetails += ` Moderate traffic penalty applied (15% increase) due to average speed (${averageSpeed.toFixed(1)} km/h).`;
    }
  }
  
  // Calculate total emissions
  const totalEmissions = (adjustedFactor * distanceInKilometers) / 1000; // Convert to kg
  
  calculationDetails += ` Final calculation: ${adjustedFactor.toFixed(1)}g/km × ${distanceInKilometers}km = ${totalEmissions.toFixed(2)}kg CO2.`;
  
  // Generate alternatives
  let suggestedAlternatives = '';
  if (modeOfTransport.toLowerCase() === 'driving' || modeOfTransport.toLowerCase() === 'car') {
    const publicTransitEmissions = (90 * distanceInKilometers) / 1000;
    const savings = totalEmissions - publicTransitEmissions;
    suggestedAlternatives = `Public transit would generate ${publicTransitEmissions.toFixed(2)}kg CO2, saving ${savings.toFixed(2)}kg. `;
    suggestedAlternatives += `Cycling would produce zero emissions, saving the full ${totalEmissions.toFixed(2)}kg CO2.`;
  } else if (modeOfTransport.toLowerCase().includes('public') || modeOfTransport.toLowerCase() === 'bus') {
    suggestedAlternatives = `Train/subway would generate ${((45 * distanceInKilometers) / 1000).toFixed(2)}kg CO2, saving ${(totalEmissions - (45 * distanceInKilometers) / 1000).toFixed(2)}kg. `;
    suggestedAlternatives += `Cycling would produce zero emissions, saving the full ${totalEmissions.toFixed(2)}kg CO2.`;
  } else {
    suggestedAlternatives = `Public transit would generate ${((90 * distanceInKilometers) / 1000).toFixed(2)}kg CO2. `;
    suggestedAlternatives += `Cycling or walking would produce zero emissions.`;
  }
  
  return {
    estimatedEmissionsKgCO2: Math.round(totalEmissions * 100) / 100,
    calculationDetails,
    suggestedAlternatives
  };
}
