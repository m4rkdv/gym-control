import { CreateMemberDTO, Member } from "../../entities/Member";
import { createInvalidDataError, InvalidDataError } from "../../errors/error";
import { MemberRepository } from "../../repositories/member-repository";
import { INITIAL_PAID_UNTIL } from "../../utils/date";


export interface RegisterMemberDependencies {
  members: MemberRepository;
}

export type CreateMemberRequest = CreateMemberDTO;

export async function RegisterMember(
  { members }: RegisterMemberDependencies,
  memberDTO: CreateMemberRequest
): Promise<InvalidDataError | Member> {
  const validationError = validateData(memberDTO);
  if (validationError) return validationError;

  const existing = await members.findByEmail(memberDTO.email);
  if (existing) return createInvalidDataError("Email already in use");

  const member: Member = {
    id: crypto.randomUUID(),
    ...memberDTO,
    membershipStatus: "inactive",
    paidUntil: INITIAL_PAID_UNTIL,
  };

  return members.save(member);
}

function validateData(dto: CreateMemberDTO): InvalidDataError | void {
  if (!dto.firstName.trim()) return createInvalidDataError("First name must not be empty");
  if (!dto.lastName.trim()) return createInvalidDataError("Last name must not be empty");
  if (!dto.email.trim()) return createInvalidDataError("Email must not be empty");
  if (dto.age <= 0) return createInvalidDataError("Age must be positive");
  if (dto.weight <= 0) return createInvalidDataError("Weight must be positive");
}