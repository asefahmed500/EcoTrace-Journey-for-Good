
'use server';
/**
 * @fileOverview A Genkit tool for fetching carbon emission factors for different modes of transport.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const EmissionFactorInputSchema = z.object({
  modeOfTransport: z.string().describe("The mode of transportation (e.g., 'driving', 'public transit')."),
  vehicleType: z.string().optional().describe("The specific type of vehicle (e.g., 'EV', 'Gasoline - Small', 'bus')."),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).describe("The location to get emission factors for, as some regions have different electricity grids or fuel standards."),
});

const EmissionFactorOutputSchema = z.object({
    factor: z.number().describe("The emission factor in grams of CO2e per passenger-kilometer."),
    source: z.string().describe("The data source for the emission factor."),
    year: z.number().describe("The year the emission factor data was published."),
});

// In a real application, this could query a database or external API.
const emissionFactorsDatabase = {
    'driving_gasoline_small': { factor: 150, source: 'EPA 2023', year: 2023 },
    'driving_gasoline_medium_suv': { factor: 192, source: 'EPA 2023', year: 2023 },
    'driving_gasoline_large_suv': { factor: 250, source: 'EPA 2023', year: 2023 },
    'driving_ev': { factor: 50, source: 'EPA 2023 (Grid Mix Adjusted)', year: 2023 },
    'driving_hybrid': { factor: 110, source: 'EPA 2023', year: 2023 },
    'driving_plug_in_hybrid': { factor: 70, source: 'EPA 2023', year: 2023 },
    'driving_motorcycle': { factor: 100, source: 'DEFRA 2023', year: 2023 },
    'public_transit_bus_hybrid': { factor: 90, source: 'DEFRA 2023 (Avg. Occupancy)', year: 2023 },
    'public_transit_bus_diesel': { factor: 130, source: 'DEFRA 2023 (Avg. Occupancy)', year: 2023 },
    'public_transit_train_subway': { factor: 40, source: 'DEFRA 2023 (Avg. Occupancy)', year: 2023 },
};


export const getEmissionFactor = ai.defineTool(
  {
    name: 'getEmissionFactor',
    description: 'Returns the carbon emission factor for a given mode of transport and vehicle type.',
    inputSchema: EmissionFactorInputSchema,
    outputSchema: EmissionFactorOutputSchema,
  },
  async (input) => {
    console.log(`[Emission Factor Tool] Looking up for:`, input);

    const mode = input.modeOfTransport.toLowerCase().replace(/\s+/g, '_');
    const vehicle = input.vehicleType?.toLowerCase().replace(/[() -]/g, '') || 'default';
    
    let keyToFind = `${mode}_${vehicle}`;
    
    // 1. Direct match first
    if (keyToFind in emissionFactorsDatabase) {
        return emissionFactorsDatabase[keyToFind as keyof typeof emissionFactorsDatabase];
    }
    
    // 2. Partial match if direct key fails (e.g., vehicleType 'EV' for mode 'driving')
    const partialMatchKey = Object.keys(emissionFactorsDatabase).find(dbKey => dbKey.includes(mode) && dbKey.includes(vehicle));
    if (partialMatchKey) {
        return emissionFactorsDatabase[partialMatchKey as keyof typeof emissionFactorsDatabase];
    }
    
    // 3. Default logic for modes without specified vehicle types
    if (mode === 'driving' && vehicle === 'default') {
        keyToFind = 'driving_gasoline_medium_suv';
    } else if (mode === 'public_transit' && vehicle === 'default') {
        keyToFind = 'public_transit_bus_diesel'; // A reasonable default for unspecified public transit
    } else if (mode === 'public_transit' && vehicle === 'bus') {
        keyToFind = 'public_transit_bus_diesel'; // Default to diesel bus if not specified
    } else if (mode === 'public_transit' && vehicle === 'train') {
        keyToFind = 'public_transit_train_subway';
    }
    
    // Check if the constructed default key exists
    if (keyToFind in emissionFactorsDatabase) {
        return emissionFactorsDatabase[keyToFind as keyof typeof emissionFactorsDatabase];
    }

    // 4. Final fallback to a generic driving default if nothing else matches
    return emissionFactorsDatabase.driving_gasoline_medium_suv;
  }
);
