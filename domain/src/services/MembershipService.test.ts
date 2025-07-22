import { describe, it, expect, vi } from 'vitest';
import { Payment } from '../entities/payment';
import { MembershipService } from './MembershipService';

describe('MembershipService', () => {
  const membershipService = new MembershipService();

  it('should calculate paid until date for multiple months', () => {
    const currentDate = new Date('2024-01-01');
    const result = membershipService.calculatePaidUntilDate(currentDate, 3);
    
    expect(result.getMonth()).toBe(3); // April (0-indexed)
    expect(result.getFullYear()).toBe(2024);
  });

  it('should calculate proportional amount correctly', () => {
    // Mock current date to mid-month
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15')); // 15th of January
    
    const basePrice = 100;
    const result = membershipService.calculateProportionalAmount(basePrice);
    
    // Should be roughly half the price for half the month
    expect(result).toBeGreaterThan(40);
    expect(result).toBeLessThan(60);
    
    vi.useRealTimers();
  });

  it('should detect if already paid for month', () => {
    const payments: Payment[] = [
      {
        id: 'payment-1',
        memberId: 'member-1',
        amount: 100,
        paymentMethod: 'cash',
        paymentDate: new Date('2024-01-05'),
        monthsCovered: 1,
        isProportional: false,
        hasPromotion: false
      }
    ];

    const targetMonth = new Date('2024-01-20');
    const result = membershipService.hasAlreadyPaidForMonth(payments, targetMonth);
    
    expect(result).toBe(true);
  });

  it('should return false if not paid for target month', () => {
    const payments: Payment[] = [
      {
        id: 'payment-1',
        memberId: 'member-1',
        amount: 100,
        paymentMethod: 'cash',
        paymentDate: new Date('2024-01-05'),
        monthsCovered: 1,
        isProportional: false,
        hasPromotion: false
      }
    ];

    const targetMonth = new Date('2024-02-20');
    const result = membershipService.hasAlreadyPaidForMonth(payments, targetMonth);
    
    expect(result).toBe(false);
  });
});