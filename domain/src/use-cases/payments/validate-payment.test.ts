import { describe, test, expect, beforeEach, vi } from 'vitest';
import { MockedMemberRepository, mockMemberRepository } from '../../mocks/member-repository-mock';
import { MockedPaymentRepository, mockPaymentRepository } from '../../mocks/payment-repository-mock';
import { CreatePaymentDTO } from '../../entities/Payment';
import { ValidatePayment } from './validate-payment';
import { createInvalidDataError } from '../../errors/error';
import { ProcessPayment } from './process-payment';

describe('ValidatePayment Use Case', () => {
    let memberRepo: MockedMemberRepository;
    let paymentRepo: MockedPaymentRepository;
    let validDTO: CreatePaymentDTO;

    beforeEach(() => {
        // Create an active member with expired payment
        const paidUntil = new Date();
        paidUntil.setMonth(paidUntil.getMonth() - 1); // Make payment expired

        memberRepo = mockMemberRepository([{
            id: 'member-1',
            firstName: 'Jon',
            lastName: 'Snow',
            email: 'jon@snow.com',
            weight: 70,
            age: 30,
            joinDate: new Date(),
            membershipStatus: 'active',
            paidUntil
        }]);

        paymentRepo = mockPaymentRepository([]);

        validDTO = {
            memberId: 'member-1',
            amount: 100,
            monthsCovered: 1,
            paymentMethod: 'mercadopago_transfer',
            paymentDate: new Date(),
            isProportional: false,
            hasPromotion: false
        };
    });

    test('emptyMemberId_attemptValidation_failsWithValidationError', async () => {
        const invalidDTO: CreatePaymentDTO = {
            ...validDTO,
            memberId: ''
        };

        const result = await ValidatePayment(invalidDTO, memberRepo, paymentRepo);

        expect(result).toEqual(createInvalidDataError('Member ID must not be empty'));
    });

    test('nonPositiveAmount_attemptValidation_failsWithValidationError', async () => {
        const invalidDTO: CreatePaymentDTO = {
            ...validDTO,
            amount: 0
        };

        const result = await ValidatePayment(invalidDTO, memberRepo, paymentRepo);

        expect(result).toEqual(createInvalidDataError('Amount must be positive'));
    });

    test('nonPositiveMonthsCovered_attemptValidation_failsWithValidationError', async () => {
        const invalidDTO: CreatePaymentDTO = {
            ...validDTO,
            monthsCovered: 0
        };

        const result = await ValidatePayment(invalidDTO, memberRepo, paymentRepo);

        expect(result).toEqual(createInvalidDataError('Months covered must be positive'));
    });

    test('missingPaymentMethod_attemptValidation_failsWithValidationError', async () => {
        const invalidDTO: CreatePaymentDTO = {
            ...validDTO,
            paymentMethod: ''
        } as any;

        const result = await ValidatePayment(invalidDTO, memberRepo, paymentRepo);

        expect(result).toEqual(createInvalidDataError('Payment method is required'));
    });

    test('nonexistentMember_attemptValidation_failsWithValidationError', async () => {
        const invalidDTO: CreatePaymentDTO = {
            ...validDTO,
            memberId: 'non-existent-member'
        };

        const result = await ValidatePayment(invalidDTO, memberRepo, paymentRepo);

        expect(result).toEqual(createInvalidDataError('Member not found'));
    });

    test('duplicatePaymentForMonth_attemptValidation_failsWithValidationError', async () => {
        const firstPayment = await ProcessPayment(
            { payments: paymentRepo, members: memberRepo },
            validDTO
        );

        if ('message' in firstPayment) throw new Error('First payment should have succeeded');

        const secondPayment = await ProcessPayment(
            { payments: paymentRepo, members: memberRepo },
            validDTO
        );
        expect(secondPayment).toEqual(createInvalidDataError('Member already paid for this month'));
    });

    test('validPaymentData_attemptValidation_succeeds', async () => {
        //const result = await ValidatePayment(validDTO, memberRepo, paymentRepo);
        //expect(result).toBeUndefined();
        const findByIdSpy = vi.spyOn(memberRepo, 'findById');
        const findByMemberIdAndMonthSpy = vi.spyOn(paymentRepo, 'findByMemberIdAndMonth');

        const validPaymentData: CreatePaymentDTO = {
            ...validDTO,
            paymentMethod: 'cash',
            paymentDate: new Date('2023-01-15')
        };

        const validationResult = await ValidatePayment(validPaymentData, memberRepo, paymentRepo);

        expect(validationResult).toBeUndefined();
        expect(findByIdSpy).toHaveBeenCalledWith(validPaymentData.memberId);
        expect(findByMemberIdAndMonthSpy).toHaveBeenCalled();

        findByIdSpy.mockRestore();
        findByMemberIdAndMonthSpy.mockRestore();
    });
});