import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Types } from 'mongoose';
import { MemberModel } from '../database/mongo/models/member.model';
import { MongoMemberRepository } from './member.repository.impl';
import { CreateMemberDTO, Member, UpdateMemberDTO } from '@gymcontrol/domain';

describe("MongoMemberRepository", () => {
    let mongoServer: MongoMemoryServer;
    let repository: MongoMemberRepository;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create({
            binary: {
                version: '6.0.5',
            },
        });
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
        repository = new MongoMemberRepository();
    }), 30000;

    afterAll(async () => {
        await mongoose.disconnect();
        if (mongoServer) {
            await mongoServer.stop();
        }
    });

    test("save - newMember returns with generated id", async () => {
        // newMember test input 
        const newMember: Omit<Member, 'id'> = {
            firstName: "Jon",
            lastName: "Snow",
            email: "jon.snow@winter.com",
            weight: 80,
            age: 25,
            joinDate: new Date(),
            membershipStatus: "active",
            paidUntil: new Date(),
        };

        // clean mongo in memory db
        await MemberModel.deleteMany({});

        const result = await repository.save(newMember);

        expect(result).toHaveProperty('id');
        expect(result.id).toBeTruthy();
        expect(result.firstName).toBe("Jon");
        expect(result.lastName).toBe("Snow");
        expect(result.email).toBe("jon.snow@winter.com");
    });

    test("findById - unknown memberId returns null", async () => {
        // Limpiar DB antes del test
        await MemberModel.deleteMany({});
        const memberId = new Types.ObjectId().toString();

        const result = await repository.findById(memberId);
        expect(result).toBeNull();
    });

    test("findById - existingMember ID returns memberFound", async () => {
        //existingMember test data
        const existingMember: Omit<Member, 'id'> = {
            firstName: "Arya",
            lastName: "Stark",
            email: "arya.stark@winterfell.com",
            weight: 50,
            age: 18,
            joinDate: new Date(),
            membershipStatus: "active",
            paidUntil: new Date(),
        };

        await MemberModel.deleteMany({});
        const savedMember = await repository.save(existingMember);

        const result = await repository.findById(savedMember.id);

        expect(result).not.toBeNull();
        expect(result?.id).toBe(savedMember.id);
        expect(result?.firstName).toBe("Arya");
        expect(result?.lastName).toBe("Stark");
    });

    test("findByEmail - unknown member returns null", async () => {
        //Clean bd before testing
        await MemberModel.deleteMany({});

        const result = await repository.findByEmail('nonexistent@example.com');
        expect(result).toBeNull();
    });

    test("findByEmail -  existingMember EMAIL returns memberFound", async () => {
        const existingMember: Omit<Member, 'id'> = {
            firstName: "daenerys",
            lastName: "targaryen",
            email: "dany@dragon.com",
            weight: 55,
            age: 22,
            joinDate: new Date(),
            membershipStatus: "active",
            paidUntil: new Date(),
        };

        //clean bd and add testMember
        await MemberModel.deleteMany({});
        await repository.save(existingMember);

        const result = await repository.findByEmail("dany@dragon.com");

        expect(result).not.toBeNull();
        expect(result?.email).toBe("dany@dragon.com");
        expect(result?.firstName).toBe("daenerys");
        expect(result?.lastName).toBe("targaryen");
    });

    test("findByEmail - different email does not return member", async () => {
        const existingMember: Omit<Member, 'id'> = {
            firstName: "Tyrion",
            lastName: "Lannister",
            email: "tyrion@lion.com",
            weight: 45,
            age: 32,
            joinDate: new Date(),
            membershipStatus: "active",
            paidUntil: new Date(),
        };

        await MemberModel.deleteMany({});
        await repository.save(existingMember);

        const result = await repository.findByEmail("jaime@bro.com");

        expect(result).toBeNull();
    });

    test("save - updating existing member returns updated document", async () => {
        const originalMember: Omit<Member, 'id'> = {
            firstName: "Ned",
            lastName: "Stark",
            email: "ned@winterfell.com",
            weight: 75,
            age: 45,
            joinDate: new Date(),
            membershipStatus: "active",
            paidUntil: new Date(),
        };

        await MemberModel.deleteMany({});
        const savedMember = await repository.save(originalMember);

        const updatedData: Member = {
            ...savedMember,
            firstName: "Eddard",
            age: 46,
            weight: 76,
        };

        const result = await repository.save(updatedData);

        expect(result.id).toBe(savedMember.id);
        expect(result.firstName).toBe("Eddard");
        expect(result.age).toBe(46);
        expect(result.weight).toBe(76);
    });

    test("save - non-existent id throws error", async () => {
        const fakeMember: Member = {
            id: new Types.ObjectId().toString(),
            firstName: "Ghost",
            lastName: "Direwolf",
            email: "ghost@north.com",
            weight: 50,
            age: 5,
            joinDate: new Date(),
            membershipStatus: "active",
            paidUntil: new Date(),
        };

        await MemberModel.deleteMany({});

        await expect(repository.save(fakeMember))
            .rejects
            .toThrow(`Member with id ${fakeMember.id} not found`);
    });

    describe("Create method .-", () => {
        test("create - new member with valid data returns saved member", async () => {
            const newMemberDTO: CreateMemberDTO = {
                firstName: "Jon",
                lastName: "Snow",
                email: "jon@winterfell.com",
                weight: 75,
                age: 25,
                joinDate: new Date("2025-01-15"),
            };

            await MemberModel.deleteMany({});
            const result = await repository.create(newMemberDTO);

            expect(result.id).toBeDefined();
            expect(result.firstName).toBe("Jon");
            expect(result.lastName).toBe("Snow");
            expect(result.email).toBe("jon@winterfell.com");
            expect(result.weight).toBe(75);
            expect(result.age).toBe(25);
            expect(result.joinDate).toEqual(new Date("2025-01-15"));
            expect(result.membershipStatus).toBe("inactive");
            expect(result.paidUntil).toEqual(new Date(0));
        });

        test("create - member is persisted in database", async () => {
            const newMemberDTO: CreateMemberDTO = {
                firstName: "Arya",
                lastName: "Stark",
                email: "arya@winterfell.com",
                weight: 55,
                age: 18,
                joinDate: new Date("2025-02-20"),
            };

            await MemberModel.deleteMany({});
            const savedMember = await repository.create(newMemberDTO);

            // Verify it's actually in the database
            const foundInDb = await MemberModel.findById(savedMember.id);
            expect(foundInDb).not.toBeNull();
            expect(foundInDb?.firstName).toBe("Arya");
            expect(foundInDb?.email).toBe("arya@winterfell.com");
            expect(foundInDb?.membershipStatus).toBe("inactive");
        });

        test("create - sets default values correctly", async () => {
            const newMemberDTO: CreateMemberDTO = {
                firstName: "Sansa",
                lastName: "Stark",
                email: "sansa@winterfell.com",
                weight: 60,
                age: 22,
                joinDate: new Date(),
            };

            await MemberModel.deleteMany({});
            const result = await repository.create(newMemberDTO);

            expect(result.membershipStatus).toBe("inactive");
            expect(result.paidUntil.getTime()).toBe(0); // new Date(0)
        });
    });

    describe("Update method .-", () => {
        test("update - existing member with valid updates returns updated member", async () => {
            // First create a member
            const originalMember: CreateMemberDTO = {
                firstName: "Bran",
                lastName: "Stark",
                email: "bran@winterfell.com",
                weight: 50,
                age: 16,
                joinDate: new Date("2025-01-01"),
            };

            await MemberModel.deleteMany({});
            const savedMember = await repository.create(originalMember);

            // Now update it
            const updates: UpdateMemberDTO = {
                firstName: "Brandon",
                weight: 55,
                membershipStatus: "active",
                paidUntil: new Date("2025-12-31"),
            };

            const result = await repository.update(savedMember.id, updates);

            expect(result.id).toBe(savedMember.id);
            expect(result.firstName).toBe("Brandon"); // Updated
            expect(result.lastName).toBe("Stark"); // Unchanged
            expect(result.email).toBe("bran@winterfell.com"); // Unchanged
            expect(result.weight).toBe(55); // Updated
            expect(result.age).toBe(16); // Unchanged
            expect(result.membershipStatus).toBe("active"); // Updated
            expect(result.paidUntil).toEqual(new Date("2025-12-31")); // Updated
            expect(result.joinDate).toEqual(new Date("2025-01-01")); // Unchanged (can't be updated)
        });

        test("update - partial updates only change specified fields", async () => {
            const originalMember: CreateMemberDTO = {
                firstName: "Catelyn",
                lastName: "Stark",
                email: "catelyn@winterfell.com",
                weight: 65,
                age: 40,
                joinDate: new Date("2025-01-01"),
            };

            await MemberModel.deleteMany({});
            const savedMember = await repository.create(originalMember);

            // Update only weight and status
            const updates: UpdateMemberDTO = {
                weight: 63,
                membershipStatus: "active",
            };

            const result = await repository.update(savedMember.id, updates);

            expect(result.firstName).toBe("Catelyn"); // Unchanged
            expect(result.lastName).toBe("Stark"); // Unchanged
            expect(result.email).toBe("catelyn@winterfell.com"); // Unchanged
            expect(result.weight).toBe(63); // Updated
            expect(result.age).toBe(40); // Unchanged
            expect(result.membershipStatus).toBe("active"); // Updated
            expect(result.paidUntil).toEqual(new Date(0)); // Unchanged
        });

        test("update - changes are persisted in database", async () => {
            const originalMember: CreateMemberDTO = {
                firstName: "Robb",
                lastName: "Stark",
                email: "robb@winterfell.com",
                weight: 80,
                age: 20,
                joinDate: new Date(),
            };

            await MemberModel.deleteMany({});
            const savedMember = await repository.create(originalMember);

            const updates: UpdateMemberDTO = {
                firstName: "Rob",
                membershipStatus: "active",
            };

            await repository.update(savedMember.id, updates);

            // Verify changes in database
            const foundInDb = await MemberModel.findById(savedMember.id);
            expect(foundInDb?.firstName).toBe("Rob");
            expect(foundInDb?.membershipStatus).toBe("active");
            expect(foundInDb?.lastName).toBe("Stark"); // Unchanged
        });

        test("update - non-existent member throws error", async () => {
            const fakeId = new Types.ObjectId().toString();
            const updates: UpdateMemberDTO = {
                firstName: "Ghost",
            };

            await MemberModel.deleteMany({});

            await expect(repository.update(fakeId, updates))
                .rejects
                .toThrow(`Member with id ${fakeId} not found`);
        });

        test("update - empty updates object returns unchanged member", async () => {
            const originalMember: CreateMemberDTO = {
                firstName: "Rickon",
                lastName: "Stark",
                email: "rickon@winterfell.com",
                weight: 45,
                age: 12,
                joinDate: new Date("2024-01-01"),
            };

            await MemberModel.deleteMany({});
            const savedMember = await repository.create(originalMember);

            const emptyUpdates: UpdateMemberDTO = {};
            const result = await repository.update(savedMember.id, emptyUpdates);

            expect(result).toEqual(savedMember);
        });
    });
});