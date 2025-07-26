import type { IJourney } from '@/models/Journey';
import type { IUser } from '@/models/User';

export type AchievementDefinition = {
  name: string;
  description: string;
  icon: string; // lucide-react icon name
  condition: (journeys: IJourney[], user: IUser) => boolean;
};

export const achievementsList: AchievementDefinition[] = [
    {
        name: 'First Journey',
        description: 'Log your first journey with EcoTrace.',
        icon: 'Trophy',
        condition: (journeys) => journeys.length >= 1,
    },
    {
        name: 'Eco-Beginner',
        description: 'Complete your first zero-emission trip (walking or cycling).',
        icon: 'Leaf',
        condition: (journeys) => journeys.some(j => j.emissions === 0),
    },
    {
        name: 'Frequent Traveler',
        description: 'Log 10 journeys.',
        icon: 'Plane',
        condition: (journeys) => journeys.length >= 10,
    },
    {
        name: 'Super Saver',
        description: 'Log 25 journeys.',
        icon: 'Sparkles',
        condition: (journeys) => journeys.length >= 25,
    },
    {
        name: 'Walk the Walk',
        description: 'Log 5 walking trips.',
        icon: 'Footprints',
        condition: (journeys) => journeys.filter(j => j.mode.toLowerCase() === 'walking').length >= 5,
    },
    {
        name: 'Pedal Power',
        description: 'Log 5 cycling trips.',
        icon: 'Bike',
        condition: (journeys) => journeys.filter(j => j.mode.toLowerCase() === 'cycling').length >= 5,
    },
    {
        name: 'Public Transport Pro',
        description: 'Use public transit 5 times.',
        icon: 'Bus',
        condition: (journeys) => journeys.filter(j => j.mode.toLowerCase() === 'public transit').length >= 5,
    },
    {
        name: 'Long Haul',
        description: 'Complete a journey over 100km.',
        icon: 'Map',
        condition: (journeys) => journeys.some(j => j.distance > 100),
    },
    {
        name: 'Global Trotter',
        description: 'Complete a journey over 500km.',
        icon: 'Globe',
        condition: (journeys) => journeys.some(j => j.distance > 500),
    },
    {
        name: 'Carbon Conscious',
        description: 'Complete 10 trips with less than 1kg of CO2 each.',
        icon: 'ShieldCheck',
        condition: (journeys) => journeys.filter(j => j.emissions < 1).length >= 10,
    },
    {
        name: 'Mode Master',
        description: 'Use at least 3 different modes of transport.',
        icon: 'Shuffle',
        condition: (journeys) => {
            const modes = new Set(journeys.map(j => j.mode.toLowerCase()));
            return modes.size >= 3;
        },
    },
    {
        name: 'Road Warrior',
        description: 'Travel a total distance of 1000km across all journeys.',
        icon: 'Route',
        condition: (journeys) => {
            const totalDistance = journeys.reduce((sum, j) => sum + j.distance, 0);
            return totalDistance >= 1000;
        },
    },
    {
        name: 'Eco-Warrior',
        description: 'Maintain an average of less than 2kg CO2 per journey over 20 trips.',
        icon: 'Zap',
        condition: (journeys, user) => {
            if (journeys.length < 20) {
                return false;
            }
            const totalEmissions = journeys.reduce((sum, j) => sum + j.emissions, 0);
            const averageEmissions = totalEmissions / journeys.length;
            return averageEmissions < 2;
        },
    },
];
