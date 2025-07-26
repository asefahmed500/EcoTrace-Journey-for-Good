
import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ITeam extends Document {
  _id: Types.ObjectId;
  name: string;
  members: Types.ObjectId[];
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema: Schema<ITeam> = new Schema({
  name: { type: String, required: true, trim: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  inviteCode: { type: String, required: true, unique: true, index: true },
}, { timestamps: true });

const Team: Model<ITeam> = mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema);

export default Team;
