import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { VerifyMembershipStatus, VerifyMembershipStatusDependencies, calculateMembershipStatus } from './verify-membership-status';
import { MockedMemberRepository, mockMemberRepository } from '../../mocks/member-repository-mock';
import { MockedSystemConfigRepository, mockSystemConfigRepository } from '../../mocks/system-config-mock';
import { SystemConfig } from '../../entities/SystemConfig';
import { Member } from '../../entities/Member';
import { INITIAL_PAID_UNTIL } from '../../utils/date';
import { createInvalidDataError, InvalidDataError } from '../../errors/error';

describe('VerifyMembershipStatus Use Case', () => {
    let memberRepo: MockedMemberRepository;
    let systemConfigRepo: MockedSystemConfigRepository;
    let deps: VerifyMembershipStatusDependencies;
    let defaultConfig: SystemConfig;
    let baseMember: Member;

    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2025-01-25'));
        defaultConfig = {
            basePrice: 100,
            gracePeriodDays: 10,
            suspensionMonths: 3,
            updatedAt: new Date(),
            updatedBy: 'admin'
        };

         baseMember = {
            id: 'member-1',
            firstName: 'Jon',
            lastName: 'Snow',
            email: 'jon@snow.com',
            weight: 70,
            age: 30,
            joinDate: new Date(),
            membershipStatus: 'active' as const,
            paidUntil: new Date()
        };

        memberRepo = mockMemberRepository([]);
        systemConfigRepo = mockSystemConfigRepository(defaultConfig);
        deps = { members: memberRepo, systemConfig: systemConfigRepo };
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // Type guard for InvalidDataError
    function isInvalidDataError(error: unknown): error is InvalidDataError {
        return (error as InvalidDataError).type === 'InvalidData';
    }

    test('emptyMemberId_attemptVerification_returnsInvalidDataError', async () => {
        const result = await VerifyMembershipStatus(deps, '');

        expect(isInvalidDataError(result)).toBe(true);
        expect(result).toEqual(createInvalidDataError("Member ID must not be empty"));
    });

    test('nonexistentMember_attemptVerification_returnsInvalidDataError', async () => {
        const result = await VerifyMembershipStatus(deps, 'non-existent-member');

        expect(isInvalidDataError(result)).toBe(true);
        expect(result).toEqual(createInvalidDataError("Member not found"));
    });

    test('memberWithInitialPaidUntil_attemptVerification_returnsInactiveStatus', async () => {
        const member: Member = {
            ...baseMember,
            paidUntil: INITIAL_PAID_UNTIL
        };

        memberRepo = mockMemberRepository([member]);
        deps = { members: memberRepo, systemConfig: systemConfigRepo };

        const result = await VerifyMembershipStatus(deps, 'member-1');

        if (isInvalidDataError(result)) {
            throw new Error('Expected Member but got InvalidDataError');
        }

        expect(result.membershipStatus).toBe('inactive');
    });

    test('memberWithValidPayment_attemptVerification_returnsActiveStatus', async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 15); // 15 days in future

        const member: Member = {
           ...baseMember,
            membershipStatus: 'inactive',
            paidUntil: futureDate
        };

        memberRepo = mockMemberRepository([member]);
        deps = { members: memberRepo, systemConfig: systemConfigRepo };

        const result = await VerifyMembershipStatus(deps, 'member-1');

        if (isInvalidDataError(result)) {
            throw new Error('Expected Member but got InvalidDataError');
        }

        expect(result.membershipStatus).toBe('active');
    });

    test('memberWithExpiredPayment_attemptVerification_returnsInactiveStatus', async () => {
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() - 5); // 5 days ago (within grace period)

        const member: Member = {
            ...baseMember,
            paidUntil: expiredDate
        };

        memberRepo = mockMemberRepository([member]);
        deps = { members: memberRepo, systemConfig: systemConfigRepo };

        const result = await VerifyMembershipStatus(deps, 'member-1');

        if (isInvalidDataError(result)) {
            throw new Error('Expected Member but got InvalidDataError');
        }

        expect(result.membershipStatus).toBe('inactive');
    });

    test('memberWithExpiredPaymentBeyondGrace_attemptVerification_returnsInactiveStatus', async () => {
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() - 20); // 20 days ago (beyond grace period)

        const member: Member = {
           ...baseMember,
            paidUntil: expiredDate
        };

        memberRepo = mockMemberRepository([member]);
        deps = { members: memberRepo, systemConfig: systemConfigRepo };

        const result = await VerifyMembershipStatus(deps, 'member-1');

        if (isInvalidDataError(result)) {
            throw new Error('Expected Member but got InvalidDataError');
        }
        expect(result.membershipStatus).toBe('inactive');
    });

    test('memberWithLongExpiredPayment_attemptVerification_returnsSuspendedStatus', async () => {
        const longExpiredDate = new Date();
        longExpiredDate.setMonth(longExpiredDate.getMonth() - 4); // 4 months ago

        const member: Member = {
            ...baseMember,
            membershipStatus: 'inactive',
            paidUntil: longExpiredDate
        };

        memberRepo = mockMemberRepository([member]);
        deps = { members: memberRepo, systemConfig: systemConfigRepo };

        const result = await VerifyMembershipStatus(deps, 'member-1');

        if (isInvalidDataError(result)) {
            throw new Error('Expected Member but got InvalidDataError');
        }

        expect(result.membershipStatus).toBe('suspended');
    });

    test('memberStatusChanged_attemptVerification_updatesInRepository', async () => {
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() - 20); // Beyond grace period

        const member: Member = {
            ...baseMember,
            membershipStatus: 'active', // Currently active but should be inactive
            paidUntil: expiredDate
        };

        memberRepo = mockMemberRepository([member]);
        deps = { members: memberRepo, systemConfig: systemConfigRepo };
        const updateSpy = vi.spyOn(memberRepo, 'update');

        const result = await VerifyMembershipStatus(deps, 'member-1');

        if (isInvalidDataError(result)) {
            throw new Error('Expected Member but got InvalidDataError');
        }

        expect(result.membershipStatus).toBe('inactive');
        expect(updateSpy).toHaveBeenCalledTimes(1);
        expect(updateSpy).toHaveBeenCalledWith('member-1', expect.objectContaining({
            membershipStatus: 'inactive'
        }));
    });

    test('memberStatusUnchanged_attemptVerification_doesNotUpdateRepository', async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 15);

        const member: Member = {
           ...baseMember,
            membershipStatus: 'active', // Already active and should remain active
            paidUntil: futureDate
        };

        memberRepo = mockMemberRepository([member]);
        deps = { members: memberRepo, systemConfig: systemConfigRepo };
        const saveSpy = vi.spyOn(memberRepo, 'save');

        const result = await VerifyMembershipStatus(deps, 'member-1');

        if (isInvalidDataError(result)) {
            throw new Error('Expected Member but got InvalidDataError');
        }

        expect(result.membershipStatus).toBe('active');
        expect(saveSpy).not.toHaveBeenCalled();
    });
});

describe('calculateMembershipStatus helper function', () => {
    let config: SystemConfig;
    let baseMember: Member;

    beforeEach(() => {
        config = {
            basePrice: 100,
            gracePeriodDays: 10,
            suspensionMonths: 3,
            updatedAt: new Date(),
            updatedBy: 'admin'
        };
    });

    baseMember = {
            id: 'member-1',
            firstName: 'Jon',
            lastName: 'Snow',
            email: 'jon@snow.com',
            weight: 70,
            age: 30,
            joinDate: new Date(),
            membershipStatus: 'active' as const,
            paidUntil: new Date() 
        };

     test('memberWithInitialPaidUntil_calculate_returnsInactive', () => {
        const member = {
            ...baseMember,
            paidUntil: INITIAL_PAID_UNTIL
        };

        const result = calculateMembershipStatus(member, config);
        expect(result.membershipStatus).toBe('inactive');
    });

    test('memberWithFuturePayment_calculate_returnsActive', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 20);

        const member = {
            ...baseMember,
            membershipStatus: 'inactive' as const, // Starting as inactive
            paidUntil: futureDate
        };

        const result = calculateMembershipStatus(member, config);
        expect(result.membershipStatus).toBe('active');
    });

    test('memberWithExpiredPaymentInGracePeriod_calculate_returnsInactive', () => {
        const today = new Date('2025-01-15');
        const expiredDate = new Date('2025-01-10'); // 5 days ago

        const member = {
            ...baseMember,
            membershipStatus: 'inactive' as const,
            paidUntil: expiredDate
        };

        const result = calculateMembershipStatus(member, config, today);
        expect(result.membershipStatus).toBe('inactive');
    });

    test('memberWithExpiredPaymentBeyondGrace_calculate_returnsInactive', () => {
        const today = new Date('2025-01-25');
        const expiredDate = new Date('2025-01-10'); // 15 days ago

        const member = {
            ...baseMember,
            paidUntil: expiredDate
        };

        const result = calculateMembershipStatus(member, config, today);
        expect(result.membershipStatus).toBe('inactive');
    });

    test('memberWithLongExpiredPayment_calculate_returnsSuspended', () => {
        const today = new Date('2025-05-01');
        const expiredDate = new Date('2025-01-01'); // 4 months ago

        const member = {
            ...baseMember,
            paidUntil: expiredDate
        };

        const result = calculateMembershipStatus(member, config, today);
        expect(result.membershipStatus).toBe('suspended');
    });

    // --- Tests de período de gracia mensual (hasta día 10) ---

    test('previousMonthPayment_beforeGraceDate_returnsActive', () => {
        const paidUntil = new Date(Date.UTC(2025, 0, 31)); // 31 Ene 2025
        const today = new Date(Date.UTC(2025, 1, 5));      // 5 Feb 2025 (dentro del período de gracia)

        const member = { ...baseMember, paidUntil };
        const result = calculateMembershipStatus(member, config, today);
        expect(result.membershipStatus).toBe('active');
    });

    test('previousMonthPayment_onGraceDateLimit_returnsActive', () => {
        const paidUntil = new Date(Date.UTC(2025, 0, 31)); // 31 Ene 2025
        const today = new Date(Date.UTC(2025, 1, 10));     // 10 Feb 2025 (límite del período de gracia)

        const member = { ...baseMember, paidUntil };
        const result = calculateMembershipStatus(member, config, today);
        expect(result.membershipStatus).toBe('active');
    });

    test('previousMonthPayment_afterGraceDate_returnsInactive', () => {
        const paidUntil = new Date(Date.UTC(2025, 0, 31)); // 31 Ene 2025
        const today = new Date(Date.UTC(2025, 1, 11));     // 11 Feb 2025 (fuera del período de gracia)

        const member = { ...baseMember, paidUntil };
        const result = calculateMembershipStatus(member, config, today);
        expect(result.membershipStatus).toBe('inactive');
    });
});