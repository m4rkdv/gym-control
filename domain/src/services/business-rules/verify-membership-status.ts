import { Member } from "../../entities/Member";
import { SystemConfig } from "../../entities/SystemConfig";
import { createInvalidDataError, InvalidDataError } from "../../errors/error";
import { MemberRepository } from "../../repositories/member-repository";
import { SystemConfigRepository } from "../../repositories/system-config-repository";

export interface VerifyMembershipStatusDependencies {
    members: MemberRepository;
    systemConfig: SystemConfigRepository;
}
/**
 * Verifies the membership status of a member based on their payment history and system configuration.
 * If the status has changed, the member is updated in the repository.
 *
 * @param {VerifyMembershipStatusDependencies} deps - Dependencies: repositories for members and system config.
 * @param {string} memberId - The ID of the member to verify.
 * @returns {Promise<InvalidDataError | Member>} - Returns the updated member or an error if input is invalid or member is not found.
 */
export async function VerifyMembershipStatus(
    { members, systemConfig }: VerifyMembershipStatusDependencies,
    memberId: string
): Promise<InvalidDataError | Member> {
    if (!memberId.trim()) return createInvalidDataError("Member ID must not be empty");

    const member = await members.findById(memberId);
    if (!member) return createInvalidDataError("Member not found");

    // Load system configuration (grace period, suspension policy)
    const config = await systemConfig.getCurrent();
    // Calculate updated membership status
    const updatedMember = calculateMembershipStatus(member, config);

    if (updatedMember.membershipStatus !== member.membershipStatus) {
        await members.save(updatedMember);
    }

    return updatedMember;
}

/**
 * Calculates the correct membership status of a member based on payment expiration and system policy.
 *
 * @param {Member} member - The member whose status will be evaluated.
 * @param {SystemConfig} config - The system-wide configuration including grace period and suspension rules.
 * @param {Date} [today=new Date()] - Optional date to consider as "today" (useful for testing).
 * @returns {Member} - A new member object with the updated membership status.
 */
export function calculateMembershipStatus(
    member: Member,
    config: SystemConfig,
    today: Date = new Date()
): Member {
    const paidUntil = new Date(member.paidUntil);

    if (paidUntil.getTime() === 0) {
        return { ...member, membershipStatus: "inactive" };
    }

    const diffMs = today.getTime() - paidUntil.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let status: Member["membershipStatus"];

    if (diffDays <= config.gracePeriodDays) {
        status = "active";
    } else if (diffDays >= config.suspensionMonths * 30) {
        status = "suspended";
    } else {
        status = "inactive";
    }

    return {
        ...member,
        membershipStatus: status,
    };
}