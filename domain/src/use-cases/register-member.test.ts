import { describe, test, expect, beforeEach } from 'vitest';
import { RegisterMember, RegisterMemberDependencies } from './register-member';
import { CreateMemberDTO, Member } from '../entities/Member';
import { MockedMemberRepository, mockMemberRepository } from '../mocks/member-repository-mock';
import { createInvalidDataError } from '../errors/error';
import { INITIAL_PAID_UNTIL } from '../utils/date';


describe('RegisterMember Use Case', () => {
  let repo: MockedMemberRepository;
  let deps: RegisterMemberDependencies;

  beforeEach(() => {
    repo = mockMemberRepository([]);
    deps = { members: repo };
  });

  test('Email_alreadyInUse_ThrowError', async () => {
    const existing: CreateMemberDTO = {
      firstName: 'Existing',
      lastName: 'Member',
      email: 'exists@test.com',
      weight: 70,
      age: 25,
      joinDate: new Date(),
    };

    await RegisterMember(deps, existing);

    console.log('Attempting duplicate registration');
    const result = await RegisterMember(deps, existing);
    console.log('Result:', result);

    expect(result).toEqual(createInvalidDataError('Email already in use'));
  });

  test('emptyFirstName_fails_withInvalidData', async () => {
    const dto: CreateMemberDTO = {
      firstName: '',
      lastName: 'Snow',
      email: 'jon@snow.com',
      weight: 80,
      age: 30,
      joinDate: new Date(),
    };

    console.log('Attempting registration with empty first name');
    const result = await RegisterMember(deps, dto);
    console.log('Validation result:', result);
    expect(result).toEqual(createInvalidDataError('First name must not be empty'));
  });

  test('emptyLastName_fails_withInvalidData', async () => {
    const dto: CreateMemberDTO = {
      firstName: 'Jon',
      lastName: '',
      email: 'jon@snow.com',
      weight: 80,
      age: 28,
      joinDate: new Date(),
    };
    const result = await RegisterMember(deps, dto);
    expect(result).toEqual(createInvalidDataError('Last name must not be empty'));
  });

  test('emptyEmail_fails_withInvalidData', async () => {
    const dto: CreateMemberDTO = {
      firstName: 'John',
      lastName: 'Snow',
      email: '',
      weight: 80,
      age: 28,
      joinDate: new Date(),
    };
    const result = await RegisterMember(deps, dto);
    expect(result).toEqual(createInvalidDataError('Email must not be empty'));
  });

  test('negtiveAge_fails_withInvalidData', async () => {
    const dto: CreateMemberDTO = {
      firstName: 'Jon',
      lastName: 'Snow',
      email: 'jon@snow.com',
      weight: 80,
      age: 0,
      joinDate: new Date(),
    };
    const result = await RegisterMember(deps, dto);
    expect(result).toEqual(createInvalidDataError('Age must be positive'));
  });

  test('negativeWeight_fails_withInvalidData', async () => {
    const dto: CreateMemberDTO = {
      firstName: 'Jon',
      lastName: 'Snow',
      email: 'jon@snow.com',
      weight: -10,
      age: 28,
      joinDate: new Date(),
    };
    const result = await RegisterMember(deps, dto);
    expect(result).toEqual(createInvalidDataError('Weight must be positive'));
  });

  test('validData_registers_successfully', async () => {
    const dto: CreateMemberDTO = {
      firstName: 'Jhon',
      lastName: 'Snow',
      email: 'Juan@Nieve.com',
      weight: 80,
      age: 28,
      joinDate: new Date('2025-07-01'),
    };

    const result = await RegisterMember(deps, dto);

    expect(result).toMatchObject({
      firstName: 'Jhon',
      lastName: 'Snow',
      email: 'Juan@Nieve.com',
      membershipStatus: 'inactive',
      paidUntil: INITIAL_PAID_UNTIL,
    });

    const stored = await repo.findByEmail('Juan@Nieve.com');
    expect(stored).toEqual(result);
  });

  test('memberId_isGeneratedCorrectly', async () => {
    const dto: CreateMemberDTO = {
      firstName: 'Arya',
      lastName: 'Stark',
      email: 'arya@stark.com',
      weight: 60,
      age: 18,
      joinDate: new Date('2025-07-26'),
    };

    const result = await RegisterMember(deps, dto);
    console.log('Generated member ID:', (result as Member).id);

    // Type guard to ensure it's a Member
    if ('id' in result) {
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
    }

    // Verify that the generated ID matches the stored one
    const stored = await repo.findByEmail('arya@stark.com');
    expect(stored?.id).toBeDefined();
    expect(stored?.id).toBe((result as Member).id);
  });

  test('newMember_RegisteredWith_InactiveMembershipStatus', async () => {
    const dto: CreateMemberDTO = {
      firstName: 'Daenerys',
      lastName: 'Targaryen',
      email: 'dragonmother@example.com',
      weight: 65,
      age: 25,
      joinDate: new Date('2025-07-27'),
    };

    const result = await RegisterMember(deps, dto);

    expect(result).toMatchObject({
      membershipStatus: 'inactive'
    });

    console.log('Checking stored membership status in repository');
    const stored = await repo.findByEmail('dragonmother@example.com');
    console.log('Stored membershipStatus:', stored?.membershipStatus);
    expect(stored?.membershipStatus).toBe('inactive');
  });

  test('newMember_Registered_whitPaidUntil_INITIAL_PAID_UNTIL', async () => {
    const dto: CreateMemberDTO = {
      firstName: 'jon',
      lastName: 'Snow',
      email: 'Juan@Nieve.com',
      weight: 80,
      age: 28,
      joinDate: new Date(),
    };

    const result = await RegisterMember(deps, dto);

    expect(result).toMatchObject({
      paidUntil: INITIAL_PAID_UNTIL
    });

    // expect(result.paidUntil instanceof Date).toBe(true);
    if ('paidUntil' in result) { // Type Guard
      expect(result.paidUntil instanceof Date).toBe(true);
      expect(result.paidUntil.getTime()).toBe(0);
    }

    const stored = await repo.findByEmail('Juan@Nieve.com');
    expect(stored?.paidUntil).toEqual(INITIAL_PAID_UNTIL);
  });
});