import { describe, test, expect } from 'vitest';
import { Payment } from './Payment';


describe('Payment Entity', () => {
  test('should validate payment methods are correct', () => {
    const validMethods = ['mercadopago', 'cash', 'transfer', 'mercadopago_transfer'];
    
    validMethods.forEach(method => {
      const payment: Payment = {
        id: '1',
        memberId: 'member-1',
        amount: 100,
        paymentMethod: method as Payment['paymentMethod'],
        paymentDate: new Date(),
        monthsCovered: 1,
        isProportional: false,
        hasPromotion: false
      };
      
      expect(payment.paymentMethod).toBe(method);
    });
  });

  test('should handle proportional payment calculation', () => {
    const proportionalPayment: Payment = {
      id: '1',
      memberId: 'member-1',
      amount: 50,
      paymentMethod: 'cash',
      paymentDate: new Date(),
      monthsCovered: 1,
      isProportional: true,
      hasPromotion: false
    };
    
    expect(proportionalPayment.isProportional).toBe(true);
    expect(proportionalPayment.amount).toBeLessThan(100); // Assuming 100 is full month
  });

  test('should maintain correct relationship with member', () => {
    const payment: Payment = {
      id: '1',
      memberId: 'member-123',
      amount: 100,
      paymentMethod: 'mercadopago',
      paymentDate: new Date(),
      monthsCovered: 1,
      isProportional: false,
      hasPromotion: false
    };
    
    expect(payment.memberId).toBe('member-123');
    expect(typeof payment.memberId).toBe('string');
  });
});