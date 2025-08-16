import { Member } from "../../entities/Member.js";
import { createInvalidDataError, InvalidDataError } from "../../errors/error.js";
import { MemberRepository } from "../../repositories/member-repository.js";
import { UserRepository } from "../../repositories/user-repository.js";

export interface ChangeMemberStatusDependencies {
  members: MemberRepository;
  users: UserRepository;
}

/**
 * Request data for changing a member's status.
 * 
 * @property {string} memberId - ID of the member whose status is to be changed.
 * @property {Member["membershipStatus"]} newStatus - The new status to apply to the member.
 * @property {string} requestedByUserId - ID of the user requesting the status change.
 * @property {string} [reason] - Optional reason for the status change.
 * 
 */
export type ChangeMemberStatusRequest = {
  memberId: string;
  newStatus: Member["membershipStatus"];
  requestedByUserId: string;
  reason?: string;
};

/**
 * Changes the membership status of a given member.
 * 
 * Validates input data, checks authorization, and applies business rules before updating the status.
 * 
 * @param {ChangeMemberStatusDependencies} deps - Object containing required repositories.
 * @param {ChangeMemberStatusRequest} request - Data describing the status change request.
 * 
 * @returns {Promise<InvalidDataError | Member>} - Returns the updated Member on success or an InvalidDataError on failure.
 */
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

  return members.update(request.memberId, {
    membershipStatus: request.newStatus
  });
}

/**
 * Validates the transition from the current member status to the new one.
 * 
 * Ensures the transition follows business rules based on the user's role and the current state of the member.
 * 
 * @param {Member["membershipStatus"]} currentStatus - Current status of the member.
 * @param {Member["membershipStatus"]} newStatus - Desired new status.
 * @param {string} userRole - Role of the user performing the status change.
 * 
 * @returns {InvalidDataError | void} - Returns an error if the transition is invalid; otherwise, nothing.
 */
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