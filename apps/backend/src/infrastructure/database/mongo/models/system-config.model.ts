import mongoose, { Schema, Document } from 'mongoose';
import { SystemConfig } from '@gymcontrol/domain/entities/SystemConfig';

export interface SystemConfigDocument extends Omit<SystemConfig, 'id'>, Document {
  _id: string;
}

const SystemConfigSchema = new Schema({
  basePrice: { type: Number, required: true },
  gracePeriodDays: { type: Number, required: true },
  suspensionMonths: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String, required: true }
});

export const SystemConfigModel = mongoose.model<SystemConfigDocument>('SystemConfig', SystemConfigSchema);