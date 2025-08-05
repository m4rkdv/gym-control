import mongoose, { Schema, Document } from 'mongoose';
import { Trainer } from '@gymcontrol/domain/entities/Trainer';

export interface TrainerDocument extends Omit<Trainer, 'id'>, Document {
  _id: string;
}

const TrainerSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  hireDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
});

export const TrainerModel = mongoose.model<TrainerDocument>('Trainer', TrainerSchema);