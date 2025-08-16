import { Payment } from "../entities/Payment.js";

export interface PaymentRepository {
  save(payment: Payment): Promise<Payment>;
  findByMemberId(memberId: string): Promise<Payment[]>;
  findByMemberIdAndMonth(memberId: string, month: Date): Promise<Payment | null>;
}