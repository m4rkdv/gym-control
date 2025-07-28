import { CreateTrainerDTO, Trainer } from "../entities/Trainer";
import { TrainerRepository } from "../repositories/trainer-repository";
import { MOCK_DELAY } from "./MockDelay";

export interface MockedTrainerRepository extends TrainerRepository {
    trainers: Trainer[];
}

export function mockTrainerRepository(trainers: Trainer[] = []): MockedTrainerRepository {
    let currentDelay = Math.floor(
        Math.random() * (MOCK_DELAY.MAX - MOCK_DELAY.MIN) + MOCK_DELAY.MIN
    );

    const simulateDatabaseDelay = async <T>(result: T): Promise<T> => {
        return new Promise((resolve) => setTimeout(() => resolve(result), currentDelay));
    };

    return {
        trainers,

        async findByEmail(email: string): Promise<Trainer | null> {
            const trainer = this.trainers.find(t => t.email === email) ?? null;
            return simulateDatabaseDelay(trainer);
        },

        async findById(id: string): Promise<Trainer | null> {
            const trainer = this.trainers.find(t => t.id === id) ?? null;
            return simulateDatabaseDelay(trainer);
        },

        async findAll(): Promise<Trainer[]> {
            return simulateDatabaseDelay([...this.trainers]);
        },

        async findByIsActive(isActive: boolean): Promise<Trainer[]> {
            const filtered = this.trainers.filter(t => t.isActive === isActive);
            return simulateDatabaseDelay(filtered);
        },

        async save(trainerDTO: CreateTrainerDTO): Promise<Trainer> {
            const existingTrainerIndex = this.trainers.findIndex(t => t.email === trainerDTO.email);
            if (existingTrainerIndex !== -1) {
                await simulateDatabaseDelay(null);
                this.trainers[existingTrainerIndex] = {
                    ...this.trainers[existingTrainerIndex],
                    ...trainerDTO,
                    id: this.trainers[existingTrainerIndex].id,
                    hireDate: this.trainers[existingTrainerIndex].hireDate,
                    isActive: this.trainers[existingTrainerIndex].isActive
                };

                return this.trainers[existingTrainerIndex];
            }

            const newTrainer: Trainer = {
                ...trainerDTO,
                id: crypto.randomUUID(),
                hireDate: new Date(),
                isActive: true,
            };

            await simulateDatabaseDelay(null);
            this.trainers.push(newTrainer);
            return newTrainer;
        },
    };
}