import { CreatePaymentDTO } from "../../entities/Payment.js";
import { createInvalidDataError, InvalidDataError } from "../../errors/error.js";
import { MemberRepository } from "../../repositories/member-repository.js";
import { PaymentRepository } from "../../repositories/payment-repository.js";

/**
 * Validates a payment request against business rules and member status
 * 
 * This case validates whether a payment request is valid according to business rules
 * including member existence, amount requirements, and duplicate payment checks.
 * 
 * @param {CreatePaymentDTO} paymentDTO - The payment data to validate
 * @param {MemberRepository} members - Repository for member operations
 * @param {PaymentRepository} payments - Repository for payment operations
 * @returns {Promise<InvalidDataError | void>} Either throws an InvalidDataError
 *   if validation fails, or returns void if validation succeeds
 * 
 * @throws {InvalidDataError} If any validation rule fails
 */
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