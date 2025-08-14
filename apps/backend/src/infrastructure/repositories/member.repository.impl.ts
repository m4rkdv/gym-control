import { MemberRepository, CreateMemberDTO, Member, UpdateMemberDTO } from '@gymcontrol/domain';
import { MemberModel } from '../database/mongo/models/member.model';

export class MongoMemberRepository implements MemberRepository {
  async create(member: CreateMemberDTO): Promise<Member> {
    const memberDoc = new MemberModel({
      ...member,
      membershipStatus: "inactive",
      paidUntil: new Date(0)
    });
    
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

  async update(memberId: string, updates: UpdateMemberDTO): Promise<Member> {
    const saved = await MemberModel.findByIdAndUpdate(
      memberId,
      updates,
      { new: true }
    );
    
    if (!saved) {
      throw new Error(`Member with id ${memberId} not found`);
    }

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

  async save(member: CreateMemberDTO | Member): Promise<Member> {
    if ('id' in member && member.id) {
      const { id, ...updates } = member;
      return this.update(id, updates);
    }

    return this.create(member as CreateMemberDTO);
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