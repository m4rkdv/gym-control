import { describe, test, expect, beforeEach } from 'vitest';
import { MockedUserRepository, mockUserRepository } from '../../mocks/user-repository-mock';
import { User } from '../../entities/User';
import { createInvalidDataError, InvalidDataError } from '../../errors/error';
import { AuthenticateUser, AuthenticateUserDependencies, LoginRequest } from './auth-user';
import bcrypt from 'bcrypt';

describe('AuthenticateUser Use Case', () => {
  let userRepo: MockedUserRepository;
  let deps: AuthenticateUserDependencies;
  let activeUser: User;
  let inactiveUser: User;

  beforeEach(async () => {
    const hash1 = await bcrypt.hash('password123', 10);
    const hash2 = await bcrypt.hash('winterIsComing', 10);

    activeUser = {
      id: 'user-1',
      userName: 'coach-arya',
      password: hash1,
      role: 'trainer',
      trainerId: 'trainer-1',
      createdAt: new Date(),
      isActive: true
    };

    inactiveUser = {
      id: 'user-2',
      userName: 'jon@snow.com',
      password: hash2,
      role: 'member',
      memberId: 'member-1',
      createdAt: new Date(),
      isActive: false
    };

    userRepo = mockUserRepository([activeUser, inactiveUser]);
    deps = { users: userRepo };
  });

  // Type guard for InvalidDataError
  function isInvalidDataError(error: unknown): error is InvalidDataError {
    return (error as InvalidDataError).type === 'InvalidData';
  }

  test('EmptyUsername_AttemptAuthentication_ReturnsInvalidDataError', async () => {
    const credentials: LoginRequest = {
      userName: '',
      password: 'password123'
    };

    const result = await AuthenticateUser(deps, credentials);
    expect(isInvalidDataError(result)).toBe(true);
    expect(result).toEqual(createInvalidDataError("Username must not be empty"));
  });

  test('EmptyPassword_AttemptAuthentication_ReturnsInvalidDataError', async () => {
    const credentials: LoginRequest = {
      userName: 'coach-arya',
      password: ''
    };

    const result = await AuthenticateUser(deps, credentials);
    expect(isInvalidDataError(result)).toBe(true);
    expect(result).toEqual(createInvalidDataError("Password must not be empty"));
  });

  test('NonexistentUser_AttemptAuthentication_ReturnsInvalidDataError', async () => {
    const credentials: LoginRequest = {
      userName: 'nonexistent@user.com',
      password: 'password123'
    };

    const result = await AuthenticateUser(deps, credentials);
    expect(isInvalidDataError(result)).toBe(true);
    expect(result).toEqual(createInvalidDataError("Invalid credentials"));
  });

  test('InactiveUser_AttemptAuthentication_ReturnsInvalidDataError', async () => {
    const credentials: LoginRequest = {
      userName: 'jon@snow.com',
      password: 'winterIsComing'
    };

    const result = await AuthenticateUser(deps, credentials);
    expect(isInvalidDataError(result)).toBe(true);
    expect(result).toEqual(createInvalidDataError("User account is inactive"));
  });

  test('WrongPassword_AttemptAuthentication_ReturnsInvalidDataError', async () => {
    const credentials: LoginRequest = {
      userName: 'coach-arya',
      password: 'wrongPassword'
    };

    const result = await AuthenticateUser(deps, credentials);
    expect(isInvalidDataError(result)).toBe(true);
    expect(result).toEqual(createInvalidDataError("Invalid credentials"));
  });

  test('ValidCredentials_AttemptAuthentication_ReturnsAuthenticatedUser', async () => {
    const credentials: LoginRequest = {
      userName: 'coach-arya',
      password: 'password123'
    };

    const result = await AuthenticateUser(deps, credentials);

    if (isInvalidDataError(result)) {
      throw new Error('Expected AuthenticationResult but got InvalidDataError');
    }

    expect(result.isAuthenticated).toBe(true);
    expect(result.user).toMatchObject({
      id: 'user-1',
      userName: 'coach-arya',
      role: 'trainer',
      trainerId: 'trainer-1',
      isActive: true
    });

    // Verify password is not included in response
    expect('password' in result.user).toBe(false);
  });

  test('ValidMemberCredentials_AttemptAuthentication_ReturnsAuthenticatedMember', async () => {
    const hash3 = await bcrypt.hash('queenInTheNorth', 10);
    const activeMember = {
      id: 'user-3',
      userName: 'sansa@stark.com',
      password: hash3,
      role: 'member' as const,
      memberId: 'member-2',
      createdAt: new Date(),
      isActive: true
    };

    userRepo = mockUserRepository([activeUser, inactiveUser, activeMember]);
    deps = { users: userRepo };

    const credentials: LoginRequest = {
      userName: 'sansa@stark.com',
      password: 'queenInTheNorth'
    };

    const result = await AuthenticateUser(deps, credentials);

    if (isInvalidDataError(result)) {
      throw new Error('Expected AuthenticationResult but got InvalidDataError');
    }

    expect(result.isAuthenticated).toBe(true);
    expect(result.user.role).toBe('member');
    expect(result.user.memberId).toBe('member-2');
    expect('password' in result.user).toBe(false);
  });

  test('ValidAdminCredentials_AttemptAuthentication_ReturnsAuthenticatedAdmin', async () => {
    const hash4 = await bcrypt.hash('adminSecure123', 10);
    const adminUser = {
      id: 'user-4',
      userName: 'admin',
      password: hash4,
      role: 'admin' as const,
      createdAt: new Date(),
      isActive: true
    };

    userRepo = mockUserRepository([activeUser, inactiveUser, adminUser]);
    deps = { users: userRepo };

    const credentials: LoginRequest = {
      userName: 'admin',
      password: 'adminSecure123'
    };

    const result = await AuthenticateUser(deps, credentials);

    if (isInvalidDataError(result)) {
      throw new Error('Expected AuthenticationResult but got InvalidDataError');
    }

    expect(result.isAuthenticated).toBe(true);
    expect(result.user.role).toBe('admin');
    expect(result.user.userName).toBe('admin');
    expect('password' in result.user).toBe(false);
  });
});