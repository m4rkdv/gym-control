import { CreateMemberDTO, Member } from "../entities/Member";

export interface MemberRepository {
  save(member: CreateMemberDTO): Promise<Member>;
  findById(id: string): Promise<Member | null>;
  findByEmail(email: string): Promise<Member | null>;
}