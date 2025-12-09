
'use server';

import {z} from 'zod';
import {revalidatePath} from 'next/cache';
// Remove signIn import as it's not used in server actions
import {getServerSession} from '@/lib/session';
import dbConnect from '@/lib/db';
import Journey from '@/models/Journey';
import User from '@/models/User';
import Team from '@/models/Team';
import type {ITeam} from '@/models/Team';
import type {
  UserPreferences,
  Journey as JourneyType,
  CommunityImpactZone,
  Achievement,
  LeaderboardUser,
  PublicUserProfile,
  EvChargingStation,
  Team as TeamDashboardData,
  AiStory,
} from '@/lib/types';
import type {IUser} from '@/models/User';
import type {IJourney} from '@/models/Journey';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/mail';
import {
  calculateRouteCarbonEmissions,
  type RouteCarbonCalculatorInput,
} from '@/ai/flows/route-carbon-calculator';
import {
  suggestOptimalDepartureTimes,
  type SuggestOptimalDepartureTimesInput,
} from '@/ai/flows/predictive-routing';
import {
  getCommunityImpactZones as getCommunityImpactZonesFlow,
  type CommunityImpactInput,
} from '@/ai/flows/community-impact-flow';
import {
    getAiStory as getAiStoryFlow,
    type AiStoryInput,
} from '@/ai/flows/storyteller-flow';
import {achievementsList} from '@/lib/achievements';

export async function checkAndAwardAchievements(user: IUser): Promise<Achievement[]> {
  try {
    await dbConnect();
    const userJourneys = await Journey.find({ userId: user._id }).lean();
    
    console.log('Checking achievements for user:', user._id, 'with', userJourneys.length, 'journeys');
    
    const newAchievements: Achievement[] = [];
    
    for (const achievementDef of achievementsList) {
      const hasAchievement = user.achievements?.some(a => a.name === achievementDef.name);
      
      if (!hasAchievement) {
        try {
          const meetsCondition = achievementDef.condition(userJourneys as IJourney[], user);
          console.log(`Achievement "${achievementDef.name}": ${meetsCondition ? 'EARNED' : 'not earned'}`);
          
          if (meetsCondition) {
            const newAchievement = {
              name: achievementDef.name,
              description: achievementDef.description,
              icon: achievementDef.icon,
              date: new Date(),
            };
            
            // Add to user's achievements
            user.achievements = user.achievements || [];
            user.achievements.push(newAchievement);
            newAchievements.push(newAchievement);
            
            console.log('New achievement awarded:', achievementDef.name);
          }
        } catch (conditionError) {
          console.error(`Error checking condition for achievement "${achievementDef.name}":`, conditionError);
        }
      }
    }
    
    console.log('Total new achievements:', newAchievements.length);
    return newAchievements;
  } catch (error) {
    console.error('Error in checkAndAwardAchievements:', error);
    return [];
  }
}

const carbonCalculatorSchema = z.object({
  origin: z
    .string()
    .trim()
    .min(3, {message: 'Origin must be at least 3 characters.'}),
  destination: z
    .string()
    .trim()
    .min(3, {message: 'Destination must be at least 3 characters.'}),
  modeOfTransport: z
    .string()
    .min(1, {message: 'Transport mode is required.'}),
  vehicleType: z.string().optional(),
  departureTime: z.string().optional(),
  includeAlternatives: z.string().optional(),
});

export type CarbonCalculatorState = {
  results?: any[];
  newAchievements?: Achievement[];
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const registerSchema = z.object({
  name: z.string().min(3, {message: 'Name must be at least 3 characters.'}),
  email: z.string().email({message: 'Please enter a valid email.'}),
  password: z
    .string()
    .min(6, {message: 'Password must be at least 6 characters.'}),
});

export type RegisterState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
});

export type ForgotPasswordState = {
    success?: boolean;
    message?: string;
    fieldErrors?: Record<string, string[] | undefined>;
};

const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  token: z.string().min(1, { message: 'Token is required.' }),
});

export type ResetPasswordState = {
    success?: boolean;
    message?: string;
    fieldErrors?: Record<string, string[] | undefined>;
};

export async function registerUser(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const validatedFields = registerSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid input.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const {name, email, password} = validatedFields.data;

  try {
    await dbConnect();

    const existingUser = await User.findOne({email});

    if (existingUser) {
      return {
        success: false,
        message: 'A user with this email already exists.',
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      totalEmissions: 0,
      achievements: [],
      preferences: {
        favoriteRoutes: '',
        transportModes: '',
        environmentalPriorities: '',
      },
    });

    // Don't auto-sign in, let the user sign in manually
    // This prevents issues with session management

    return {
      success: true,
      message: 'Registration successful! Please sign in with your new account.',
    };
  } catch (e) {
    console.error('Error in registerUser:', e);
    // This could be a database error or a signIn error
    if ((e as Error).message.includes('CredentialsSignin')) {
         return {
            success: false,
            message: 'An unexpected error occurred during login after registration.',
        };
    }
    return {
      success: false,
      message: 'An unexpected error occurred during registration.',
    };
  }
}

export async function requestPasswordReset(
    prevState: ForgotPasswordState,
    formData: FormData
): Promise<ForgotPasswordState> {
    const validatedFields = forgotPasswordSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return {
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { email } = validatedFields.data;

    try {
        await dbConnect();
        const user = await User.findOne({ email });

        if (user) {
            // If the user exists but has no password, they signed up with a social provider
            if (!user.password) {
                 return {
                    success: false, // Set to false to prevent showing the success message
                    message: "This account was created with a social provider. Please log in using that method.",
                };
            }

            const token = crypto.randomBytes(32).toString("hex");
            const passwordResetToken = crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");
            
            const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour from now

            user.passwordResetToken = passwordResetToken;
            user.passwordResetExpires = passwordResetExpires;
            await user.save();

            await sendPasswordResetEmail(email, token);
        }

        // Always return a success message to prevent user enumeration
        return {
            success: true,
            message: "If an account with that email exists and was created with a password, we've sent a password reset link.",
        };
    } catch (e) {
        console.error("Error in requestPasswordReset:", e);
        return {
             message: "An unexpected error occurred. Please try again later.",
        };
    }
}

export async function resetPassword(
    prevState: ResetPasswordState,
    formData: FormData
): Promise<ResetPasswordState> {
    const validatedFields = resetPasswordSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return {
             fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { password, token } = validatedFields.data;

    try {
        await dbConnect();
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return { message: "Invalid or expired password reset token." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        
        return { success: true, message: "Your password has been reset successfully. You can now log in." };

    } catch (e) {
        console.error("Error in resetPassword:", e);
        return { message: "An unexpected error occurred. Please try again later." };
    }
}

export async function handleCalculateCarbon(
  prevState: CarbonCalculatorState,
  formData: FormData
): Promise<CarbonCalculatorState> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { error: 'You must be logged in to calculate carbon emissions.' };
  }

  const validatedFields = carbonCalculatorSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      error: 'Invalid input.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { origin, destination, modeOfTransport, vehicleType, departureTime, includeAlternatives } = validatedFields.data;
  
  // Extract coordinates if provided
  const originCoordsStr = formData.get('originCoords') as string;
  const destinationCoordsStr = formData.get('destinationCoords') as string;
  
  let originCoords = { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco
  let destinationCoords = { lat: 37.7849, lng: -122.4094 }; // Slightly offset
  
  try {
    if (originCoordsStr && originCoordsStr !== 'null') {
      const parsed = JSON.parse(originCoordsStr);
      if (parsed && parsed.lat && parsed.lng) {
        originCoords = parsed;
      }
    }
    if (destinationCoordsStr && destinationCoordsStr !== 'null') {
      const parsed = JSON.parse(destinationCoordsStr);
      if (parsed && parsed.lat && parsed.lng) {
        destinationCoords = parsed;
      }
    }
  } catch (e) {
    // Use default coordinates if parsing fails
    console.warn('Failed to parse coordinates, using defaults');
  }

  try {
    const destinationCoordsStr = formData.get('destinationCoords') as string;
    
    if (originCoordsStr) {
      try {
        originCoords = JSON.parse(originCoordsStr);
      } catch (e) {
        console.warn('Failed to parse origin coordinates');
      }
    }
    
    if (destinationCoordsStr) {
      try {
        destinationCoords = JSON.parse(destinationCoordsStr);
      } catch (e) {
        console.warn('Failed to parse destination coordinates');
      }
    }

    // Enhanced emission calculation with comprehensive transport modes and real-time factors
    const calculateEmissions = (mode: string, distance: number, vehicleType?: string, timeOfDay?: string) => {
      const emissionFactors = {
        'driving': {
          'gasoline': 0.21,
          'diesel': 0.19,
          'hybrid': 0.12,
          'electric': 0.05,
          'plugin-hybrid': 0.08,
          'default': 0.21
        },
        'public transit': {
          'bus': 0.089,
          'electric-bus': 0.045,
          'train': 0.041,
          'subway': 0.038,
          'tram': 0.035,
          'default': 0.089
        },
        'ride-sharing': {
          'uber-pool': 0.15,
          'uber-x': 0.19,
          'lyft-shared': 0.14,
          'taxi': 0.22,
          'default': 0.18
        },
        'micro-mobility': {
          'e-scooter': 0.02,
          'e-bike': 0.01,
          'bike-share': 0,
          'default': 0.01
        },
        'cycling': 0,
        'walking': 0
      };
      
      if (mode === 'cycling' || mode === 'walking') {
        return 0;
      }
      
      // Apply time-of-day multiplier for traffic congestion
      let trafficMultiplier = 1.0;
      if (timeOfDay && mode === 'driving') {
        const hour = parseInt(timeOfDay.split(':')[0]);
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
          trafficMultiplier = 1.3; // Rush hour increases emissions
        } else if (hour >= 22 || hour <= 6) {
          trafficMultiplier = 0.9; // Night driving is more efficient
        }
      }
      
      const modeFactors = emissionFactors[mode.toLowerCase() as keyof typeof emissionFactors];
      if (typeof modeFactors === 'object') {
        const vehicleKey = vehicleType?.toLowerCase() || 'default';
        const factor = modeFactors[vehicleKey as keyof typeof modeFactors] || modeFactors.default;
        return distance * factor * trafficMultiplier;
      }
      
      return distance * 0.21 * trafficMultiplier; // fallback
    };

    // Calculate realistic distance based on coordinates or use mock data
    const calculateDistance = (origin: any, destination: any) => {
      if (origin.lat && origin.lng && destination.lat && destination.lng) {
        // Haversine formula for distance calculation
        const R = 6371; // Earth's radius in km
        const dLat = (destination.lat - origin.lat) * Math.PI / 180;
        const dLon = (destination.lng - origin.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      }
      return Math.random() * 25 + 8; // Fallback to random distance
    };

    const baseDistance = calculateDistance(originCoords, destinationCoords);
    const currentTime = departureTime || new Date().toTimeString().slice(0, 5);
    const shouldIncludeAlternatives = includeAlternatives !== 'false';
    const routes = [];
    
    // Primary route (user's selected mode)
    const primaryRoute = {
      summary: `${modeOfTransport} via optimal route`,
      distance: baseDistance,
      duration: Math.round(baseDistance / getSpeedForMode(modeOfTransport) * 60),
      routeType: 'primary',
      trafficLevel: getTrafficLevel(currentTime),
      carbon: {
        estimatedEmissionsKgCO2: calculateEmissions(modeOfTransport, baseDistance, vehicleType, currentTime),
        calculationDetails: generateCalculationDetails(modeOfTransport, baseDistance, vehicleType, currentTime),
        suggestedAlternatives: generateAlternatives(modeOfTransport, baseDistance),
        emissionBreakdown: getEmissionBreakdown(modeOfTransport, baseDistance, vehicleType)
      }
    };
    routes.push(primaryRoute);
    
    // Generate comprehensive multi-modal alternatives if requested
    if (shouldIncludeAlternatives) {
      const alternativeRoutes = generateMultiModalAlternatives(baseDistance, modeOfTransport, currentTime);
      routes.push(...alternativeRoutes);
    }

    const mockRoutes = routes;

    function getSpeedForMode(mode: string): number {
      const speeds = {
        'walking': 5, // km/h
        'cycling': 15, // km/h
        'driving': 35, // km/h (accounting for traffic)
        'public transit': 25, // km/h (including stops)
        'ride-sharing': 30, // km/h
        'micro-mobility': 12, // km/h for e-scooters
        'e-bike': 20 // km/h
      };
      return speeds[mode.toLowerCase() as keyof typeof speeds] || 35;
    }

    function getTrafficLevel(timeOfDay: string): 'low' | 'medium' | 'high' {
      const hour = parseInt(timeOfDay.split(':')[0]);
      if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
        return 'high';
      } else if ((hour >= 6 && hour <= 10) || (hour >= 16 && hour <= 20)) {
        return 'medium';
      }
      return 'low';
    }

    function getEmissionBreakdown(mode: string, distance: number, vehicleType?: string) {
      const baseEmission = calculateEmissions(mode, distance, vehicleType);
      return {
        fuel: baseEmission * 0.7,
        manufacturing: baseEmission * 0.2,
        maintenance: baseEmission * 0.1,
        total: baseEmission
      };
    }

    function generateMultiModalAlternatives(baseDistance: number, primaryMode: string, currentTime: string) {
      const alternatives = [];
      
      // Walking + Public Transit combination (for longer distances)
      if (baseDistance > 3 && primaryMode !== 'walking' && primaryMode !== 'public transit') {
        const walkDistance = 1.5; // km to transit
        const transitDistance = baseDistance - walkDistance;
        const totalEmissions = calculateEmissions('walking', walkDistance) + 
                              calculateEmissions('public transit', transitDistance);
        
        alternatives.push({
          summary: 'Walk + Public Transit (Multi-modal)',
          distance: baseDistance,
          duration: Math.round((walkDistance / 5 + transitDistance / 25) * 60),
          routeType: 'multi-modal',
          trafficLevel: 'low',
          modes: ['walking', 'public transit'],
          carbon: {
            estimatedEmissionsKgCO2: totalEmissions,
            calculationDetails: `Multi-modal journey: ${walkDistance}km walking + ${transitDistance.toFixed(1)}km public transit = ${totalEmissions.toFixed(2)} kg CO2`,
            suggestedAlternatives: 'Combines the health benefits of walking with efficient public transport.',
            emissionBreakdown: {
              walking: 0,
              transit: totalEmissions,
              total: totalEmissions
            }
          }
        });
      }

      // Cycling + Public Transit for very long distances
      if (baseDistance > 10 && primaryMode !== 'cycling' && primaryMode !== 'public transit') {
        const cycleDistance = 5; // km to transit hub
        const transitDistance = baseDistance - cycleDistance;
        const totalEmissions = calculateEmissions('public transit', transitDistance);
        
        alternatives.push({
          summary: 'Bike + Transit (Park & Ride)',
          distance: baseDistance,
          duration: Math.round((cycleDistance / 15 + transitDistance / 25) * 60),
          routeType: 'multi-modal',
          trafficLevel: 'low',
          modes: ['cycling', 'public transit'],
          carbon: {
            estimatedEmissionsKgCO2: totalEmissions,
            calculationDetails: `Bike & ride: ${cycleDistance}km cycling + ${transitDistance.toFixed(1)}km transit = ${totalEmissions.toFixed(2)} kg CO2`,
            suggestedAlternatives: 'Perfect for longer commutes - cycle to transit hub, then ride efficiently.',
            emissionBreakdown: {
              cycling: 0,
              transit: totalEmissions,
              total: totalEmissions
            }
          }
        });
      }

      // E-scooter alternative for short distances
      if (baseDistance <= 8 && primaryMode !== 'micro-mobility') {
        alternatives.push({
          summary: 'E-scooter route',
          distance: baseDistance,
          duration: Math.round(baseDistance / 12 * 60),
          routeType: 'alternative',
          trafficLevel: 'low',
          modes: ['micro-mobility'],
          carbon: {
            estimatedEmissionsKgCO2: calculateEmissions('micro-mobility', baseDistance, 'e-scooter'),
            calculationDetails: `E-scooter: ${baseDistance.toFixed(1)}km × 0.02 kg CO2/km = ${(baseDistance * 0.02).toFixed(2)} kg CO2`,
            suggestedAlternatives: 'Fun, fast, and very low emissions for short urban trips.',
            emissionBreakdown: getEmissionBreakdown('micro-mobility', baseDistance, 'e-scooter')
          }
        });
      }

      // Pure cycling alternative (if not already selected)
      if (baseDistance <= 20 && primaryMode !== 'cycling') {
        alternatives.push({
          summary: 'Cycling route (Direct)',
          distance: baseDistance * 0.95, // More direct route
          duration: Math.round(baseDistance * 0.95 / 15 * 60),
          routeType: 'alternative',
          trafficLevel: 'low',
          modes: ['cycling'],
          carbon: {
            estimatedEmissionsKgCO2: 0,
            calculationDetails: 'Zero emissions - cycling is completely sustainable and great exercise!',
            suggestedAlternatives: 'Perfect for fitness, environment, and avoiding traffic.',
            emissionBreakdown: {
              fuel: 0,
              manufacturing: 0,
              maintenance: 0,
              total: 0
            }
          }
        });
      }

      // Public transit alternative (if not already selected)
      if (primaryMode !== 'public transit') {
        alternatives.push({
          summary: 'Public Transit (Optimized)',
          distance: baseDistance * 1.1, // Slightly longer due to route constraints
          duration: Math.round(baseDistance * 1.1 / 25 * 60),
          routeType: 'alternative',
          trafficLevel: getTrafficLevel(currentTime),
          modes: ['public transit'],
          carbon: {
            estimatedEmissionsKgCO2: calculateEmissions('public transit', baseDistance * 1.1),
            calculationDetails: generateCalculationDetails('public transit', baseDistance * 1.1),
            suggestedAlternatives: 'Efficient mass transit reduces individual carbon footprint significantly.',
            emissionBreakdown: getEmissionBreakdown('public transit', baseDistance * 1.1)
          }
        });
      }

      // Ride-sharing alternative for convenience
      if (baseDistance > 2 && primaryMode !== 'ride-sharing') {
        alternatives.push({
          summary: 'Ride-sharing (Shared)',
          distance: baseDistance,
          duration: Math.round(baseDistance / 30 * 60),
          routeType: 'alternative',
          trafficLevel: getTrafficLevel(currentTime),
          modes: ['ride-sharing'],
          carbon: {
            estimatedEmissionsKgCO2: calculateEmissions('ride-sharing', baseDistance, 'uber-pool'),
            calculationDetails: `Shared ride: ${baseDistance.toFixed(1)}km × 0.15 kg CO2/km = ${(baseDistance * 0.15).toFixed(2)} kg CO2`,
            suggestedAlternatives: 'Convenient door-to-door service with reduced emissions when shared.',
            emissionBreakdown: getEmissionBreakdown('ride-sharing', baseDistance, 'uber-pool')
          }
        });
      }

      return alternatives.slice(0, 4); // Limit to 4 alternatives
    }

    function generateCalculationDetails(mode: string, distance: number, vehicleType?: string, timeOfDay?: string): string {
      const factor = calculateEmissions(mode, 1, vehicleType, timeOfDay); // Get factor per km
      
      if (mode === 'walking' || mode === 'cycling') {
        return `Zero emissions transport mode. Distance: ${distance.toFixed(1)}km. This is the most environmentally friendly option! 🌱`;
      }
      
      const vehicleInfo = vehicleType ? ` (${vehicleType})` : '';
      const trafficInfo = timeOfDay ? ` at ${timeOfDay}` : '';
      const trafficMultiplier = timeOfDay && mode === 'driving' ? 
        (getTrafficLevel(timeOfDay) === 'high' ? ' (+30% for rush hour traffic)' : '') : '';
      
      return `${mode}${vehicleInfo}${trafficInfo}: ${distance.toFixed(1)}km × ${factor.toFixed(3)} kg CO2/km = ${(distance * factor).toFixed(2)} kg CO2${trafficMultiplier}. Real-time calculation with traffic optimization.`;
    }

    function generateAlternatives(mode: string, distance: number): string {
      if (mode === 'walking' || mode === 'cycling') {
        return 'You\'re already using the most eco-friendly transport! Keep up the great work.';
      }
      
      const alternatives = [];
      
      if (mode !== 'public transit') {
        const transitSavings = ((calculateEmissions(mode, distance) - calculateEmissions('public transit', distance)) / calculateEmissions(mode, distance) * 100).toFixed(0);
        alternatives.push(`Public transit could save ${transitSavings}% emissions`);
      }
      
      if (distance <= 20 && mode !== 'cycling') {
        alternatives.push('Cycling would produce zero emissions');
      }
      
      if (distance <= 5 && mode !== 'walking') {
        alternatives.push('Walking is possible and produces zero emissions');
      }
      
      return alternatives.length > 0 
        ? `Consider: ${alternatives.join(', ')}.`
        : 'You\'re using an efficient transport mode for this distance.';
    }

    // Check for duplicate journey
    await dbConnect();
    const existingJourney = await Journey.findOne({
      userId: session.user.id,
      origin,
      destination,
      mode: modeOfTransport,
      date: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Within last 24 hours
      }
    });

    if (existingJourney) {
      return {
        results: mockRoutes,
        error: 'You have already logged a similar journey today. Duplicate journey not saved.'
      };
    }

    // Save the journey
    const bestRoute = mockRoutes[0];
    console.log('Saving journey:', {
      userId: session.user.id,
      origin,
      destination,
      distance: bestRoute.distance,
      mode: modeOfTransport,
      emissions: bestRoute.carbon.estimatedEmissionsKgCO2
    });
    
    const newJourney = await Journey.create({
      userId: session.user.id,
      origin,
      destination,
      distance: bestRoute.distance,
      mode: modeOfTransport,
      emissions: bestRoute.carbon.estimatedEmissionsKgCO2,
      date: new Date(),
      originCoords,
      destinationCoords
    });

    console.log('Journey saved:', newJourney._id);

    // Update user's total emissions
    const updatedUser = await User.findByIdAndUpdate(session.user.id, {
      $inc: { totalEmissions: bestRoute.carbon.estimatedEmissionsKgCO2 }
    }, { new: true });

    console.log('User total emissions updated:', updatedUser?.totalEmissions);

    // Check for new achievements
    const user = await User.findById(session.user.id);
    if (user) {
      const newAchievements = await checkAndAwardAchievements(user);
      
      if (newAchievements.length > 0) {
        await user.save();
      }
      
      revalidatePath('/dashboard');

      return {
        results: mockRoutes,
        newAchievements
      };
    }

    revalidatePath('/dashboard');

    return {
      results: mockRoutes,
      newAchievements: []
    };

  } catch (error) {
    console.error('Error in handleCalculateCarbon:', error);
    return { error: 'An unexpected error occurred while calculating carbon emissions.' };
  }
}

export async function getJourneys(): Promise<JourneyType[]> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return [];
  }

  await dbConnect();
  const journeys = (await Journey.find({userId: session.user.id})
    .sort({createdAt: -1})
    .limit(50)
    .lean()) as IJourney[];

  return journeys.map(j => ({
    id: j._id.toString(),
    userId: j.userId.toString(),
    date: j.date,
    origin: j.origin,
    destination: j.destination,
    distance: j.distance,
    mode: j.mode,
    emissions: j.emissions,
    originCoords: j.originCoords,
    destinationCoords: j.destinationCoords,
    createdAt: j.createdAt,
    updatedAt: j.updatedAt,
  }));
}

export async function getAuthenticatedUserData(): Promise<{
  preferences: UserPreferences;
  achievements: Achievement[];
  team?: {id: string; name: string; inviteCode: string} | null;
}> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return {
      preferences: {
        favoriteRoutes: '',
        transportModes: '',
        environmentalPriorities: '',
      },
      achievements: [],
      team: null,
    };
  }

  await dbConnect();
  const user = await User.findById(session.user.id).populate('teamId').lean();

  let teamData = null;
  if (user?.teamId) {
    const team = user.teamId as unknown as ITeam;
    teamData = {
      id: team._id.toString(),
      name: team.name,
      inviteCode: team.inviteCode,
    };
  }

  return {
    preferences: user?.preferences || {
      favoriteRoutes: 'Scenic coastal highway',
      transportModes: 'Cycling, Public Transit',
      environmentalPriorities:
        'Minimizing carbon footprint, avoiding traffic congestion',
    },
    achievements:
      user?.achievements?.map(a => ({
        name: a.name,
        description: a.description,
        icon: a.icon,
        date: a.date,
      })) || [],
    team: teamData,
  };
}

export async function getLeaderboard(): Promise<LeaderboardUser[]> {
  await dbConnect();
  // Only include users who have logged at least one journey
  const users = await User.find({ totalEmissions: { $gt: 0 } })
    .sort({ totalEmissions: 1 })
    .limit(10)
    .lean();

  return users.map((user, index) => ({
    id: user._id.toString(),
    name: user.name || 'Anonymous User',
    image: user.image,
    totalEmissions: user.totalEmissions || 0,
    rank: index + 1,
    achievements: user.achievements?.map(a => ({
      ...a,
      date: new Date(a.date),
    })) || [],
    memberSince: user.createdAt?.toISOString() || new Date().toISOString(),
  }));
}

export async function getAiStory(): Promise<{story?: AiStory; error?: string}> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { error: 'You must be logged in to get your AI story.' };
  }

  try {
    await dbConnect();
    const user = await User.findById(session.user.id).lean();
    const journeys = await Journey.find({ userId: session.user.id }).lean();

    if (!user) {
      return { error: 'User not found.' };
    }

    if (journeys.length === 0) {
      return { error: 'No journeys found. Log some trips to get your personalized AI story!' };
    }

    try {
      const story = await getAiStoryFlow({
        journeys: journeys.map(j => ({
          ...j,
          id: j._id.toString(),
          userId: j.userId.toString(),
          date: j.date,
          createdAt: j.createdAt,
        })),
        achievements: user.achievements?.map(a => ({
          ...a,
          date: new Date(a.date),
        })) || [],
        userName: user.name || 'Eco Warrior',
      });

      return { story };
    } catch (aiError: any) {
      // If AI service is blocked, return a fallback story
      if (aiError.message?.includes('API_KEY_SERVICE_BLOCKED') || aiError.status === 403) {
        const fallbackStory = generateFallbackStory(user, journeys);
        return { story: fallbackStory };
      }
      throw aiError;
    }
  } catch (error) {
    console.error('Error in getAiStory:', error);
    return { error: 'An unexpected error occurred while generating your AI story.' };
  }
}

function generateFallbackStory(user: any, journeys: any[]): AiStory {
  const totalEmissions = journeys.reduce((sum, j) => sum + j.emissions, 0);
  const ecoFriendlyTrips = journeys.filter(j => j.emissions === 0).length;
  const mostUsedMode = journeys.reduce((acc, j) => {
    acc[j.mode] = (acc[j.mode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topMode = Object.entries(mostUsedMode).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'various modes';
  
  return {
    title: `Your Eco Journey Summary, ${user.name || 'Eco Warrior'}!`,
    narrative: `## 🌱 Your Sustainable Travel Story

**Great progress on your eco-journey!** You've logged **${journeys.length}** trips, showing your commitment to tracking your environmental impact.

### 📊 Your Impact at a Glance
- **Total CO2 Emissions**: ${totalEmissions.toFixed(2)} kg
- **Eco-Friendly Trips**: ${ecoFriendlyTrips} zero-emission journeys
- **Favorite Transport**: ${topMode}

### 🎯 Achievements Unlocked
You've earned **${user.achievements?.length || 0}** achievements! ${user.achievements?.length > 0 ? 'Keep up the fantastic work!' : 'Start logging more trips to unlock your first badge!'}

### 💡 Keep Going!
${ecoFriendlyTrips > 0 
  ? `Your ${ecoFriendlyTrips} eco-friendly trips are making a real difference! Consider increasing walking or cycling for even greater impact.`
  : 'Try incorporating more walking, cycling, or public transit into your routine to reduce your carbon footprint.'
}

Every journey you log helps build awareness of your environmental impact. Keep tracking, keep improving! 🌍✨`
  };
}

export async function getCommunityImpactZones(
  input: CommunityImpactInput
): Promise<{zones?: CommunityImpactZone[]; error?: string}> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { error: 'You must be logged in to analyze community impact.' };
  }

  try {
    const zones = await getCommunityImpactZonesFlow(input);
    return { zones: zones.communityImpactZones };
  } catch (error) {
    console.error('Error in getCommunityImpactZones:', error);
    return { error: 'An unexpected error occurred while analyzing community impact zones.' };
  }
}

export async function findNearbyEvChargers(
  latitude: number,
  longitude: number
): Promise<{stations?: EvChargingStation[]; error?: string}> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { error: 'You must be logged in to find EV charging stations.' };
  }

  try {
    // Mock EV charging stations for demo purposes
    // In production, you would call the Google Places API
    const mockStations: EvChargingStation[] = [
      {
        id: '1',
        name: 'Tesla Supercharger',
        vicinity: '123 Main St, Downtown',
        location: { lat: latitude + 0.01, lng: longitude + 0.01 },
        isOpenNow: true,
      },
      {
        id: '2',
        name: 'ChargePoint Station',
        vicinity: '456 Oak Ave, City Center',
        location: { lat: latitude - 0.01, lng: longitude - 0.01 },
        isOpenNow: 'unknown',
      },
      {
        id: '3',
        name: 'EVgo Fast Charging',
        vicinity: '789 Pine Rd, Shopping Mall',
        location: { lat: latitude + 0.005, lng: longitude - 0.005 },
        isOpenNow: false,
      },
    ];

    return { stations: mockStations };
  } catch (error) {
    console.error('Error in findNearbyEvChargers:', error);
    return { error: 'An unexpected error occurred while finding EV charging stations.' };
  }
}

const preferencesSchema = z.object({
  favoriteRoutes: z
    .string()
    .trim()
    .max(100, 'Favorite routes cannot exceed 100 characters.')
    .optional(),
  transportModes: z
    .string()
    .trim()
    .max(100, 'Transport modes cannot exceed 100 characters.')
    .optional(),
  environmentalPriorities: z
    .string()
    .trim()
    .max(200, 'Priorities cannot exceed 200 characters.')
    .optional(),
});

export type UserPreferencesState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | null;

export async function updateUserPreferences(
  prevState: UserPreferencesState,
  formData: FormData
): Promise<UserPreferencesState> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return {success: false, message: 'You must be logged in.'};
  }

  const validatedFields = preferencesSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid input.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await dbConnect();
    await User.findByIdAndUpdate(session.user.id, {
      preferences: validatedFields.data,
    });
    revalidatePath('/');
    return {success: true, message: 'Your preferences have been updated.'};
  } catch (e) {
    console.error('Error in updateUserPreferences:', e);
    return {
      success: false,
      message:
        'An unexpected error occurred while updating your preferences.',
    };
  }
}

export async function deleteAccount(): Promise<{
  success: boolean;
  message: string;
}> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return {success: false, message: 'You must be logged in.'};
  }

  try {
    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) {
      return {success: false, message: 'User not found.'};
    }

    if (user.teamId) {
      await Team.findByIdAndUpdate(user.teamId, {$pull: {members: user._id}});
    }

    await Journey.deleteMany({userId: session.user.id});
    await User.findByIdAndDelete(session.user.id);

    revalidatePath('/'); // Revalidate all paths after deletion
    revalidatePath(`/team/${user.teamId}`);
    return {
      success: true,
      message:
        'Your account and all associated data have been permanently deleted.',
    };
  } catch (e) {
    console.error('Error in deleteAccount:', e);
    return {
      success: false,
      message: 'An unexpected error occurred while deleting your account.',
    };
  }
}

export async function getPublicUserData(
  userId: string
): Promise<PublicUserProfile | null> {
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return null;
  }

  const user = await User.findById(userId)
    .select('name image totalEmissions achievements createdAt')
    .lean();

  if (!user) {
    return null;
  }

  return {
    name: user.name || 'Anonymous User',
    image: user.image,
    totalEmissions: user.totalEmissions || 0,
    achievements:
      user.achievements?.map(a => ({
        ...a,
        date: new Date(a.date),
      })) || [],
    memberSince: user.createdAt?.toISOString() || new Date().toISOString(),
  };
}

export async function getTeamDashboardData(
  teamId: string
): Promise<TeamDashboardData | null> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return null;
  }

  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return null;
  }

  const user = await User.findById(session.user.id).select('teamId').lean();

  if (!user || user.teamId?.toString() !== teamId) {
    return null;
  }

  const team = (await Team.findById(teamId).lean()) as ITeam;
  if (!team) {
    return null;
  }

  const teamMembers = await User.find({teamId: team._id})
    .select('name image totalEmissions')
    .sort({totalEmissions: 1})
    .lean();

  const totalEmissions = teamMembers.reduce(
    (acc, member) => acc + (member.totalEmissions || 0),
    0
  );

  const leaderboard = teamMembers.map((member, index) => ({
    id: member._id.toString(),
    name: member.name || 'Anonymous User',
    image: member.image,
    totalEmissions: member.totalEmissions || 0,
    rank: index + 1,
  }));

  return {
    id: team._id.toString(),
    name: team.name,
    memberCount: teamMembers.length,
    totalEmissions,
    leaderboard,
  };
}

const createTeamSchema = z.object({
  teamName: z
    .string()
    .min(3, {message: 'Team name must be at least 3 characters.'})
    .max(50, {message: 'Team name cannot exceed 50 characters.'}),
});

export type TeamManagementState = {
  success?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  type?: 'create' | 'join';
};

export async function createTeam(
  prevState: TeamManagementState,
  formData: FormData
): Promise<TeamManagementState> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return {message: 'You must be logged in.', type: 'create'};
  }

  const validatedFields = createTeamSchema.safeParse({
    teamName: formData.get('teamName'),
  });

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
      type: 'create',
    };
  }
  const {teamName} = validatedFields.data;

  try {
    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) {
      return {message: 'User not found.', type: 'create'};
    }
    if (user.teamId) {
      return {message: 'You are already in a team.', type: 'create'};
    }

    const newTeam = await Team.create({
      name: teamName,
      members: [user._id],
      inviteCode: crypto.randomBytes(4).toString('hex').toUpperCase(),
    });

    user.teamId = newTeam._id;
    await user.save();

    revalidatePath('/');
    return {success: true, message: `Successfully created team: ${teamName}`, type: 'create'};
  } catch (e) {
    console.error('Error in createTeam:', e);
    return {message: 'An unexpected error occurred while creating the team.', type: 'create'};
  }
}

const joinTeamSchema = z.object({
  inviteCode: z
    .string()
    .trim()
    .length(8, {message: 'Invite code must be 8 characters.'}),
});

export async function joinTeam(
  prevState: TeamManagementState,
  formData: FormData
): Promise<TeamManagementState> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return {message: 'You must be logged in.', type: 'join'};
  }
  
  const validatedFields = joinTeamSchema.safeParse({
    inviteCode: formData.get('inviteCode'),
  });

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
      type: 'join',
    };
  }
  const {inviteCode} = validatedFields.data;

  try {
    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) {
      return {message: 'User not found.', type: 'join'};
    }
    if (user.teamId) {
      return {message: 'You are already in a team.', type: 'join'};
    }

    const team = await Team.findOne({inviteCode: inviteCode.toUpperCase()});
    if (!team) {
      return {message: 'Invalid invite code.', type: 'join'};
    }

    team.members.push(user._id);
    await team.save();

    user.teamId = team._id;
    await user.save();
    
    revalidatePath('/');
    return {success: true, message: `Successfully joined team: ${team.name}`, type: 'join'};
  } catch (e) {
    console.error('Error in joinTeam:', e);
    return {message: 'An unexpected error occurred while joining the team.', type: 'join'};
  }
}

    

    