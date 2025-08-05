import { Payment } from '@gymcontrol/domain/entities/Payment';
import { PaymentRepository } from '@gymcontrol/domain/repositories/payment-repository';
import { PaymentModel } from '../database/mongo/models/payment.model';

export class MongoPaymentRepository implements PaymentRepository {
  async save(payment: Omit<Payment, 'id'>): Promise<Payment> {
    const paymentDoc = new PaymentModel(payment);
    const saved = await paymentDoc.save();
    return {
      id: saved._id.toString(),
      ...payment
    };
  }

  async findByMemberId(memberId: string): Promise<Payment[]> {
    const payments = await PaymentModel.find({ memberId });
    return payments.map(p => ({
      id: p._id.toString(),
      memberId: p.memberId,
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      paymentDate: p.paymentDate,
      monthsCovered: p.monthsCovered,
      isProportional: p.isProportional,
      hasPromotion: p.hasPromotion,
      promotionId: p.promotionId
    }));
  }

  async findByMemberIdAndMonth(memberId: string, month: Date): Promise<Payment | null> {
    throw new Error('Method not implemented');
  }
}