import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/jwt.service';


export interface JwtPayload {
    id: string;
    userName: string;
    role: 'member' | 'trainer' | 'admin';
}

export interface AuthRequest extends Request {
    user?: JwtPayload;
}

export const authenticateToken = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

        if (!token) {
            res.status(401).json({ error: 'Access token required' });
            return;
        }

        const payload = await JwtService.validateToken<JwtPayload>(token);

        if (!payload?.id || !payload?.userName ) {
            res.status(403).json({ error: 'Invalid or expired token' });
            return;
        }
        req.user = payload!;
        next();

    } catch (error) {
        res.status(403).json({ error: 'Token validation failed' });

    }
};