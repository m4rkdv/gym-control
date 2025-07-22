import { Payment } from "../entities/Payment";

export class MembershipService {
    
  calculatePaidUntilDate(currentPaidUntil: Date, monthsToAdd: number, isProportional: boolean = false): Date {
    const baseDate = currentPaidUntil > new Date() ? currentPaidUntil : new Date();
    
    if (isProportional) {
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const daysRemaining = endOfMonth.getDate() - now.getDate() + 1;
      const totalDaysInMonth = endOfMonth.getDate();
      
      // Calculate proportional days and add to current date
      const proportionalDays = Math.ceil((daysRemaining / totalDaysInMonth) * 30);
      const result = new Date(baseDate);
      result.setDate(result.getDate() + proportionalDays);
      return result;
    }
    
    const result = new Date(baseDate);
    result.setMonth(result.getMonth() + monthsToAdd);
    return result;
  }

  calculateProportionalAmount(basePrice: number): number {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysRemaining = endOfMonth.getDate() - now.getDate() + 1;
    const totalDaysInMonth = endOfMonth.getDate();
    
    return Math.ceil((basePrice * daysRemaining) / totalDaysInMonth);
  }

  hasAlreadyPaidForMonth(payments: Payment[], targetMonth: Date): boolean {
    return payments.some(payment => {
      const paymentMonth = new Date(payment.paymentDate);
      return paymentMonth.getMonth() === targetMonth.getMonth() && 
             paymentMonth.getFullYear() === targetMonth.getFullYear();
    });
  }
}