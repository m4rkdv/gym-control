import mongoose, { Schema, Document } from 'mongoose';
import { Payment } from '@gymcontrol/domain/entities/Payment';

export interface PaymentDocument extends Omit<Payment, 'id'>, Document {
  _id: string;
}

const PaymentSchema = new Schema({
  memberId: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['mercadopago', 'cash', 'transfer', 'mercadopago_transfer'], 
    required: true 
  },
  paymentDate: { type: Date, required: true },
  monthsCovered: { type: Number, required: true },
  isProportional: { type: Boolean, default: false },
  hasPromotion: { type: Boolean, default: false },
  promotionId: { type: String }
});

export const PaymentModel = mongoose.model<PaymentDocument>('Payment', PaymentSchema);