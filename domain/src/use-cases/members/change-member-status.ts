// use-cases/change-member-status.ts
import { Member } from "../../entities/Member";
import { createInvalidDataError, InvalidDataError } from "../../errors/error";
import { MemberRepository } from "../../repositories/member-repository";
import { UserRepository } from "../../repositories/user-repository";

export interface ChangeMemberStatusDependencies {
  members: MemberRepository;
  users: UserRepository;
}

export type ChangeMemberStatusRequest = {
  memberId: string;
  newStatus: Member["membershipStatus"];
  requestedByUserId: string;
  reason?: string;
};

export async function ChangeMemberStatus(
  { members, users }: ChangeMemberStatusDependencies,
  request: ChangeMemberStatusRequest
): Promise<InvalidDataError | Member> {
  
  if (!request.memberId.trim()) return createInvalidDataError("Member ID must not be empty");
  if (!request.newStatus) return createInvalidDataError("New status is required");
  if (!request.requestedByUserId.trim()) return createInvalidDataError("Requesting user ID is required");

  const member = await members.findById(request.memberId);
  if (!member) return createInvalidDataError("Member not found");

  const requestingUser = await users.findById(request.requestedByUserId);
  if (!requestingUser) return createInvalidDataError("Requesting user not found");

  if (!requestingUser.isActive) return createInvalidDataError("Requesting user is not active");

  const validationError = validateStatusTransition(
    member.membershipStatus, 
    request.newStatus, 
    requestingUser.role
  );
  if (validationError) return validationError;

  const updatedMember: Member = {
    ...member,
    membershipStatus: request.newStatus
  };

  return members.save(updatedMember);
}

function validateStatusTransition(
  currentStatus: Member["membershipStatus"], 
  newStatus: Member["membershipStatus"],
  userRole: string
): InvalidDataError | void {
  
  if (currentStatus === newStatus) {
    return createInvalidDataError("Member already has this status");
  }

  if (currentStatus === 'deleted') {
    return createInvalidDataError("Cannot change status of deleted member");
  }

  if (newStatus === 'deleted' && userRole !== 'admin') {
    return createInvalidDataError("Unauthorized status change");
  }

  if (userRole !== 'trainer' && userRole !== 'admin') {
    return createInvalidDataError("Insufficient permissions to change member status");
  }
}