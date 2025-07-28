import { CreatePaymentDTO } from "../../entities/Payment";
import { createInvalidDataError, InvalidDataError } from "../../errors/error";
import { MemberRepository } from "../../repositories/member-repository";
import { PaymentRepository } from "../../repositories/payment-repository";


export async function ValidatePayment(
  paymentDTO: CreatePaymentDTO,
  members: MemberRepository,
  payments: PaymentRepository
): Promise<InvalidDataError | void> {
  if (!paymentDTO.memberId.trim()) return createInvalidDataError("Member ID must not be empty");
  if (paymentDTO.amount <= 0) return createInvalidDataError("Amount must be positive");
  if (paymentDTO.monthsCovered <= 0) return createInvalidDataError("Months covered must be positive");
  if (!paymentDTO.paymentMethod) return createInvalidDataError("Payment method is required");

  const member = await members.findById(paymentDTO.memberId);
  if (!member) return createInvalidDataError("Member not found");
   const paymentMonth = new Date(
    paymentDTO.paymentDate.getFullYear(),
    paymentDTO.paymentDate.getMonth(),
    1
  );
  
  const existingPayment = await payments.findByMemberIdAndMonth(
    paymentDTO.memberId,
    paymentMonth
  );

  if (existingPayment) {
    return createInvalidDataError('Member already paid for this month');
  }
}