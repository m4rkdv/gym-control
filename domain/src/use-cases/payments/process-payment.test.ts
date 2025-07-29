import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { ProcessPayment } from './process-payment';
import { CreatePaymentDTO, Payment } from '../../entities/Payment';
import { MockedMemberRepository, mockMemberRepository } from '../../mocks/member-repository-mock';
import { MockedPaymentRepository, mockPaymentRepository } from '../../mocks/payment-repository-mock';
import { createInvalidDataError } from '../../errors/error';
import { Member } from '../../entities/Member';

describe('ProcessPayment Use Case', () => {
  let memberRepo: MockedMemberRepository;
  let paymentRepo: MockedPaymentRepository;
  let deps: { payments: MockedPaymentRepository; members: MockedMemberRepository };
  let validPaymentDTO: CreatePaymentDTO;
  let testMember: Member;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2025-01-15'));
    // Configurar mocks y datos de prueba
    testMember = {
      id: 'member-1',
      firstName: 'Jon',
      lastName: 'Snow',
      email: 'jon@snow.com',
      weight: 80,
      age: 25,
      joinDate: new Date('2020-01-01'),
      membershipStatus: 'active',
      paidUntil: new Date('2025-01-01')
    };

    memberRepo = mockMemberRepository([testMember]);
    paymentRepo = mockPaymentRepository([]);
    deps = { payments: paymentRepo, members: memberRepo };

    validPaymentDTO = {
      memberId: 'member-1',
      amount: 5000,
      paymentMethod: 'cash',
      paymentDate: new Date('2025-01-15'),
      monthsCovered: 1,
      isProportional: false,
      hasPromotion: false
    };

    // Mockear crypto.randomUUID para tests predecibles
    vi.stubGlobal('crypto', {
      randomUUID: () => 'mock-payment-id'
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  test('invalidPaymentData_fails_withValidationError', async () => {
    const invalidDTO: CreatePaymentDTO = {
      ...validPaymentDTO,
      memberId: ''
    };

    const result = await ProcessPayment(deps, invalidDTO);
    expect(result).toEqual(createInvalidDataError('Member ID must not be empty'));
  });

  test('nonexistentMember_fails_withValidationError', async () => {
    const nonExistentDTO: CreatePaymentDTO = {
      ...validPaymentDTO,
      memberId: 'non-existent-id'
    };

    const result = await ProcessPayment(deps, nonExistentDTO);
    expect(result).toEqual(createInvalidDataError('Member not found'));
  });

  test('validPayment_createsPayment_withUUID', async () => {
    vi.unstubAllGlobals();
    const result = await ProcessPayment(deps, validPaymentDTO);

    if ('message' in result) throw new Error('Expected successful payment');

    expect(result.payment.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    console.log("validPayment generatedID =", result.payment.id);
  });

  test('validPayment_updatesMembership_Correctly', async () => {
    const result = await ProcessPayment(deps, validPaymentDTO);

    if ('message' in result) throw new Error('Expected successful payment');

    expect(result.updatedMember.membershipStatus).toBe('active');
    expect(result.updatedMember.paidUntil).toBeInstanceOf(Date);
    
    const expectedDate = new Date('2025-01-15'); 
    expectedDate.setUTCMonth(expectedDate.getUTCMonth() + 1);
    expectedDate.setUTCHours(0, 0, 0, 0);
    expect(result.updatedMember.paidUntil).toEqual(expectedDate);
  });

  test('validData_paymentAndMember_storedCorrectly', async () => {
    const result = await ProcessPayment(deps, validPaymentDTO);

    if ('message' in result) throw new Error('Expected successful payment');

    const memberPayments = await paymentRepo.findByMemberId(result.payment.memberId);
    expect(memberPayments).toContainEqual(result.payment);

    const storedMember = await memberRepo.findById(result.updatedMember.id);
    expect(storedMember).toEqual(result.updatedMember);
  });

  test('validPayment_processPayment_returnsPaymentAndUpdatedMember', async () => {
    const result = await ProcessPayment(deps, validPaymentDTO);

    if ('message' in result) throw new Error('Expected successful payment');

    expect(result).toHaveProperty('payment');
    expect(result).toHaveProperty('updatedMember');
    expect(result.payment.memberId).toBe(result.updatedMember.id);
  });

  test('newMember_startsMembership_fromPaymentDate', async () => {
    const newMember: Member = {
      ...testMember,
      id: 'member-2',
      paidUntil: new Date(0)
    };
    memberRepo.members.push(newMember);

    const paymentDTO: CreatePaymentDTO = {
      ...validPaymentDTO,
      memberId: 'member-2',
    };

    const result = await ProcessPayment(deps, paymentDTO);

    if ('message' in result) throw new Error('Expected successful payment');

    const expectedDate = new Date('2025-01-15'); 
    expectedDate.setUTCMonth(expectedDate.getUTCMonth() + 1);
    expectedDate.setUTCHours(0, 0, 0, 0);
    expect(result.updatedMember.paidUntil).toEqual(expectedDate);
  });
});