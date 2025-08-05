import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { SystemConfigModel } from '../../../src/infrastructure/database/mongo/models/system-config.model';
import { MongoSystemConfigRepository } from './system-config.impl';


describe("MongoSystemConfigRepository", () => {
    let mongoServer: MongoMemoryServer;
    let repository: MongoSystemConfigRepository;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create({
            binary: { version: '6.0.5' }
        });
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
        repository = new MongoSystemConfigRepository();
    }, 30000);

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await SystemConfigModel.deleteMany({});
    });

    test("getCurrent creates default config when none exists", async () => {
        const result = await repository.getCurrent();

        expect(result).toBeDefined();
        expect(result.basePrice).toBe(28000);
        expect(result.gracePeriodDays).toBe(10);
        expect(result.suspensionMonths).toBe(3);
        expect(result.updatedBy).toBe('system');
        expect(result.updatedAt).toBeInstanceOf(Date);
    });
});