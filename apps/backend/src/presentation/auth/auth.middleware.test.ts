import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { JwtService } from '../services/jwt.service';
import { NextFunction, Response } from 'express';
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
    let mockNext: NextFunction;

    beforeEach(() => {
        mockJson = vi.fn();
        mockStatus = vi.fn().mockReturnValue({ json: mockJson });

        mockReq = { headers: {} };
        mockRes = { json: mockJson, status: mockStatus };
        mockNext = vi.fn();

        (JwtService.validateToken as Mock).mockReset();
    });

    test("invalid token returns 403 with error message", async () => {
        mockReq.headers = {
            authorization: 'Bearer invalid.token'
        };
        (JwtService.validateToken as Mock).mockRejectedValue(new Error('Invalid token'));

        await authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockStatus).toHaveBeenCalledWith(403);
        expect(mockJson).toHaveBeenCalledWith({ error: 'Token validation failed' });
    });

    test("missing Authorization header returns 401 with error message", async () => {
        mockReq.headers = {};

        await authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({ error: 'Access token required' });
        expect(mockNext).not.toHaveBeenCalled();
    });

    test('authorization header without Bearer prefix returns 401 with error message', async () => {
        mockReq.headers = {
            authorization: 'invalid.token'
        };

        await authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({ error: 'Access token required' });
        expect(mockNext).not.toHaveBeenCalled();
    });

    test('valid token with complete payload calls next and sets user', async () => {
        mockReq.headers = {
            authorization: 'Bearer valid.token'
        };
        (JwtService.validateToken as Mock).mockResolvedValue(validPayload);

        await authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockReq.user).toEqual(validPayload);
        expect(mockNext).toHaveBeenCalled();
        expect(mockStatus).not.toHaveBeenCalled();
    });

     test('token with missing id returns 403 with error message', async () => {
        mockReq.headers = {
            authorization: 'Bearer valid.token'
        };
        const incompletePayload = { ...validPayload, id: undefined };
        (JwtService.validateToken as Mock).mockResolvedValue(incompletePayload);

        await authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockStatus).toHaveBeenCalledWith(403);
        expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
        expect(mockNext).not.toHaveBeenCalled();
    });

    test('token with missing userName returns 403 with error message', async () => {
        mockReq.headers = {
            authorization: 'Bearer valid.token'
        };
        const incompletePayload = { ...validPayload, userName: undefined };
        (JwtService.validateToken as Mock).mockResolvedValue(incompletePayload);

        await authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockStatus).toHaveBeenCalledWith(403);
        expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
        expect(mockNext).not.toHaveBeenCalled();
    });
});