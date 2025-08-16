import { describe, test, expect, beforeEach, vi, Mock } from 'vitest';
import { Response } from 'express';

import { mockMemberRepository } from '../../../../../domain/src/mocks/member-repository-mock';
import { mockUserRepository } from '../../../../../domain/src/mocks/user-repository-mock';
import { mockPaymentRepository } from '../../../../../domain/src/mocks/payment-repository-mock';

import { Member, User } from '@gymcontrol/domain';
import { AuthRequest } from '../auth/auth.middleware.js';
import { MembersController } from './member.controller.js';
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

  describe('verifyMembershipStatus', () => {
    const activeMemberData = {
      id: 'member-1',
      membershipStatus: 'active',
      paidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days in the future
    };

    beforeEach(() => {
      vi.spyOn(controller['memberRepository'], 'findById').mockResolvedValue(activeMemberData);
      vi.spyOn(controller['systemConfigRepository'], 'getCurrent').mockResolvedValue({
        gracePeriodDays: 7,
        suspensionMonths: 3
      });
    });

    test('missing memberId returns 400 with error', async () => {
      mockReq.params = {};

      await controller.verifyMembershipStatus(mockReq as AuthRequest, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Member ID is required'
      });
    });

    test('member trying to access another member returns 403', async () => {
      mockReq.params = { memberId: 'other-member' };
      mockReq.user = {
        id: 'user-1',
        userName: 'test.member',
        role: 'member',
      };

      await controller.verifyMembershipStatus(mockReq as AuthRequest, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Access denied'
      });
    });

    test('admin can access any member status', async () => {
      mockReq.params = { memberId: 'member-1' };
      mockReq.user = {
        id: 'admin-1',
        userName: 'admin',
        role: 'admin'
      };

      await controller.verifyMembershipStatus(mockReq as AuthRequest, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        memberId: 'member-1',
        membershipStatus: 'active'
      }));
    });

    test('returns correct membership status and days remaining', async () => {
      mockReq.params = { memberId: 'member-1' };
      mockReq.user = {
        id: 'user-1',
        userName: 'test.member',
        role: 'member'
      };

      // Mock userRepository response
      vi.spyOn(controller['userRepository'], 'findById').mockResolvedValue({
        id: 'user-1',
        memberId: 'member-1',
      });

      await controller.verifyMembershipStatus(mockReq as AuthRequest, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        memberId: 'member-1',
        membershipStatus: 'active',
        paidUntil: activeMemberData.paidUntil,
        gracePeriod: 7,
        daysRemaining: expect.any(Number)
      });
    });

    test('returns 404 when member not found', async () => {
      mockReq.params = { memberId: 'non-existent' };
      vi.spyOn(controller['memberRepository'], 'findById').mockResolvedValue(null);

      await controller.verifyMembershipStatus(mockReq as AuthRequest, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Member not found'
      });
    });

    test('returns 500 on repository error', async () => {
      mockReq.params = { memberId: 'member-1' };
      vi.spyOn(controller['memberRepository'], 'findById').mockRejectedValue(new Error('DB Error'));

      await controller.verifyMembershipStatus(mockReq as AuthRequest, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'DB Error'
      });
    });
  });

  describe('getMyProfile', () => {
    const mockUser = {
      id: 'user-1',
      userName: 'jon.snow',
      role: 'member',
    } as const;

    const mockMember = {
      id: 'member-1',
      firstName: 'Jon',
      lastName: 'Snow',
      email: 'jon@snow.com',
      membershipStatus: 'active'
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('unauthenticated user returns 401', async () => {
      mockReq.user = undefined;

      await controller.getMyProfile(mockReq as AuthRequest, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Authentication required'
      });
    });

    test('user without member profile returns 404', async () => {
      mockReq.user = mockUser;

      // User exists but has no memberId
      vi.spyOn(controller['userRepository'], 'findById').mockResolvedValue({
        id: 'user-1',
        userName: 'jon.snow',
        role: 'member',
        memberId: null
      });

      await controller.getMyProfile(mockReq as AuthRequest, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Member profile not found'
      });
    });

    test('member not found returns 404', async () => {
      mockReq.user = mockUser;

      // User exists with memberId
      vi.spyOn(controller['userRepository'], 'findById').mockResolvedValue(mockUser);
      // But member doesn't exist
      vi.spyOn(controller['memberRepository'], 'findById').mockResolvedValue(null);

      await controller.getMyProfile(mockReq as AuthRequest, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Member profile not found'
      });
    });

    test('authenticated member returns profile data', async () => {
      mockReq.user = mockUser;

      vi.spyOn(controller['userRepository'], 'findById').mockResolvedValue({
        id: 'user-1',
        userName: 'jon.snow',
        role: 'member',
        memberId: 'member-1',
      } as User);

      vi.spyOn(controller['memberRepository'], 'findById').mockResolvedValue(mockMember);

      await controller.getMyProfile(mockReq as AuthRequest, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockMember);
    });

    test('returns 500 on repository error', async () => {
      mockReq.user = mockUser;

      vi.spyOn(controller['userRepository'], 'findById').mockRejectedValue(new Error('Database error'));

      await controller.getMyProfile(mockReq as AuthRequest, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Database error'
      });
    });
  });
});