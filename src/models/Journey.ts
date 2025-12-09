
import mongoose, { Document, Model, Schema, Types } from 'mongoose';

// Note: Omit 'id' from JourneyType as it is handled by Mongoose's _id.
export interface IJourney extends Omit<import('@/lib/types').Journey, 'id' | 'userId'>, Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date; // This is added by timestamps: true
  updatedAt: Date; // This is added by timestamps: true
}

const CoordsSchema = new Schema({
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
}, { _id: false });

const JourneySchema: Schema<IJourney> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  distance: { type: Number, required: true },
  mode: { type: String, required: true },
  emissions: { type: Number, required: true },
  date: { type: Date, required: true },
  originCoords: { type: CoordsSchema, required: true },
  destinationCoords: { type: CoordsSchema, required: true },
}, { timestamps: true });

const Journey: Model<IJourney> = mongoose.models.Journey || mongoose.model<IJourney>('Journey', JourneySchema);

export default Journey;
