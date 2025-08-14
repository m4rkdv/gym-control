import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Types } from 'mongoose';
import { PaymentModel } from '../database/mongo/models/payment.model';
import { MongoPaymentRepository } from './payment.repository.impl';
import { Payment } from '@gymcontrol/domain';



describe("MongoPaymentRepository", () => {
    let mongoServer: MongoMemoryServer;
    let repository: MongoPaymentRepository;

    const createTestPayment = (memberId: string, months = 1): Omit<Payment, 'id'> => ({
        memberId,
        amount: 28000.00,
        paymentMethod: "mercadopago",
        paymentDate: new Date(),
        monthsCovered: months,
        isProportional: false,
        hasPromotion: false,
        promotionId: undefined
    });

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create({
            binary: { version: '6.0.5' }
        });
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
        repository = new MongoPaymentRepository();
    }, 30000);

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await PaymentModel.deleteMany({});
    });

    test("save payment creates new document with generated ID", async () => {
        const paymentData = createTestPayment(new Types.ObjectId().toString());

        const result = await repository.save(paymentData);

        expect(result).toHaveProperty('id');
        expect(result.id).toBeTruthy();
        expect(result.amount).toBe(28000.00);
        expect(result.paymentMethod).toBe("mercadopago");
    });

    test("findByMemberId with no payments returns empty array", async () => {
        const memberId = new Types.ObjectId().toString();
        const result = await repository.findByMemberId(memberId);
        expect(result).toEqual([]);
    });

    test("findByMemberId returns all payments for specific member", async () => {
        const memberId1 = new Types.ObjectId().toString();
        const memberId2 = new Types.ObjectId().toString();

        await repository.save(createTestPayment(memberId1));
        await repository.save(createTestPayment(memberId1, 2));
        await repository.save(createTestPayment(memberId2));

        const result = await repository.findByMemberId(memberId1);
        expect(result).toHaveLength(2);
    });

    test("findByMemberIdAndMonth returns payment within specific month", async () => {
        const memberId = new Types.ObjectId().toString();
        const testDate = new Date('2025-06-15');

        // create pay in june
        await repository.save({
            ...createTestPayment(memberId),
            paymentDate: testDate
        });

        const result = await repository.findByMemberIdAndMonth(memberId, testDate);

        expect(result).not.toBeNull();
        expect(result?.memberId).toBe(memberId);
        expect(result?.paymentDate.getMonth()).toBe(5); // June is 5 (0-indexed)
    });

    test("findByMemberIdAndMonth returns null when no payment in month", async () => {
        const memberId = new Types.ObjectId().toString();
        const testDate = new Date('2025-06-15');

        await repository.save({
            ...createTestPayment(memberId),
            paymentDate: new Date('2025-07-01')
        });

        const result = await repository.findByMemberIdAndMonth(memberId, testDate);

        expect(result).toBeNull();
    });

    test("save preserves all payment properties correctly", async () => {
        const paymentData: Omit<Payment, 'id'> = {
            memberId: new Types.ObjectId().toString(),
            amount: 14000.50,
            paymentMethod: "cash",
            paymentDate: new Date('2025-07-20'),
            monthsCovered: 3,
            isProportional: true,
            hasPromotion: true,
            promotionId: "promo-123"
        };
        
        const result = await repository.save(paymentData);
        
        expect(result.amount).toBe(14000.50);
        expect(result.paymentMethod).toBe("cash");
        expect(result.monthsCovered).toBe(3);
        expect(result.isProportional).toBe(true);
        expect(result.hasPromotion).toBe(true);
        expect(result.promotionId).toBe("promo-123");
    });
});