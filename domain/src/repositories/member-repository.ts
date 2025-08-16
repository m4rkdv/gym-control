import { CreateMemberDTO, Member, UpdateMemberDTO } from "../entities/Member.js";

export interface MemberRepository {
  create(member: CreateMemberDTO): Promise<Member>;
  update(memberId: string, updates: UpdateMemberDTO): Promise<Member>;
  save(member: CreateMemberDTO): Promise<Member>;
  findById(id: string): Promise<Member | null>;
  findByEmail(email: string): Promise<Member | null>;
}