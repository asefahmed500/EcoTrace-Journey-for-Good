// src/ai/tools/weather-tool.ts
'use server';
/**
 * @fileOverview A tool for fetching weather data.
 */

import { z } from 'zod';

const WeatherInputSchema = z.object({
  latitude: z.number().describe('The latitude for the weather query.'),
  longitude: z.number().describe('The longitude for the weather query.'),
});

const WeatherOutputSchema = z.object({
  temperatureCelsius: z.number().describe('The current temperature in Celsius.'),
  condition: z.string().describe('A brief description of the weather conditions (e.g., "Sunny", "Cloudy", "Rain").'),
  windSpeedKph: z.number().describe('The current wind speed in kilometers per hour.'),
});

export async function getWeather(input: z.infer<typeof WeatherInputSchema>): Promise<z.infer<typeof WeatherOutputSchema>> {
    // In a real application, this would call a weather API like OpenWeatherMap.
    // For this example, we'll return simulated data.
    console.log(`[Weather Tool] Faking weather for lat: ${input.latitude}, lon: ${input.longitude}`);
    
    // Simulate some plausible weather conditions.
    const conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Clear"];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const randomTemp = Math.floor(Math.random() * 30) - 5; // Temp between -5°C and 25°C
    const randomWind = Math.floor(Math.random() * 20); // Wind speed up to 20 kph

    return {
      temperatureCelsius: randomTemp,
      condition: randomCondition,
      windSpeedKph: randomWind,
    };
}
