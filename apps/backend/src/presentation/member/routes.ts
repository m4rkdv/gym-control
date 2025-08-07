import { Router } from 'express';
import { authenticateToken } from '../auth/auth.middleware';
import { MemberRepository } from '@gymcontrol/domain/repositories/member-repository';
import { UserRepository } from '@gymcontrol/domain/repositories/user-repository';
import { PaymentRepository } from '@gymcontrol/domain/repositories/payment-repository';
import { SystemConfigRepository } from '@gymcontrol/domain/repositories/system-config-repository';
import { MembersController } from './member.controller';

export class MembersRoutes {
  constructor(
    private readonly dependencies: {
      memberRepository: MemberRepository;
      userRepository: UserRepository;
      paymentRepository: PaymentRepository;
      systemConfigRepository: SystemConfigRepository;
    }
  ) {}

  get routes(): Router {
    const router = Router();
    const controller = new MembersController(
      this.dependencies.memberRepository,
      this.dependencies.userRepository,
      this.dependencies.paymentRepository,
      this.dependencies.systemConfigRepository
    );

    router.use(authenticateToken);

    // Member profile routes
    router.get('/profile', controller.getMyProfile);
    
    // Member management routes
    router.get('/:memberId/status', controller.verifyMembershipStatus);
    
    // Payment routes
    router.post('/payments', controller.processPayment);

    return router;
  }
}