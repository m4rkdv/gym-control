import { describe, test, expect, beforeEach } from 'vitest';
import { RegisterTrainer, RegisterTrainerDependencies } from './register-trainer';
import { CreateTrainerDTO } from '../entities/Trainer';
import { MockedTrainerRepository, mockTrainerRepository } from '../mocks/trainer-repository-mock';
import { createInvalidDataError } from '../errors/error';

describe('RegisterTrainer Use Case', () => {
    let repo: MockedTrainerRepository;
    let deps: RegisterTrainerDependencies;

    beforeEach(() => {
        repo = mockTrainerRepository([]);
        deps = { trainers: repo };
    });

    test('emptyFirstName_attemptRegistration_failsWithValidationError', async () => {
        const dto: CreateTrainerDTO = {
            firstName: '',
            lastName: 'Snow',
            email: 'a@b.com',
            phone: '123'
        };
        const result = await RegisterTrainer(deps, dto);
        expect(result).toEqual(createInvalidDataError('First name must not be empty'));
    });

    test('emptyLastName_attemptRegistration_failsWithValidationError', async () => {
        const dto: CreateTrainerDTO = {
            firstName: 'Jon',
            lastName: '',
            email: 'a@b.com',
            phone: '123'
        };
        const result = await RegisterTrainer(deps, dto);
        expect(result).toEqual(createInvalidDataError('Last name must not be empty'));
    });

    test('emptyEmail_attemptRegistration_failsWithValidationError', async () => {
        const dto: CreateTrainerDTO = {
            firstName: 'Jon',
            lastName: 'Snow',
            email: '',
            phone: '123'
        };
        const result = await RegisterTrainer(deps, dto);
        expect(result).toEqual(createInvalidDataError('Email must not be empty'));
    });

    test('emptyPhone_attemptRegistration_failsWithValidationError', async () => {
        const dto: CreateTrainerDTO = {
            firstName: 'Jon',
            lastName: 'Snow',
            email: 'a@b.com',
            phone: ''
        };
        const result = await RegisterTrainer(deps, dto);
        expect(result).toEqual(createInvalidDataError('Phone must not be empty'));
    });

    test('existingEmail_attemptRegistration_failsWithEmailInUse', async () => {
        const dto: CreateTrainerDTO = {
            firstName: 'Jon',
            lastName: 'Snow',
            email: 'jon@snow.com',
            phone: '+123456789',
        };
        await RegisterTrainer(deps, dto);

        const result = await RegisterTrainer(deps, dto);
        expect(result).toEqual(createInvalidDataError('Email already in use'));
    });

    test('validTrainerData_attemptRegistration_succeedsWithTrainerCreated', async () => {
        const dto: CreateTrainerDTO = {
            firstName: 'Ana',
            lastName: 'Lopez',
            email: 'ana@lopez.com',
            phone: '+34987654321',
        };

        const result = await RegisterTrainer(deps, dto);

        if ('message' in result) {
            throw new Error('Unexpected error');
        }

        expect(result).toMatchObject({
            firstName: 'Ana',
            lastName: 'Lopez',
            email: 'ana@lopez.com',
            phone: '+34987654321',
            isActive: true,
        });

        expect(typeof result.id).toBe('string');
        expect(result.id.length).toBeGreaterThan(0);

        const stored = await repo.findByEmail('ana@lopez.com');
        expect(stored).toEqual(result);
        console.log("Trainer stored: ",stored);
    });
});