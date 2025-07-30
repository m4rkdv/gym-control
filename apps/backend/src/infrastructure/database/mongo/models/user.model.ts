import mongoose, { Document, Schema } from 'mongoose';
import { User } from '../../../../../../../domain/src/entities/User';

export interface UserDocument extends Omit<User, 'id'>, Document {
  _id: string;
}

const UserSchema = new Schema({
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['member', 'trainer', 'admin'], required: true },
  memberId: { type: String },
  trainerId: { type: String },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);