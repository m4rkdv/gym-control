import { describe, test, expect, beforeEach, vi, Mock } from 'vitest';
import { Request as ExpressRequest, Response } from 'express';
import { AuthController } from './controller';
import { mockUserRepository } from '../../../../../domain/src/mocks/user-repository-mock';
import { mockMemberRepository } from '../../../../../domain/src/mocks/member-repository-mock';
import { JwtService } from '../services/jwt.service';
import { Member } from '../../../../../domain/src/entities/Member';

// Mock JwtService
vi.mock('../services/jwt.service', () => ({
    JwtService: {
        generateToken: vi.fn().mockResolvedValue('mock-jwt-token')
    }
}));

describe('AuthController', () => {
    let controller: AuthController;
    let mockReq: Partial<ExpressRequest>;
    let mockRes: Partial<Response>;
    let mockJson: Mock;
    let mockStatus: Mock;

    // Test data
    const validUserData = {
        firstName: 'Jon',
        lastName: 'Snow',
        email: 'jon.snow@winter.com',
        weight: 95,
        age: 29,
        password: 'ghost123'
    };

    const existingMember: Member = {
        id: 'existing-id',
        firstName: 'Tyrion',
        lastName: 'Lannister',
        email: 'big.lion@example.com',
        weight: 55,
        age: 30,
        joinDate: new Date(),
        membershipStatus: 'inactive',
        paidUntil: new Date(0)
    };

    beforeEach(() => {
        // Reset mocks
        mockJson = vi.fn();
        mockStatus = vi.fn().mockReturnValue({ json: mockJson });

        mockReq = { body: {} };
        mockRes = { json: mockJson, status: mockStatus };

        controller = new AuthController();

        // Reset repositories
        (controller as any).userRepository = mockUserRepository();
        (controller as any).memberRepository = mockMemberRepository();

        // Reset JWT mock
        (JwtService.generateToken as Mock).mockResolvedValue('mock-jwt-token');

    });

    describe('registerUser', () => {
        test('With missing firstName,input returns 400 with error', async () => {
            const invalidData = { ...validUserData, firstName: "" };
            mockReq.body = invalidData;

            await controller.registerUser(mockReq as ExpressRequest, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({ error: 'All fields are required' })
            );
        });

        test('missing lastName,input returns 400 with error', async () => {
            const invalidData = { ...validUserData, lastName: "" };
            mockReq.body = invalidData;

            await controller.registerUser(mockReq as ExpressRequest, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'All fields are required'
            });
        });

        test('missing email,input returns 400 with error', async () => {
            const invalidData = { ...validUserData, email: "" };
            mockReq.body = invalidData;

            await controller.registerUser(mockReq as ExpressRequest, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'All fields are required'
                })
            );
        });

        test('missing password,input returns 400 with error', async () => {
            const invalidData = { ...validUserData, password: "" };
            mockReq.body = invalidData;

            await controller.registerUser(mockReq as ExpressRequest, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'All fields are required'
                })
            );
        });

        test('missing weight,input returns 400 with error', async () => {
            const invalidData = { ...validUserData, weight: undefined };
            mockReq.body = invalidData;

            await controller.registerUser(mockReq as ExpressRequest, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'All fields are required'
                })
            );
        });

        test('missing age,input returns 400 with error', async () => {
            const invalidData = { ...validUserData, age: undefined };
            mockReq.body = invalidData;

            await controller.registerUser(mockReq as ExpressRequest, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'All fields are required'
                })
            );
        });

        test('existing email,input returns 400 with error', async () => {
            // Setup existing member
            (controller as any).memberRepository = mockMemberRepository([existingMember]);

            mockReq.body = {
                ...validUserData,
                email: existingMember.email // Existing email
            };

            await controller.registerUser(mockReq as ExpressRequest, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Email already in use'
            });
        });

        test('valid data, registers user and returns 201 with user and token', async () => {
            mockReq.body = { ...validUserData };

            await controller.registerUser(mockReq as ExpressRequest, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(201);

            const expectedResponse = {
                user: {
                    userName: 'jon.snow@winter.com',
                    role: 'member',
                    isActive: true,
                    createdAt: expect.any(Date),
                    id: expect.any(String),
                    memberId: expect.any(String)
                },
                token: 'mock-jwt-token'
            };
            expect(mockJson).toHaveBeenCalledWith(expectedResponse);
        });

        test('data input,JWT generation fails, returns 500 with error', async () => {
            (JwtService.generateToken as Mock).mockResolvedValueOnce(null);
            mockReq.body = { ...validUserData };

            await controller.registerUser(mockReq as ExpressRequest, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Error generating token'
            });
        });
    });

    describe('loginUser', () => {
        const TEST_PASSWORD = 'ghostPassword';

         const validLoginData = {
            userName: 'jon.snow@example.com',
            password: TEST_PASSWORD
        };
        
        test('With missing credentials, returns 400 with error', async () => {
            const { password, ...invalidData } = validLoginData;

            mockReq.body = invalidData;

            await controller.loginUser(mockReq as ExpressRequest, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Username and password are required'
            });
        });
        
    });

});