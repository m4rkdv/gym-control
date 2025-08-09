import { CreateMemberDTO, Member, UpdateMemberDTO } from '../entities/Member';
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
    async create(member: CreateMemberDTO): Promise<Member> {
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

    async update(memberId: string, updates: UpdateMemberDTO): Promise<Member> {
      const memberIndex = this.members.findIndex(m => m.id === memberId);
      
      if (memberIndex === -1) {
        throw new Error(`Member with id ${memberId} not found`);
      }

      this.members[memberIndex] = {
        ...this.members[memberIndex],
        ...updates
      };

      return simulateDatabaseDelay(this.members[memberIndex]);
    },

    async save(member: CreateMemberDTO | Member): Promise<Member> {
      if ('id' in member && member.id) {
        const { id, ...updates } = member;
        return this.update(id, updates);
      }
      return this.create(member as CreateMemberDTO);
    },

    async findByEmail(email: string): Promise<Member | null> {
      const member = this.members.find(m => m.email === email) ?? null;
      return simulateDatabaseDelay(member);
    },

    async findById(id: string): Promise<Member | null> {
      const member = this.members.find(m => m.id === id) ?? null;
      return simulateDatabaseDelay(member);
    },
  };
}