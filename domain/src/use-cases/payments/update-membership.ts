import { Member } from "../../entities/Member.js";
import { Payment } from "../../entities/Payment.js";

/**
 * Updates the membership status and paidUntil date of a member based on a new payment.
 *
 * - If the member has never paid (`paidUntil` == 01/01/1970), the membership starts today.
 * - If the member still has active time remaining (`paidUntil` in the future), it extends from that date.
 * - The final `paidUntil` is calculated by adding the number of months covered by the payment.
 * - Dates are normalized to midnight UTC to avoid time drift or inconsistencies.
 *
 * @param {Member} member - The member whose membership should be updated.
 * @param {Payment} payment - The payment information, including months covered.
 * @returns {Member} The updated member object with a new `paidUntil` and status set to 'active'.
 */
export function UpdateMembership(member: Member, payment: Payment): Member { 
  // Normalizes a date to 00:00:00 UTC to ensure consistent date comparisons.
  const normalizeDate = (date: Date) => {
    const normalized = new Date(date);
    normalized.setUTCHours(0, 0, 0, 0);
    return normalized;
  };

  // Current normalized date
  const currentDate = normalizeDate(new Date());
  // Determine base date: if never paid (timestamp = 0), use today; else use last paidUntil
  const memberPaidUntil = member.paidUntil.getTime() === 0 ? 
    currentDate : 
    normalizeDate(member.paidUntil);

  // Use the future date if still valid; otherwise, use today
  const startDate = memberPaidUntil > currentDate ? memberPaidUntil : currentDate;
  
  // Add months covered by the payment
  const newPaidUntil = new Date(startDate);
  newPaidUntil.setUTCMonth(newPaidUntil.getUTCMonth() + payment.monthsCovered);

  return {
    ...member,
    membershipStatus: 'active',
    paidUntil: normalizeDate(newPaidUntil)
  };
}