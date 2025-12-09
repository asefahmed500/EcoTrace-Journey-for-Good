
import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import type { UserPreferences } from '@/lib/types';
import type { Achievement as AchievementType } from '@/lib/types';

// Use a type that allows for Date objects, which is what we'll store in the DB
interface IAchievement extends Omit<AchievementType, 'date'> {
  date: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name?: string | null;
  email: string;
  image?: string | null;
  password?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  totalEmissions: number;
  achievements: IAchievement[];
  preferences: UserPreferences;
  teamId?: Types.ObjectId | null;
  // Community & Gamification features
  totalPoints: number;
  level: number;
  activeChallenges: Array<{
    challengeId: string;
    startDate: Date;
    progress: number;
    completed: boolean;
  }>;
  completedChallenges: Array<{
    challengeId: string;
    completedDate: Date;
    pointsEarned: number;
  }>;
  streaks: {
    carFree: number;
    cycling: number;
    walking: number;
    publicTransit: number;
    zeroEmission: number;
  };
  friends: Types.ObjectId[];
  storiesShared: number;
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  date: { type: Date, required: true },
}, { _id: false });

const PreferencesSchema = new Schema<UserPreferences>({
    favoriteRoutes: { type: String, default: ""},
    transportModes: { type: String, default: ""},
    environmentalPriorities: { type: String, default: ""},
}, { _id: false });


const UserSchema: Schema<IUser> = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  image: {
    type: String,
  },
  password: {
    type: String,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  totalEmissions: {
    type: Number,
    default: 0,
  },
  achievements: { type: [AchievementSchema], default: [] },
  preferences: { type: PreferencesSchema, default: () => ({}) },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: false,
    default: null,
  },
  // Community & Gamification features
  totalPoints: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  activeChallenges: [{
    challengeId: String,
    startDate: Date,
    progress: Number,
    completed: Boolean
  }],
  completedChallenges: [{
    challengeId: String,
    completedDate: Date,
    pointsEarned: Number
  }],
  streaks: {
    carFree: { type: Number, default: 0 },
    cycling: { type: Number, default: 0 },
    walking: { type: Number, default: 0 },
    publicTransit: { type: Number, default: 0 },
    zeroEmission: { type: Number, default: 0 }
  },
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  storiesShared: { type: Number, default: 0 },
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
