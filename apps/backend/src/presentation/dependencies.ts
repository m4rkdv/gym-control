import { MemberRepository, UserRepository, PaymentRepository, SystemConfigRepository } from '@gymcontrol/domain';
import { MongoMemberRepository } from '../infrastructure/repositories/member.repository.impl.js';
import { MongoUserRepository } from '../infrastructure/repositories/user.repository.impl.js';
import { MongoPaymentRepository } from '../infrastructure/repositories/payment.repository.impl.js';
import { MongoSystemConfigRepository } from '../infrastructure/repositories/system-config.impl.js';

export interface Dependencies {
  memberRepository: MemberRepository;
  userRepository: UserRepository;
  paymentRepository: PaymentRepository;
  systemConfigRepository: SystemConfigRepository;
}

export function createDependencies(): Dependencies {
  return {
    memberRepository: new MongoMemberRepository(),
    userRepository: new MongoUserRepository(),
    paymentRepository: new MongoPaymentRepository(),
    systemConfigRepository: new MongoSystemConfigRepository()
  };
}