import type { IJourney } from '@/models/Journey';
import type { IUser } from '@/models/User';

export type AchievementDefinition = {
  name: string;
  description: string;
  icon: string; // lucide-react icon name
  condition: (journeys: IJourney[], user: IUser) => boolean;
  category?: 'milestone' | 'challenge' | 'streak' | 'community';
  points?: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
};

export type EcoChallenge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: number; // days
  target: number;
  type: 'car-free' | 'public-transit' | 'cycling' | 'walking' | 'low-emission';
  condition: (journeys: IJourney[], startDate: Date) => { progress: number; completed: boolean };
  reward: {
    points: number;
    badge: string;
    title: string;
  };
};

export const achievementsList: AchievementDefinition[] = [
    {
        name: 'First Journey',
        description: 'Log your first journey with EcoTrace.',
        icon: 'Trophy',
        condition: (journeys) => journeys.length >= 1,
        category: 'milestone',
        points: 10,
        rarity: 'common',
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
        category: 'milestone',
        points: 100,
        rarity: 'epic',
    },
    // Streak Achievements
    {
        name: 'Car-Free Week',
        description: 'Complete 7 consecutive days without driving.',
        icon: 'Calendar',
        condition: (journeys) => {
            const sortedJourneys = journeys.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            let consecutiveDays = 0;
            let maxStreak = 0;
            let lastDate = null;
            
            for (const journey of sortedJourneys) {
                if (journey.mode.toLowerCase() !== 'driving') {
                    const journeyDate = new Date(journey.date).toDateString();
                    if (lastDate !== journeyDate) {
                        if (lastDate && new Date(journeyDate).getTime() - new Date(lastDate).getTime() <= 86400000) {
                            consecutiveDays++;
                        } else {
                            consecutiveDays = 1;
                        }
                        lastDate = journeyDate;
                        maxStreak = Math.max(maxStreak, consecutiveDays);
                    }
                } else {
                    consecutiveDays = 0;
                }
            }
            return maxStreak >= 7;
        },
        category: 'challenge',
        points: 150,
        rarity: 'rare',
    },
    {
        name: 'Public Transit Champion',
        description: 'Use public transit for 10 consecutive trips.',
        icon: 'Bus',
        condition: (journeys) => {
            const sortedJourneys = journeys.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            let consecutiveTransit = 0;
            let maxStreak = 0;
            
            for (const journey of sortedJourneys) {
                if (journey.mode.toLowerCase() === 'public transit') {
                    consecutiveTransit++;
                    maxStreak = Math.max(maxStreak, consecutiveTransit);
                } else {
                    consecutiveTransit = 0;
                }
            }
            return maxStreak >= 10;
        },
        category: 'challenge',
        points: 120,
        rarity: 'rare',
    },
    {
        name: 'Bike Commuter Streak',
        description: 'Cycle for 14 consecutive days.',
        icon: 'Bike',
        condition: (journeys) => {
            const cyclingDays = new Set();
            journeys.filter(j => j.mode.toLowerCase() === 'cycling')
                   .forEach(j => cyclingDays.add(new Date(j.date).toDateString()));
            
            const sortedDays = Array.from(cyclingDays).sort();
            let consecutiveDays = 1;
            let maxStreak = 1;
            
            for (let i = 1; i < sortedDays.length; i++) {
                const prevDate = new Date(sortedDays[i-1] as string);
                const currDate = new Date(sortedDays[i] as string);
                const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
                
                if (dayDiff === 1) {
                    consecutiveDays++;
                    maxStreak = Math.max(maxStreak, consecutiveDays);
                } else {
                    consecutiveDays = 1;
                }
            }
            return maxStreak >= 14;
        },
        category: 'streak',
        points: 200,
        rarity: 'epic',
    },
    {
        name: 'Zero Emission Month',
        description: 'Complete 30 days using only zero-emission transport.',
        icon: 'Leaf',
        condition: (journeys) => {
            const zeroEmissionDays = new Set();
            journeys.filter(j => j.emissions === 0)
                   .forEach(j => zeroEmissionDays.add(new Date(j.date).toDateString()));
            return zeroEmissionDays.size >= 30;
        },
        category: 'challenge',
        points: 300,
        rarity: 'legendary',
    },
    {
        name: 'Community Leader',
        description: 'Inspire 5 friends to join EcoTrace.',
        icon: 'Users',
        condition: (journeys, user) => {
            // This would need to be implemented with referral tracking
            return false; // Placeholder
        },
        category: 'community',
        points: 250,
        rarity: 'epic',
    },
    {
        name: 'Story Teller',
        description: 'Share 3 impact stories with the community.',
        icon: 'MessageSquare',
        condition: (journeys, user) => {
            // This would need to be implemented with story tracking
            return false; // Placeholder
        },
        category: 'community',
        points: 100,
        rarity: 'rare',
    },
    {
        name: 'Distance Destroyer',
        description: 'Travel 5000km total distance.',
        icon: 'Target',
        condition: (journeys) => {
            const totalDistance = journeys.reduce((sum, j) => sum + j.distance, 0);
            return totalDistance >= 5000;
        },
        category: 'milestone',
        points: 200,
        rarity: 'rare',
    },
    {
        name: 'Emission Eliminator',
        description: 'Complete 50 zero-emission trips.',
        icon: 'ShieldCheck',
        condition: (journeys) => journeys.filter(j => j.emissions === 0).length >= 50,
        category: 'milestone',
        points: 250,
        rarity: 'epic',
    },
];

export const ecoChallenges: EcoChallenge[] = [
    {
        id: 'car-free-week',
        name: 'Car-Free Week Challenge',
        description: 'Go 7 consecutive days without using a car. Use walking, cycling, or public transit instead.',
        icon: 'Car',
        duration: 7,
        target: 7,
        type: 'car-free',
        condition: (journeys, startDate) => {
            const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            const challengeJourneys = journeys.filter(j => {
                const journeyDate = new Date(j.date);
                return journeyDate >= startDate && journeyDate <= endDate;
            });
            
            const carFreeDays = new Set();
            challengeJourneys.filter(j => j.mode.toLowerCase() !== 'driving')
                           .forEach(j => carFreeDays.add(new Date(j.date).toDateString()));
            
            const progress = carFreeDays.size;
            return { progress, completed: progress >= 7 };
        },
        reward: {
            points: 150,
            badge: 'Car-Free Champion',
            title: 'Eco Commuter'
        }
    },
    {
        id: 'public-transit-month',
        name: 'Public Transit Champion',
        description: 'Use public transit for 20 trips in 30 days.',
        icon: 'Bus',
        duration: 30,
        target: 20,
        type: 'public-transit',
        condition: (journeys, startDate) => {
            const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
            const challengeJourneys = journeys.filter(j => {
                const journeyDate = new Date(j.date);
                return journeyDate >= startDate && journeyDate <= endDate;
            });
            
            const transitTrips = challengeJourneys.filter(j => j.mode.toLowerCase() === 'public transit').length;
            return { progress: transitTrips, completed: transitTrips >= 20 };
        },
        reward: {
            points: 200,
            badge: 'Transit Master',
            title: 'Public Transport Pro'
        }
    },
    {
        id: 'bike-commuter-streak',
        name: 'Bike Commuter Challenge',
        description: 'Cycle for 15 trips in 21 days.',
        icon: 'Bike',
        duration: 21,
        target: 15,
        type: 'cycling',
        condition: (journeys, startDate) => {
            const endDate = new Date(startDate.getTime() + 21 * 24 * 60 * 60 * 1000);
            const challengeJourneys = journeys.filter(j => {
                const journeyDate = new Date(j.date);
                return journeyDate >= startDate && journeyDate <= endDate;
            });
            
            const cyclingTrips = challengeJourneys.filter(j => j.mode.toLowerCase() === 'cycling').length;
            return { progress: cyclingTrips, completed: cyclingTrips >= 15 };
        },
        reward: {
            points: 180,
            badge: 'Pedal Power',
            title: 'Cycling Champion'
        }
    },
    {
        id: 'walking-warrior',
        name: 'Walking Warrior',
        description: 'Walk for 25 trips in 30 days.',
        icon: 'Footprints',
        duration: 30,
        target: 25,
        type: 'walking',
        condition: (journeys, startDate) => {
            const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
            const challengeJourneys = journeys.filter(j => {
                const journeyDate = new Date(j.date);
                return journeyDate >= startDate && journeyDate <= endDate;
            });
            
            const walkingTrips = challengeJourneys.filter(j => j.mode.toLowerCase() === 'walking').length;
            return { progress: walkingTrips, completed: walkingTrips >= 25 };
        },
        reward: {
            points: 160,
            badge: 'Step Master',
            title: 'Walking Legend'
        }
    },
    {
        id: 'low-emission-hero',
        name: 'Low Emission Hero',
        description: 'Keep average emissions under 1kg CO2 per trip for 14 days.',
        icon: 'Leaf',
        duration: 14,
        target: 1,
        type: 'low-emission',
        condition: (journeys, startDate) => {
            const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
            const challengeJourneys = journeys.filter(j => {
                const journeyDate = new Date(j.date);
                return journeyDate >= startDate && journeyDate <= endDate;
            });
            
            if (challengeJourneys.length === 0) return { progress: 0, completed: false };
            
            const totalEmissions = challengeJourneys.reduce((sum, j) => sum + j.emissions, 0);
            const averageEmission = totalEmissions / challengeJourneys.length;
            const progress = Math.max(0, (1 - averageEmission) * 100);
            
            return { progress, completed: averageEmission <= 1 };
        },
        reward: {
            points: 220,
            badge: 'Emission Eliminator',
            title: 'Carbon Crusher'
        }
    }
];
