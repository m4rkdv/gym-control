import { CreateMemberDTO, Member } from "../entities/Member";
import { MemberRepository } from "../repositories/MemberRepository";


export class RegisterMemberUseCase {
  constructor(private memberRepository: MemberRepository) {}

  async execute(memberData: CreateMemberDTO): Promise<Member> {
    
    const existingMember = await this.memberRepository.findByEmail(memberData.email);
    if (existingMember) {
      throw new Error('Member with this email already exists');
    }

    
    const newMember: Member = {
      id: this.generateId(),
      ...memberData,
      membershipStatus: 'inactive',
      paidUntil: new Date(0) 
    };

    return await this.memberRepository.save(newMember);
  }

  private generateId(): string {
    return `member-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }
}