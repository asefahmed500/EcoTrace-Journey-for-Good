
'use server';

import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import {auth, signIn} from '@/auth';
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
    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    await signIn('credentials', {
        email,
        password,
        redirect: false, // Important: don't redirect in the action
    });

    return {
      success: true,
      message: 'Registration successful! Redirecting to your dashboard...',
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

export async function getJourneys(): Promise<JourneyType[]> {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  await dbConnect();
  const journeys = (await Journey.find({userId: session.user.id})
    .sort({createdAt: -1})
    .limit(50)
    .lean()) as IJourney[];

  return journeys.map(j => ({
    ...j,
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
  }));
}

export async function getAuthenticatedUserData(): Promise<{
  preferences: UserPreferences;
  achievements: Achievement[];
  team?: {id: string; name: string; inviteCode: string} | null;
}> {
  const session = await auth();
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
        ...a,
        date: new Date(a.date),
      })) || [],
    team: teamData,
  };
}

export async function getLeaderboard(): Promise<LeaderboardUser[]> {
  await dbConnect();
  const users = await User.find({}).sort({totalEmissions: 1}).limit(10).lean();

  return users.map((user, index) => ({
    id: user._id.toString(),
    name: user.name || 'Anonymous User',
    image: user.image,
    totalEmissions: user.totalEmissions || 0,
    rank: index + 1,
  }));
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
  const session = await auth();
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
  const session = await auth();
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
  const session = await auth();
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
  const session = await auth();
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
  const session = await auth();
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

    

    