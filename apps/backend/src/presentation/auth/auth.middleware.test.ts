import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { JwtService } from '../services/jwt.service';
import { Response } from 'express';
import { authenticateToken, AuthRequest, JwtPayload } from './auth.middleware';

vi.mock('../services/jwt.service', () => ({
    JwtService: {
        validateToken: vi.fn()
    }
}));

describe('authenticateToken middleware', () => {
    const validPayload: JwtPayload = {
        id: 'user-id',
        userName: 'testuser',
        role: 'member'
    };

    let mockReq: Partial<AuthRequest>;
    let mockRes: Partial<Response>;
    let mockJson: Mock;
    let mockStatus: Mock;

    beforeEach(() => {
        mockJson = vi.fn();
        mockStatus = vi.fn().mockReturnValue({ json: mockJson });        
        mockReq = { headers: {} };
        mockRes = { json: mockJson, status: mockStatus };
        (JwtService.validateToken as Mock).mockReset();
    });

    test("invalid token returns 403 with error message", async () => {
        mockReq.headers = {
            authorization: 'Bearer invalid.token'
        };
        (JwtService.validateToken as Mock).mockRejectedValue(new Error('Invalid token'));

        await authenticateToken(mockReq as AuthRequest, mockRes as Response);

        expect(mockStatus).toHaveBeenCalledWith(403);
        expect(mockJson).toHaveBeenCalledWith({ error: 'Token validation failed' });
    });

});