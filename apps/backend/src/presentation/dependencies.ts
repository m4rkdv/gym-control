import { MemberRepository } from '@gymcontrol/domain/repositories/member-repository';
import { UserRepository } from '@gymcontrol/domain/repositories/user-repository';
import { MongoMemberRepository } from 'src/infrastructure/repositories/member.repository.impl';
import { MongoUserRepository } from 'src/infrastructure/repositories/user.repository.impl';

export interface Dependencies {
  memberRepository: MemberRepository;
  userRepository: UserRepository;
}

export function createDependencies(): Dependencies {
  return {
    memberRepository: new MongoMemberRepository(),
    userRepository: new MongoUserRepository()
  };
}