import { describe, test, expect, beforeEach, vi, Mock } from 'vitest';
import { Response } from 'express';

import { mockMemberRepository } from '../../../../../domain/src/mocks/member-repository-mock';
import { mockUserRepository } from '../../../../../domain/src/mocks/user-repository-mock';
import { mockPaymentRepository } from '../../../../../domain/src/mocks/payment-repository-mock';

import { Member } from '../../../../../domain/src/entities/Member';
import { User } from '../../../../../domain/src/entities/User';
import { AuthRequest } from '../auth/auth.middleware';
import { MembersController } from './member.controller';
import { mockSystemConfigRepository } from '../../../../../domain/src/mocks/system-config-mock';

describe('MembersController', () => {
  let controller: MembersController;
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockJson: Mock;
  let mockStatus: Mock;

  const existingMember: Member = {
    id: 'member-id',
    firstName: 'Jon',
    lastName: 'Snow',
    email: 'jon.snow@winterfell.com',
    weight: 80,
    age: 25,
    joinDate: new Date('2023-01-01'),
    membershipStatus: 'active',
    paidUntil: new Date('2023-12-31')
  };

  const existingUser: User = {
    id: 'user-id',
    userName: 'jon.snow@winterfell.com',
    password: 'hashedpassword',
    role: 'member',
    memberId: 'member-id',
    createdAt: new Date(),
    isActive: true
  };

  beforeEach(() => {
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });

    mockReq = {
      body: {},
      params: {},
      user: { id: 'admin-id', userName: 'admin', role: 'admin' }
    };
    mockRes = { json: mockJson, status: mockStatus };

    // Setup repositories with test data
    const memberRepo = mockMemberRepository([existingMember]);
    const userRepo = mockUserRepository([existingUser]);
    const paymentRepo = mockPaymentRepository();
    const configRepo = mockSystemConfigRepository();

    // Create controller with dependencies
    controller = new MembersController(
      memberRepo,
      userRepo,
      paymentRepo,
      configRepo
    );
  });

  describe('processPayment', () => {
    test('missing required fields returns 400 with error details', async () => {
      const testCases = [
        { body: {} },
        { body: { memberId: 'member-1' }, },
        { body: { memberId: 'member-1', amount: 100 } },
        { body: { memberId: 'member-1', amount: 100, paymentMethod: 'cash' } },
        { body: { memberId: 'member-1', amount: 100, monthsCovered: 1 } }
      ];
      const expectedError = 'Missing required fields: memberId, amount, paymentMethod, monthsCovered';

      for (const testCase of testCases) {
        mockReq.body = testCase.body;
        await controller.processPayment(mockReq as AuthRequest, mockRes as Response);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
          error: expectedError
        });
        vi.clearAllMocks();
      }
    });

    test('member role returns 403 with permission error', async () => {
      mockReq.body = {
        memberId: 'member-1',
        amount: 100,
        paymentMethod: 'credit',
        monthsCovered: 1
      };

      mockReq.user = { id: 'user-1', userName: 'jon.snow@winterfell.com', role: 'member' };
      await controller.processPayment(mockReq as AuthRequest, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Insufficient permissions to process payments'
      });
    });

    test('unauthenticated user returns 403 with permission error', async () => {
      mockReq.body = {
        memberId: 'member-1',
        amount: 100,
        paymentMethod: 'credit',
        monthsCovered: 1
      };

      mockReq.user = undefined;
      await controller.processPayment(mockReq as AuthRequest, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Insufficient permissions to process payments'
      });
    });

    test('with valid data returns 201 with payment and updated member', async () => {
      mockReq.body = {
        memberId: 'member-id',
        amount: 100,
        paymentMethod: 'cash',
        monthsCovered: 1
      };

      await controller.processPayment(mockReq as AuthRequest, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        payment: expect.objectContaining({
          id: expect.any(String),
          memberId: 'member-id',
          amount: 100,
          paymentMethod: 'cash',
          monthsCovered: 1
        }),
        updatedMember: expect.objectContaining({
          id: 'member-id',
          membershipStatus: 'active'
        })
      });
    });
  });
});