import { ValidatePayment } from "./validate-payment";
import { UpdateMembership } from "./update-membership";
import { PaymentRepository } from "../../repositories/payment-repository";
import { MemberRepository } from "../../repositories/member-repository";
import { CreatePaymentDTO, Payment } from "../../entities/Payment";
import { InvalidDataError } from "../../errors/error";
import { Member } from "../../entities/Member";

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
  const savedMember = await members.save(updatedMember);

  return { payment: savedPayment, updatedMember: savedMember };
}