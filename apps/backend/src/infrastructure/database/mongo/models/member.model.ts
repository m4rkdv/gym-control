import mongoose, { Schema, Document } from 'mongoose';
import { Member } from '@gymcontrol/domain';


export interface MemberDocument extends Omit<Member, 'id'>, Document {
  _id: string;
}

const MemberSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  weight: { type: Number, required: true },
  age: { type: Number, required: true },
  joinDate: { type: Date, required: true },
  membershipStatus: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended', 'deleted'], 
    required: true 
  },
  paidUntil: { type: Date, required: true }
});

export const MemberModel = mongoose.model<MemberDocument>('Member', MemberSchema);