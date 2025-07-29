// use-cases/change-member-status.test.ts
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ChangeMemberStatus, ChangeMemberStatusDependencies, ChangeMemberStatusRequest } from './change-member-status';
import { MockedMemberRepository, mockMemberRepository } from '../../mocks/member-repository-mock';
import { MockedUserRepository, mockUserRepository } from '../../mocks/user-repository-mock';
import { Member } from '../../entities/Member';
import { User } from '../../entities/User';
import { createInvalidDataError, InvalidDataError } from '../../errors/error';

describe('ChangeMemberStatus Use Case', () => {
  let memberRepo: MockedMemberRepository;
  let userRepo: MockedUserRepository;
  let deps: ChangeMemberStatusDependencies;
  let baseMember: Member;
  let trainerUser: User;
  let adminUser: User;
  let memberUser: User;

  beforeEach(() => {
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

    trainerUser = {
      id: 'trainer-user-1',
      userName: 'coach-arya',
      password: 'password123',
      role: 'trainer',
      trainerId: 'trainer-1',
      createdAt: new Date(),
      isActive: true
    };

    adminUser = {
      id: 'admin-user-1',
      userName: 'admin',
      password: 'admin123',
      role: 'admin',
      createdAt: new Date(),
      isActive: true
    };

    memberUser = {
      id: 'member-user-1',
      userName: 'jon@snow.com',
      password: 'password123',
      role: 'member',
      memberId: 'member-1',
      createdAt: new Date(),
      isActive: true
    };

    memberRepo = mockMemberRepository([baseMember]);
    userRepo = mockUserRepository([trainerUser, adminUser, memberUser]);
    deps = { members: memberRepo, users: userRepo };
  });

  // Type guard for InvalidDataError
  function isInvalidDataError(error: unknown): error is InvalidDataError {
    return (error as InvalidDataError).type === 'InvalidData';
  }

  test('EmptyMemberId_ChangingStatus_ReturnsInvalidDataError', async () => {
    const request: ChangeMemberStatusRequest = {
      memberId: '',
      newStatus: 'inactive',
      requestedByUserId: 'trainer-user-1'
    };

    const result = await ChangeMemberStatus(deps, request);
    expect(isInvalidDataError(result)).toBe(true);
    expect(result).toEqual(createInvalidDataError("Member ID must not be empty"));
  });

  test('EmptyNewStatus_ChangingStatus_ReturnsInvalidDataError', async () => {
    const request = {
      memberId: 'member-1',
      newStatus: '',
      requestedByUserId: 'trainer-user-1'
    } as unknown as ChangeMemberStatusRequest;

    const result = await ChangeMemberStatus(deps, request);
    expect(isInvalidDataError(result)).toBe(true);
    expect(result).toEqual(createInvalidDataError("New status is required"));
  });

  test('EmptyRequestingUserId_ChangingStatus_ReturnsInvalidDataError', async () => {
    const request: ChangeMemberStatusRequest = {
      memberId: 'member-1',
      newStatus: 'inactive',
      requestedByUserId: ''
    };

    const result = await ChangeMemberStatus(deps, request);
    expect(isInvalidDataError(result)).toBe(true);
    expect(result).toEqual(createInvalidDataError("Requesting user ID is required"));
  });

  test('NonexistentMember_ChangingStatus_ReturnsInvalidDataError', async () => {
    const request: ChangeMemberStatusRequest = {
      memberId: 'non-existent-member',
      newStatus: 'inactive',
      requestedByUserId: 'trainer-user-1'
    };

    const result = await ChangeMemberStatus(deps, request);
    expect(isInvalidDataError(result)).toBe(true);
    expect(result).toEqual(createInvalidDataError("Member not found"));
  });

  test('NonexistentRequestingUser_ChangingStatus_ReturnsInvalidDataError', async () => {
    const request: ChangeMemberStatusRequest = {
      memberId: 'member-1',
      newStatus: 'inactive',
      requestedByUserId: 'non-existent-user'
    };

    const result = await ChangeMemberStatus(deps, request);
    expect(isInvalidDataError(result)).toBe(true);
    expect(result).toEqual(createInvalidDataError("Requesting user not found"));
  });

  test('InactiveRequestingUser_ChangingStatus_ReturnsInvalidDataError', async () => {
    const inactiveUser = {
      ...trainerUser,
      isActive: false
    };
    userRepo = mockUserRepository([inactiveUser, adminUser, memberUser]);
    deps = { members: memberRepo, users: userRepo };

    const request: ChangeMemberStatusRequest = {
      memberId: 'member-1',
      newStatus: 'inactive',
      requestedByUserId: 'trainer-user-1'
    };

    const result = await ChangeMemberStatus(deps, request);
    expect(isInvalidDataError(result)).toBe(true);
    expect(result).toEqual(createInvalidDataError("Requesting user is not active"));
  });

  test('SameCurrentStatus_ChangingStatus_ReturnsInvalidDataError', async () => {
    const request: ChangeMemberStatusRequest = {
      memberId: 'member-1',
      newStatus: 'active',
      requestedByUserId: 'trainer-user-1'
    };

    const result = await ChangeMemberStatus(deps, request);
    expect(isInvalidDataError(result)).toBe(true);
    expect(result).toEqual(createInvalidDataError("Member already has this status"));
  });

  test('DeletedMember_ChangingStatus_ReturnsInvalidDataError', async () => {
    const deletedMember = {
      ...baseMember,
      membershipStatus: 'deleted' as const
    };
    memberRepo = mockMemberRepository([deletedMember]);
    deps = { members: memberRepo, users: userRepo };

    const request: ChangeMemberStatusRequest = {
      memberId: 'member-1',
      newStatus: 'active',
      requestedByUserId: 'admin-user-1'
    };

    const result = await ChangeMemberStatus(deps, request);
    expect(isInvalidDataError(result)).toBe(true);
    expect(result).toEqual(createInvalidDataError("Cannot change status of deleted member"));
  });

  test('MemberRole_ChangingStatus_ReturnsInvalidDataError', async () => {
    const request: ChangeMemberStatusRequest = {
      memberId: 'member-1',
      newStatus: 'inactive',
      requestedByUserId: 'member-user-1'
    };

    const result = await ChangeMemberStatus(deps, request);
    expect(isInvalidDataError(result)).toBe(true);
    expect(result).toEqual(createInvalidDataError("Insufficient permissions to change member status"));
  });

  test('TrainerRole_ChangingToDeleted_ReturnsInvalidDataError', async () => {
    const request: ChangeMemberStatusRequest = {
      memberId: 'member-1',
      newStatus: 'deleted',
      requestedByUserId: 'trainer-user-1'
    };

    const result = await ChangeMemberStatus(deps, request);
    expect(isInvalidDataError(result)).toBe(true);
    expect(result).toEqual(createInvalidDataError("Unauthorized status change"));
  });

  test('AdminRole_ChangingToDeleted_UpdatesStatus', async () => {
    const request: ChangeMemberStatusRequest = {
      memberId: 'member-1',
      newStatus: 'deleted',
      requestedByUserId: 'admin-user-1'
    };

    const saveSpy = vi.spyOn(memberRepo, 'save');
    const result = await ChangeMemberStatus(deps, request);

    if (isInvalidDataError(result)) {
      throw new Error('Expected Member but got InvalidDataError');
    }

    expect(result.membershipStatus).toBe('deleted');
    expect(saveSpy).toHaveBeenCalledTimes(1);
  });

  test('TrainerRole_ChangingStatusToInactive_UpdatesStatus', async () => {
    const request: ChangeMemberStatusRequest = {
      memberId: 'member-1',
      newStatus: 'inactive',
      requestedByUserId: 'trainer-user-1'
    };

    const saveSpy = vi.spyOn(memberRepo, 'save');
    const result = await ChangeMemberStatus(deps, request);

    if (isInvalidDataError(result)) {
      throw new Error('Expected Member but got InvalidDataError');
    }

    expect(result.membershipStatus).toBe('inactive');
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
      id: 'member-1',
      membershipStatus: 'inactive'
    }));
  });

  test('AdminRole_ChangingStatusToSuspended_UpdatesStatus', async () => {
    const request: ChangeMemberStatusRequest = {
      memberId: 'member-1',
      newStatus: 'suspended',
      requestedByUserId: 'admin-user-1'
    };

    const result = await ChangeMemberStatus(deps, request);

    if (isInvalidDataError(result)) {
      throw new Error('Expected Member but got InvalidDataError');
    }

    expect(result.membershipStatus).toBe('suspended');
  });

  test('ValidRequestWithReason_ChangingStatus_UpdatesMember', async () => {
    const request: ChangeMemberStatusRequest = {
      memberId: 'member-1',
      newStatus: 'inactive',
      requestedByUserId: 'trainer-user-1',
      reason: 'Payment overdue'
    };

    const result = await ChangeMemberStatus(deps, request);

    if (isInvalidDataError(result)) {
      throw new Error('Expected Member but got InvalidDataError');
    }

    expect(result.membershipStatus).toBe('inactive');
  });
});