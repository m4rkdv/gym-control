import { Response } from "express"; 
import { AuthRequest } from "../auth/auth.middleware"; 
import { MemberRepository } from '@gymcontrol/domain/repositories/member-repository'; 
import { UserRepository } from '@gymcontrol/domain/repositories/user-repository'; 
import { PaymentRepository } from '@gymcontrol/domain/repositories/payment-repository'; 
import { SystemConfigRepository } from '@gymcontrol/domain/repositories/system-config-repository'; 
import { ProcessPayment } from '@gymcontrol/domain/use-cases/payments/process-payment'; 
import { VerifyMembershipStatus } from "@gymcontrol/domain/services/business-rules/verify-membership-status";
 
export class MembersController { 
    constructor( 
        private memberRepository: MemberRepository, 
        private userRepository: UserRepository, 
        private paymentRepository: PaymentRepository, 
        private systemConfigRepository: SystemConfigRepository 
    ) {} 
 
    processPayment = async (req: AuthRequest, res: Response) => { 
        try { 
            const { memberId, amount, paymentMethod, monthsCovered, isProportional = false, hasPromotion = false, promotionId } = req.body; 
 
            if (!memberId || !amount || !paymentMethod || !monthsCovered) { 
                return res.status(400).json({ error: 'Missing required fields: memberId, amount, paymentMethod, monthsCovered' }); 
            } 
 
            // Only admin and trainer roles are authorized to process payments
            if (req.user?.role !== 'admin' && req.user?.role !== 'trainer') { 
                return res.status(403).json({ error: 'Insufficient permissions to process payments' }); 
            } 
 
            const paymentResult = await ProcessPayment( 
                { 
                    payments: this.paymentRepository, 
                    members: this.memberRepository 
                }, 
                { 
                    memberId, 
                    amount: Number(amount), 
                    paymentMethod, 
                    paymentDate: new Date(), 
                    monthsCovered: Number(monthsCovered), 
                    isProportional, 
                    hasPromotion, 
                    promotionId 
                } 
            ); 
 
            if ('message' in paymentResult) { 
                return res.status(400).json({ error: paymentResult.message }); 
            } 
 
            res.status(201).json({ 
                payment: paymentResult.payment, 
                updatedMember: paymentResult.updatedMember 
            }); 
 
        } catch (error: any) { 
            res.status(500).json({ error: error.message }); 
        } 
    }

    verifyMembershipStatus = async (req: AuthRequest, res: Response) => { 
        try { 
            const { memberId } = req.params; 
 
            if (!memberId) { 
                return res.status(400).json({ error: 'Member ID is required' }); 
            } 
 
            // Members can only view their own membership status
            if (req.user?.role === 'member' && req.user?.id !== memberId) { 
                const userRecord = await this.userRepository.findById(req.user.id); 
                if (userRecord?.memberId !== memberId) { 
                    return res.status(403).json({ error: 'Access denied' }); 
                } 
            } 
 
            const verificationResult = await VerifyMembershipStatus( 
                { 
                    members: this.memberRepository, 
                    systemConfig: this.systemConfigRepository 
                }, 
                memberId 
            ); 
 
            if ('message' in verificationResult) { 
                return res.status(404).json({ error: verificationResult.message }); 
            } 

            // Get system config for grace period
            const config = await this.systemConfigRepository.getCurrent();
            
            // Calculete days remaining
            const today = new Date();
            const paidUntil = new Date(verificationResult.paidUntil);
            const diffMs = paidUntil.getTime() - today.getTime();
            const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            
            res.status(200).json({
                memberId,
                membershipStatus: verificationResult.membershipStatus,
                paidUntil: verificationResult.paidUntil,
                gracePeriod: config.gracePeriodDays,
                daysRemaining
            }); 
 
        } catch (error: any) { 
            res.status(500).json({ error: error.message }); 
        } 
    } 
}