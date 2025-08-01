
import { MemberRepository } from '@gymcontrol/domain/repositories/member-repository';
import { MemberModel } from '../database/mongo/models/member.model';
import { Member } from '@gymcontrol/domain/entities/Member';

export class MongoMemberRepository implements MemberRepository {
  async save(member: Member): Promise<Member> {
    const { id, ...memberData } = member;
    const memberDoc = new MemberModel(memberData);
    const saved = await memberDoc.save();

    return {
      id: saved._id.toString(),
      firstName: saved.firstName,
      lastName: saved.lastName,
      email: saved.email,
      weight: saved.weight,
      age: saved.age,
      joinDate: saved.joinDate,
      membershipStatus: saved.membershipStatus,
      paidUntil: saved.paidUntil
    };
  }

  async findById(id: string): Promise<Member | null> {
    const member = await MemberModel.findById(id);
    if (!member) return null;

    return {
      id: member._id.toString(),
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      weight: member.weight,
      age: member.age,
      joinDate: member.joinDate,
      membershipStatus: member.membershipStatus,
      paidUntil: member.paidUntil
    };
  }

  async findByEmail(email: string): Promise<Member | null> {
    const member = await MemberModel.findOne({ email });
    if (!member) return null;

    return {
      id: member._id.toString(),
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      weight: member.weight,
      age: member.age,
      joinDate: member.joinDate,
      membershipStatus: member.membershipStatus,
      paidUntil: member.paidUntil
    };
  }
}