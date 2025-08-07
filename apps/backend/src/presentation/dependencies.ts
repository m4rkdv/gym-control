import { MemberRepository } from '@gymcontrol/domain/repositories/member-repository';
import { UserRepository } from '@gymcontrol/domain/repositories/user-repository';
import { MongoMemberRepository } from 'src/infrastructure/repositories/member.repository.impl';
import { MongoUserRepository } from 'src/infrastructure/repositories/user.repository.impl';
import { PaymentRepository } from '../../../../domain/src/repositories/payment-repository';
import { SystemConfigRepository } from '../../../../domain/src/repositories/system-config-repository';
import { MongoPaymentRepository } from 'src/infrastructure/repositories/payment.repository.impl';
import { MongoSystemConfigRepository } from 'src/infrastructure/repositories/system-config.impl';

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