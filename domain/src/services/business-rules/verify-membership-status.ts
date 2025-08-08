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

    const normalize = (d: Date) => {
        const n = new Date(d);
        n.setUTCHours(0, 0, 0, 0);
        return n;
    };

    const todayMid = normalize(today);
    const paidMid = normalize(paidUntil);

    let status: Member["membershipStatus"];

    if (paidMid >= todayMid) {
        // Payment is still valid
        status = "active";
    } else {
        // Grace period until the Nth day of the current month (e.g., 10th)
        const graceLimit = new Date(Date.UTC(
            todayMid.getUTCFullYear(),
            todayMid.getUTCMonth(),
            config.gracePeriodDays
        ));

        // Check if the paidUntil date belongs to the previous calendar month
        const wasPreviousMonth = (
            todayMid.getUTCFullYear() === paidMid.getUTCFullYear() &&
            todayMid.getUTCMonth() - paidMid.getUTCMonth() === 1
        ) || (
            todayMid.getUTCMonth() === 0 &&
            paidMid.getUTCFullYear() === todayMid.getUTCFullYear() - 1 &&
            paidMid.getUTCMonth() === 11
        );

        const withinGraceWindow = todayMid <= graceLimit && wasPreviousMonth;

        if (withinGraceWindow) {
            status = "active";
        } else {
            // Determine suspension based on configured months difference
            const monthsDiff =
                (todayMid.getUTCFullYear() - paidMid.getUTCFullYear()) * 12 +
                (todayMid.getUTCMonth() - paidMid.getUTCMonth());

            if (monthsDiff >= config.suspensionMonths) {
                status = "suspended";
            } else {
                status = "inactive";
            }
        }
    }

    return {
        ...member,
        membershipStatus: status,
    };
}