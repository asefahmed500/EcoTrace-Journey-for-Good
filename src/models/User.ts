
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
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
