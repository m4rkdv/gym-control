import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Types } from 'mongoose';
import { PaymentModel } from '../database/mongo/models/payment.model';
import { MongoPaymentRepository } from './payment.repository.impl';
import { Payment } from '../../../../../domain/src/entities/Payment';



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
});