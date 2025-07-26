'use server';

import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { calculateRouteCarbonEmissions, type RouteCarbonCalculatorInput } from '@/ai/flows/route-carbon-calculator';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import Journey from '@/models/Journey';
import User from '@/models/User';
import { achievementsList } from '@/lib/achievements';
import type { IJourney } from '@/models/Journey';
import type { IUser } from '@/models/User';
import type { Achievement } from '@/lib/types';


const carbonCalculatorSchema = z.object({
  origin: z.string().trim().min(3, { message: 'Origin must be at least 3 characters.' }),
  destination: z.string().trim().min(3, { message: 'Destination must be at least 3 characters.' }),
  modeOfTransport: z.string().min(1, { message: 'Transport mode is required.' }),
  vehicleType: z.string().optional(),
});

async function checkAndAwardAchievements(user: IUser): Promise<Achievement[]> {
  const journeys = await Journey.find({userId: user._id});
  if (!user) return [];

  const awardedAchievements: Achievement[] = [];

  for (const achievement of achievementsList) {
    const alreadyEarned = user.achievements.some(
      a => a.name === achievement.name
    );
    if (!alreadyEarned && achievement.condition(journeys, user)) {
      const newAchievementData = {
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        date: new Date(),
      };
      user.achievements.push(newAchievementData);
      awardedAchievements.push(newAchievementData);
    }
  }

  return awardedAchievements;
}


export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    let parsedBody;
    try {
        parsedBody = await req.json();
    } catch (error) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }


    const validatedFields = carbonCalculatorSchema.safeParse(parsedBody);

    if (!validatedFields.success) {
        return NextResponse.json({
            error: 'Invalid input.',
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        }, { status: 400 });
    }

    const { origin, destination, modeOfTransport, vehicleType } = validatedFields.data;

    await dbConnect();

    // Prevent duplicate submissions in a short time frame
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingJourney = await Journey.findOne({
        userId: session.user.id,
        origin: origin,
        destination: destination,
        mode: modeOfTransport,
        createdAt: { $gte: fiveMinutesAgo },
    });

    if (existingJourney) {
        return NextResponse.json({
            error: 'This journey seems to be a duplicate of one you logged in the last 5 minutes.',
        }, { status: 429 });
    }

    try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Google Maps API key is not configured.' }, { status: 500 });
        }
        
        const googleMapsApiMode = (mode: string): string => {
            switch (mode) {
                case 'public transit': return 'transit';
                case 'cycling': return 'bicycling';
                case 'walking': return 'walking';
                default: return 'driving';
            }
        };

        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${googleMapsApiMode(modeOfTransport)}&departure_time=now&key=${apiKey}&alternatives=true`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
            const userMessage = data.status === 'ZERO_RESULTS'
                ? `Could not find a route for the entered locations.`
                : `Could not calculate distance. (API Status: ${data.status})`;
            return NextResponse.json({ error: userMessage, details: data.error_message || '' }, { status: 400 });
        }

        const results = await Promise.all(data.routes.map(async (route: any) => {
            const leg = route.legs[0];
            const distanceInKilometers = leg.distance.value / 1000;
            const durationInMinutes = Math.round(leg.duration.value / 60);

            const input: RouteCarbonCalculatorInput = {
                routeDescription: route.summary || `${origin} to ${destination}`,
                distanceInKilometers,
                durationInMinutes,
                modeOfTransport: modeOfTransport, // Use the user's selected mode for calculation
                vehicleType: vehicleType,
                originCoords: leg.start_location,
            };
            const carbonResult = await calculateRouteCarbonEmissions(input);

            return {
                summary: route.summary || `Route via ${leg.start_address}`,
                distance: distanceInKilometers,
                duration: durationInMinutes,
                carbon: carbonResult,
            };
        }));
        
        // Log the primary route
        const primaryRoute = data.routes[0];
        const primaryLeg = primaryRoute.legs[0];
        const primaryResult = results[0].carbon;
        
        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ error: 'User not found during journey logging.' }, { status: 404 });
        }

        await Journey.create({
            userId: session.user.id,
            origin,
            destination,
            distance: primaryLeg.distance.value / 1000,
            mode: modeOfTransport,
            emissions: primaryResult.estimatedEmissionsKgCO2,
            date: new Date(),
            originCoords: primaryLeg.start_location,
            destinationCoords: primaryLeg.end_location,
        });

        user.totalEmissions = (user.totalEmissions || 0) + primaryResult.estimatedEmissionsKgCO2;
        const newAchievements = await checkAndAwardAchievements(user);
        
        if (user.isModified()) {
            await user.save();
        }
        
        return NextResponse.json({ results, newAchievements });

    } catch (e) {
        console.error('Error in handleCalculateCarbon:', e);
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
        return NextResponse.json({ error: 'An unexpected error occurred while calculating your carbon footprint.', details: errorMessage }, { status: 500 });
    }
}
