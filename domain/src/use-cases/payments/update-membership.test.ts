import { describe, test, expect, vi, beforeAll, afterAll } from 'vitest';
import { UpdateMembership } from './update-membership';
import { Member } from '../../entities/Member';
import { Payment } from '../../entities/Payment';

describe('UpdateMembership', () => {
  // Set UTC Date for tests (1 de Febrero 2025)
  beforeAll(() => {
    vi.useFakeTimers();
    //Date.UTC starts at 0 and ends at 11
    vi.setSystemTime(new Date(Date.UTC(2025, 1, 1)));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  // Month in Date.UTC starts at 0 and ends at 11, so => month - 1
  const createUTCDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  };

  const baseMember: Member = {
    id: 'member-1',
    firstName: 'Jon',
    lastName: 'Snow',
    email: 'jon@snow.com',
    weight: 80,
    age: 25,
    joinDate: createUTCDate('2020-01-01'),
    membershipStatus: 'active',
    paidUntil: createUTCDate('2025-01-01')
  };

  const basePayment: Payment = {
    id: 'payment-1',
    memberId: 'member-1',
    amount: 5000,
    paymentMethod: 'cash',
    paymentDate: createUTCDate('2025-01-15'),
    monthsCovered: 1,
    isProportional: false,
    hasPromotion: false
  };

  test('expiredMembership_extendsFromCurrentDate_successfully', () => {
    const expiredMember: Member = {
      ...baseMember,
      paidUntil: createUTCDate('2024-12-31')
    };

    const result = UpdateMembership(expiredMember, basePayment);

    expect(result.paidUntil).toEqual(createUTCDate('2025-03-01'));
    expect(result.membershipStatus).toBe('active');
  });

  test('activeMembership_extendsFromPaidUntilDate_successfully', () => {
    const activeMember: Member = {
      ...baseMember,
      paidUntil: createUTCDate('2025-03-01')
    };

    const payment: Payment = {
      ...basePayment,
      monthsCovered: 2
    };

    const result = UpdateMembership(activeMember, payment);

    expect(result.paidUntil).toEqual(createUTCDate('2025-05-01'));
  });

  test('newMember_zeroPaidUntil_extendsFromCurrentDate', () => {
    const newMember: Member = {
      ...baseMember,
      firstName: 'Daenerys',
      lastName: 'Targaryen',
      email: 'daenerys@targaryen.com',
      paidUntil: new Date(0)
    };

    const result = UpdateMembership(newMember, basePayment);

    expect(result.paidUntil).toEqual(createUTCDate('2025-03-01'));
  });

  test('inactiveMember_setsStatusToActive_successfully', () => {
    const inactiveMember: Member = {
      ...baseMember,
      firstName: 'Tyrion',
      lastName: 'Lannister',
      email: 'tyrion@lannister.com',
      membershipStatus: 'inactive'
    };

    const result = UpdateMembership(inactiveMember, basePayment);
    expect(result.membershipStatus).toBe('active');
  });

  test('multipleMonthsPayment_extendsCorrectly_successfully', () => {
    const payment: Payment = {
      ...basePayment,
      monthsCovered: 6
    };

    const result = UpdateMembership(baseMember, payment);

    expect(result.paidUntil).toEqual(createUTCDate('2025-08-01'));
  });

  test('yearBoundaryPayment_handlesYearChange_correctly', () => {
    const member: Member = {
      ...baseMember,
      firstName: 'Cersei',
      lastName: 'Lannister',
      email: 'cersei@lannister.com',
      paidUntil: createUTCDate('2025-11-01')
    };

    const payment: Payment = {
      ...basePayment,
      monthsCovered: 4
    };

    const result = UpdateMembership(member, payment);

    expect(result.paidUntil).toEqual(createUTCDate('2026-03-01'));
  });
});