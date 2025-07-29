import { User, userRole } from "../../entities/User";
import { createInvalidDataError, InvalidDataError } from "../../errors/error";
import { MemberRepository } from "../../repositories/member-repository";
import { UserRepository } from "../../repositories/user-repository";
import bcrypt from 'bcrypt';

export interface CreateCredentialsForMemberDependencies {
  users: UserRepository;
  members: MemberRepository;
}

export type CreateCredentialsRequest = {
  memberId: string;
  password: string;
};

export async function CreateCredentialsForMember(
  { users, members }: CreateCredentialsForMemberDependencies,
  credentials: CreateCredentialsRequest
): Promise<InvalidDataError | User> {

  if (!credentials.password.trim()) return createInvalidDataError("Password must not be empty");

  const member = await members.findById(credentials.memberId);
  if (!member) return createInvalidDataError("Member not found");

  // Members use their email as username
  const userName = member.email;

  const alreadyHasUser = await users.findByUserName(userName);
  if (alreadyHasUser) return createInvalidDataError("Member already has credentials");
  const passwordHash = await bcrypt.hash(credentials.password, 10); // 10 = salt rounds

  const user: User = {
    id: crypto.randomUUID(),
    userName: member.email,
    password: passwordHash, 
    role: "member" as userRole, 
    memberId: member.id, 
    createdAt: new Date(),
    isActive: true,
  };

  return users.save(user);
}