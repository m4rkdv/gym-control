import { describe, test, expect, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { CreateCredentialsForTrainer, CreateCredentialsForTrainerDependencies } from './create-credentials-for-trainer';
import { MockedTrainerRepository, mockTrainerRepository } from '../../mocks/trainer-repository-mock';
import { MockedUserRepository, mockUserRepository } from '../../mocks/user-repository-mock';
import { createInvalidDataError } from '../../errors/error';
import { CreateTrainerDTO, Trainer } from '../../entities/Trainer';
import { RegisterTrainer } from './register-trainer';

describe('CreateCredentialsForTrainer Use Case', () => {
    let trainerRepo: MockedTrainerRepository;
    let userRepo: MockedUserRepository;
    let deps: CreateCredentialsForTrainerDependencies;

    beforeEach(() => {
        trainerRepo = mockTrainerRepository([]);
        userRepo = mockUserRepository([]);
        deps = { trainers: trainerRepo, users: userRepo };
    });

    async function seedTrainer(dto: CreateTrainerDTO): Promise<Trainer> {
        const result = await RegisterTrainer({ trainers: trainerRepo }, dto);
        if ('message' in result) {
            throw new Error(`Failed to seed trainer: ${result.message}`);
        }
        return result;
    }

    test('emptyPassword_fails_withInvalidData', async () => {
        const trainer = await seedTrainer({
            firstName: 'Jon',
            lastName: 'Snow',
            email: 'jon@snow.com',
            phone: '123',
        });

        const requestTest = {
            trainerId: trainer.id,
            password: ''
        }

        const result = await CreateCredentialsForTrainer(deps, requestTest);
        expect(result).toEqual(createInvalidDataError('Password must not be empty'));
    });

    test('nonExistingTrainerId_fails_withInvalidData', async () => {

        const requestTest = {
            trainerId: 'fake-id',
            password: 'secret'
        }

        const result = await CreateCredentialsForTrainer(deps, requestTest);
        expect(result).toEqual(createInvalidDataError('Trainer not found in repository'));
    });

    test('credentialsAlreadyExist_fails_withInvalidData', async () => {
        const trainer = await seedTrainer({
            firstName: 'Tyrion ',
            lastName: 'L',
            email: 'tyrion@lan.com',
            phone: '123',
        });
        await CreateCredentialsForTrainer(deps, { trainerId: trainer.id, password: 'pass1' });

        const result = await CreateCredentialsForTrainer(deps, { trainerId: trainer.id, password: 'pass2' });
        expect(result).toEqual(createInvalidDataError('Trainer already has credentials'));
        console.log("Already Exist Result:", result);
    });

    test('plainPassword_isHashed_createUser', async () => {
        const trainer = await seedTrainer({
            firstName: 'Hash',
            lastName: 'Test',
            email: 'hash@test.com',
            phone: '000',
        });

        const plainPassword = '12345678';
        const user = await CreateCredentialsForTrainer(deps, {
            trainerId: trainer.id,
            password: plainPassword,
        });

        if ('message' in user) throw new Error('Unexpected error');
        expect(user.password).not.toBe(plainPassword);

        const isValid = await bcrypt.compare(plainPassword, user.password);
        expect(isValid).toBe(true);
    });

    test('username_generatedCorrectly_firstTime', async () => {
        const trainer = await seedTrainer({
            firstName: 'Arya',
            lastName: 'Stark',
            email: 'arya@stark.com',
            phone: '123',
        });
        const user = await CreateCredentialsForTrainer(deps, { trainerId: trainer.id, password: 'pass' });

        if ('message' in user) throw new Error('Unexpected error');
        console.log("Username Generated:", user.userName);
        expect(user.userName).toBe('coach-arya');
    });

    test('usernameGeneratedCorrectly_withCounter', async () => {
        const existingTrainer = await seedTrainer({
            firstName: 'Jon',
            lastName: 'Snow',
            email: 'arya@stark.com',
            phone: '123',
        });

        const trainerUser = await CreateCredentialsForTrainer(deps, { trainerId: existingTrainer.id, password: 'pass' });
        console.log("Existing trainer user:", trainerUser);

        const trainer = await seedTrainer({
            firstName: 'Jon',
            lastName: 'Targaryen',
            email: 'Jon@killer.com',
            phone: '123',
        });

        const user = await CreateCredentialsForTrainer(deps, { trainerId: trainer.id, password: 'pass' });
        console.log("New Trainer User 2:", user);
        if ('message' in user) throw new Error('Unexpected error');
        expect(user.userName).toBe('coach-jon-2');
    });

    test('validData_createsCredentials_successfully', async () => {
        const trainer = await seedTrainer({
            firstName: 'Jon',
            lastName: 'Snow',
            email: 'jon@snow.com',
            phone: '123',
        });
        const user = await CreateCredentialsForTrainer(deps, { trainerId: trainer.id, password: 'secure123' });

        if ('message' in user) throw new Error('Unexpected error');
        expect(user).toMatchObject({
            userName: expect.stringMatching(/^coach-jon(?:-\d+)?$/),
            role: 'trainer',
            trainerId: trainer.id,
            isActive: true,
        });

        const stored = await userRepo.findByUserName(user.userName);
        expect(stored).toEqual(user);
    });
});