import { Member } from "../entities/Member";

export interface MemberRepository {
  save(member: Member): Promise<Member>;
  findById(id: string): Promise<Member | null>;
  findByEmail(email: string): Promise<Member | null>;
}