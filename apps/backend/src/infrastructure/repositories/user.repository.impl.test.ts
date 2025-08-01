import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Types } from 'mongoose';
import { UserModel } from '../database/mongo/models/user.model';
import { MongoUserRepository } from './user.repository.impl';
import { User } from '../../../../../domain/src/entities/User';


describe("MongoUserRepository", () => {
    let mongoServer: MongoMemoryServer;
    let repository: MongoUserRepository;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
        repository = new MongoUserRepository();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test("save - newUser returns with generated id", async () => {
        const newUser: Omit<User, 'id'> = {
            userName: "jon_snow",
            password: "ghost123",
            role: "member",
            memberId: new Types.ObjectId().toString(),
            trainerId: "",
            createdAt: new Date(),
            isActive: true
        };

        await UserModel.deleteMany({});
        const result = await repository.save(newUser);

        expect(result).toHaveProperty('id');
        expect(result.id).toBeTruthy();
        expect(result.userName).toBe("jon_snow");
        expect(result.role).toBe("member");
    });

    test("findById - unknown userId returns null", async () => {
        //clean mongo db
        await UserModel.deleteMany({});
        const userId = new Types.ObjectId().toString();

        const result = await repository.findById(userId);
        expect(result).toBeNull();
    });

    test("findById - existingUser ID returns userFound", async () => {
        const existingUser: Omit<User, 'id'> = {
            userName: "arya_stark",
            password: "noone",
            role: "member",
            memberId: new Types.ObjectId().toString(),
            createdAt: new Date(),
            isActive: true
        };

        await UserModel.deleteMany({});
        const savedUser = await repository.save(existingUser);

        const result = await repository.findById(savedUser.id);

        expect(result).not.toBeNull();
        expect(result?.id).toBe(savedUser.id);
        expect(result?.userName).toBe("arya_stark");
        expect(result?.role).toBe("member");
    });

    test("findByUserName - unknown userName returns null", async () => {
        await UserModel.deleteMany({});

        const result = await repository.findByUserName('nonexistent_user');
        expect(result).toBeNull();
    });

    test("findByUserName - existingUser userName returns userFound", async () => {
        const existingUser: Omit<User, 'id'> = {
            userName: "coach-dany",
            password: "dracarys",
            role: "trainer",
            trainerId: new Types.ObjectId().toString(),
            createdAt: new Date(),
            isActive: true
        };

        await UserModel.deleteMany({});
        await repository.save(existingUser);

        const result = await repository.findByUserName("coach-dany");

        expect(result).not.toBeNull();
        expect(result?.userName).toBe("coach-dany");
        expect(result?.role).toBe("trainer");
    });

    test("findByTrainerId - unknown trainerId returns null", async () => {
        await UserModel.deleteMany({});
        const trainerId = new Types.ObjectId().toString();

        const result = await repository.findByTrainerId(trainerId);
        expect(result).toBeNull();
    });

    test("findByTrainerId - existingUser trainerId returns userFound", async () => {
        const trainerId = new Types.ObjectId().toString();
        const existingUser: Omit<User, 'id'> = {
            userName: "kingslayer",
            password: "goldenhand",
            role: "trainer",
            trainerId: trainerId,
            createdAt: new Date(),
            isActive: true
        };

        await UserModel.deleteMany({});
        await repository.save(existingUser);

        const result = await repository.findByTrainerId(trainerId);

        expect(result).not.toBeNull();
        expect(result?.trainerId).toBe(trainerId);
        expect(result?.userName).toBe("kingslayer");
    });

    test("findByUserName - different userName does not return user", async () => {
        const existingUser: Omit<User, 'id'> = {
            userName: "tyrion_lannister",
            password: "drinkandknowthings",
            role: "admin",
            createdAt: new Date(),
            isActive: true
        };

        await UserModel.deleteMany({});
        await repository.save(existingUser);

        const result = await repository.findByUserName("littlefinger");

        expect(result).toBeNull();
    });
});