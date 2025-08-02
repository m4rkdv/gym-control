import { Request, Response } from "express";
import { JwtService } from "../services/jwt.service";
import { MongoUserRepository } from "src/infrastructure/repositories/user.repository.impl";
import { MongoMemberRepository } from '../../infrastructure/repositories/member.repository.impl';
import { RegisterMember } from '@gymcontrol/domain/use-cases/members/register-member';
import { CreateCredentialsForMember } from '@gymcontrol/domain/use-cases/members/create-credentials-for-member';
import { AuthenticateUser } from '@gymcontrol/domain/services/auth/auth-user';


export class AuthController {
    private userRepository = new MongoUserRepository();
    private memberRepository = new MongoMemberRepository();

    registerUser = async (req: Request, res: Response) => {
        try {
            const { firstName, lastName, email, weight, age, password } = req.body;

            // Validate input
            if (!firstName || !lastName || !email || !password || !weight || !age) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            // Register member
            const memberResult = await RegisterMember(
                { members: this.memberRepository },
                { firstName, lastName, email, weight, age, joinDate: new Date() }
            );

            if ('message' in memberResult) {
                return res.status(400).json({ error: memberResult.message });
            }

            // Create credentials for member
            const credentialsResult = await CreateCredentialsForMember(
                { users: this.userRepository, members: this.memberRepository },
                { memberId: memberResult.id, password }
            );

            if ('message' in credentialsResult) {
                return res.status(400).json({ error: credentialsResult.message });
            }

            // Generate token
            const token = await JwtService.generateToken({
                id: credentialsResult.id,
                userName: credentialsResult.userName,
                role: credentialsResult.role
            });

            if (!token) {
                return res.status(500).json({ error: 'Error generating token' });
            }

            const { password: _, ...userWithoutPassword } = credentialsResult;

            res.status(201).json({
                user: userWithoutPassword,
                token
            });

        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    loginUser = async (req: Request, res: Response) => {
        try {
            const { userName, password } = req.body;

            if (!userName || !password) {
                return res.status(400).json({ error: 'Username and password are required' });
            }

            const authResult = await AuthenticateUser(
                { users: this.userRepository },
                { userName, password }
            );

            if ('message' in authResult) {
                return res.status(401).json({ error: authResult.message });
            }

            res.json({
                user: authResult.isAuthenticated,
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}