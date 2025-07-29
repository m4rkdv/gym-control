import { describe, test, expect, beforeEach } from 'vitest';
import { CreateCredentialsForMember, CreateCredentialsForMemberDependencies } from './create-credentials-for-member';
import { RegisterMember } from './register-member';

import { MockedMemberRepository, mockMemberRepository } from '../../mocks/member-repository-mock';
import { MockedUserRepository, mockUserRepository } from '../../mocks/user-repository-mock';

import { createInvalidDataError } from '../../errors/error';
import { CreateMemberDTO, Member } from '../../entities/Member';
import bcrypt from 'bcrypt';

describe('CreateCredentialsForMember Use Case', () => {
    let memberRepo: MockedMemberRepository;
    let userRepo: MockedUserRepository;
    let deps: CreateCredentialsForMemberDependencies;

    beforeEach(() => {
        memberRepo = mockMemberRepository([]);
        userRepo = mockUserRepository([]);
        deps = { members: memberRepo, users: userRepo };
    });

    async function seedMember(dto: CreateMemberDTO): Promise<Member> {
        const result = await RegisterMember({ members: memberRepo }, dto);
        if ('message' in result) {
            throw new Error(`Failed to seed member: ${result.message}`);
        }
        return result;
    }

    test('emptyPassword_fails_withInvalidData', async () => {
        const testMember = await seedMember({
            firstName: 'Arya',
            lastName: 'Stark',
            email: 'arya@stark.com',
            weight: 60,
            age: 22,
            joinDate: new Date(),
        });

        const result = await CreateCredentialsForMember(deps, {
            memberId: testMember.id,
            password: '',
        });

        expect(result).toEqual(createInvalidDataError('Password must not be empty'));
    });

    test('nonExistingMemberId_fails_withInvalidData', async () => {
        const result = await CreateCredentialsForMember(deps, {
            memberId: 'fake-id',
            password: 'secret123',
        });

        expect(result).toEqual(createInvalidDataError('Member not found'));
    });

    test('userName_equals_memberEmail', async () => {
        const member = await seedMember({
            firstName: 'Robb',
            lastName: 'Stark',
            email: 'robb@stark.com',
            weight: 75,
            age: 20,
            joinDate: new Date(),
        });

        const user = await CreateCredentialsForMember(deps, {
            memberId: member.id,
            password: 'kingInTheNorth',
        });

        // Type guard
        if ('message' in user) throw new Error('Unexpected error');

        expect(user.userName).toBe(member.email);
        expect(user.userName).toBe('robb@stark.com');
    });

    test('credentialsAlreadyExist_fails_withInvalidData', async () => {
        console.log("start");
        const member = await seedMember({
            firstName: 'Sansa',
            lastName: 'Stark',
            email: 'sansa@stark.com',
            weight: 65,
            age: 25,
            joinDate: new Date(),
        });

        // first call succeeds
        await CreateCredentialsForMember(deps, {
            memberId: member.id,
            password: 'secret123',
        });
        console.log("check1");
        // second call with same member
        const result = await CreateCredentialsForMember(deps, {
            memberId: member.id,
            password: 'secret456',
        });
        console.log("start", result);
        expect(result).toEqual(createInvalidDataError('Member already has credentials'));
    });

    test('plainPassword_isHashed_createUser', async () => {
        const member = await seedMember({
            firstName: 'Hash',
            lastName: 'Member',
            email: 'hash@member.com',
            weight: 70,
            age: 30,
            joinDate: new Date(),
        });

        const plainPassword = 'mySecret456';

        const user = await CreateCredentialsForMember(deps, {
            memberId: member.id,
            password: plainPassword,
        });

        if ('message' in user) throw new Error('Unexpected error');

        expect(user.password).not.toBe(plainPassword);

        const isValid = await bcrypt.compare(plainPassword, user.password);
        expect(isValid).toBe(true);
    });

    test('validData_createsCredentials_successfully', async () => {
        const member = await seedMember({
            firstName: 'Bran',
            lastName: 'Stark',
            email: 'bran@stark.com',
            weight: 55,
            age: 18,
            joinDate: new Date(),
        });

        const result = await CreateCredentialsForMember(deps, {
            memberId: member.id,
            password: 'winterIsComing',
        });

        expect(result).toMatchObject({
            userName: member.email,
            role: 'member',
            memberId: member.id,
            isActive: true,
        });

        // stored in repo
        const stored = await userRepo.findByUserName(member.email);
        expect(stored).toEqual(result);
    });
});