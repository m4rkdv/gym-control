import { ValidatePayment } from "./validate-payment.js";
import { UpdateMembership } from "./update-membership.js";
import { PaymentRepository } from "../../repositories/payment-repository.js";
import { MemberRepository } from "../../repositories/member-repository.js";
import { CreatePaymentDTO, Payment } from "../../entities/Payment.js";
import { InvalidDataError } from "../../errors/error.js";
import { Member } from "../../entities/Member.js";

export interface ProcessPaymentDependencies {
  payments: PaymentRepository;
  members: MemberRepository;
}

/**
 * Processes a payment, validates it, updates member membership, and saves the changes
 * @param {ProcessPaymentDependencies} dependencies - Object containing required repositories
 * @param {CreatePaymentDTO} paymentDTO - Payment data to be processed
 * @returns {Promise<InvalidDataError | { payment: Payment; updatedMember: Member }>} 
 *          Returns either an error if validation fails or the saved payment and updated member
 */
export async function ProcessPayment(
  { payments, members }: ProcessPaymentDependencies,
  paymentDTO: CreatePaymentDTO
): Promise<InvalidDataError | { payment: Payment; updatedMember: Member }> {
  
  // Validate payment data before processing
  const validationError = await ValidatePayment(paymentDTO, members, payments);
  if (validationError) return validationError;

  // Retrieve member associated with the payment
  const member = await members.findById(paymentDTO.memberId) as Member;

  // Create payment object with generated UUID
  const payment: Payment = {
    id: crypto.randomUUID(),
    ...paymentDTO,
  };

  // Update member's membership status based on the payment
  const updatedMember = UpdateMembership(member, payment);

  // Return the saved payment and updated member information
  const savedPayment = await payments.save(payment);
  
  const { id, ...memberUpdates } = updatedMember;
  const savedMember = await members.update(id, memberUpdates);

  return { payment: savedPayment, updatedMember: savedMember };
}