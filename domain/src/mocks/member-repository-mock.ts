import { CreateMemberDTO, Member } from '../entities/Member';
import { MemberRepository } from "../repositories/member-repository";
import { MOCK_DELAY } from "./MockDelay";

export interface MockedMemberRepository extends MemberRepository {
  members: Member[];
}

export function mockMemberRepository(members: Member[] = []): MockedMemberRepository {
  let currentDelay = Math.floor(
    Math.random() * (MOCK_DELAY.MAX - MOCK_DELAY.MIN) + MOCK_DELAY.MIN
  );

  const simulateDatabaseDelay = async <T>(result: T): Promise<T> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(result), currentDelay);
    });
  };
  return {
    members,
    async findByEmail(email: string): Promise<Member | null> {
      const member = this.members.find(m => m.email === email) ?? null;
      return simulateDatabaseDelay(member);
    },

    async findById(id: string): Promise<Member | null> {
      const member = this.members.find(m => m.id === id) ?? null;
      return simulateDatabaseDelay(member);
    },

    async save(member: Omit<Member,'id'>): Promise<Member> {
      const existingMemberIndex = this.members.findIndex(m => m.email === member.email);

      if (existingMemberIndex !== -1) {
        await simulateDatabaseDelay(null);

        this.members[existingMemberIndex] = {
          ...this.members[existingMemberIndex],
          ...member,
          id: this.members[existingMemberIndex].id,
          joinDate: this.members[existingMemberIndex].joinDate
        };
        
        return this.members[existingMemberIndex];
      }

      const newMember: Member = {
        ...member,
        id: crypto.randomUUID(),
        membershipStatus: "inactive",
        paidUntil: new Date(0),
        joinDate: member.joinDate || new Date()
      };

      await simulateDatabaseDelay(null);
      this.members.push(newMember);
      return newMember;
    },
  };
}