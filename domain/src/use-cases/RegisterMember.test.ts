import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemberRepository } from '../repositories/MemberRepository';
import { RegisterMemberUseCase } from './RegisterMember';
import { CreateMemberDTO, Member } from '../entities/Member';


describe('RegisterMemberUseCase', () => {
  let memberRepository: MemberRepository;
  let registerMemberUseCase: RegisterMemberUseCase;

  beforeEach(() => {
    memberRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn()
    };
    registerMemberUseCase = new RegisterMemberUseCase(memberRepository);
  });
  
  test('should throw error if member already exists', async () => {
    const memberData: CreateMemberDTO = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      weight: 70,
      age: 25,
      joinDate: new Date()
    };

    const existingMember: Member = {
      id: 'existing-123',
      ...memberData,
      membershipStatus: 'active',
      paidUntil: new Date()
    };

    vi.mocked(memberRepository.findByEmail).mockResolvedValue(existingMember);

    await expect(registerMemberUseCase.execute(memberData)).rejects.toThrow(
      'Member with this email already exists'
    );

    expect(memberRepository.save).not.toHaveBeenCalled();
  });

  test('should register a new member successfully', async () => {
    const memberData: CreateMemberDTO = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      weight: 70,
      age: 25,
      joinDate: new Date()
    };
    
    const savedMember: Member = {
      id: 'member-123',
      ...memberData,
      membershipStatus: 'inactive',
      paidUntil: new Date(0)
    };

    vi.mocked(memberRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(memberRepository.save).mockResolvedValue(savedMember);

    const result = await registerMemberUseCase.execute(memberData);

    expect(memberRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
    expect(memberRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        membershipStatus: 'inactive',
        paidUntil: new Date(0)
      })
    );
    expect(result).toEqual(savedMember);
  });

  test('should set initial status as inactive', async () => {
    const memberData: CreateMemberDTO = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      weight: 60,
      age: 28,
      joinDate: new Date()
    };

    vi.mocked(memberRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(memberRepository.save).mockImplementation(async (member) => member);

    const result = await registerMemberUseCase.execute(memberData);

    expect(result.membershipStatus).toBe('inactive');
    expect(result.paidUntil).toEqual(new Date(0));
  });

  test('should generate unique ID for new member', async () => {
    const memberData: CreateMemberDTO = {
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@example.com',
      weight: 80,
      age: 30,
      joinDate: new Date()
    };

    vi.mocked(memberRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(memberRepository.save).mockImplementation(async (member) => member);

    const result = await registerMemberUseCase.execute(memberData);

    expect(result.id).toBeDefined();
    expect(result.id).toMatch(/^member-\d+-[a-z0-9]+$/);
  });
});