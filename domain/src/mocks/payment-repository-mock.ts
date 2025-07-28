import { Payment, CreatePaymentDTO } from '../entities/Payment';
import { PaymentRepository } from '../repositories/payment-repository';
import { MOCK_DELAY } from './MockDelay';


export interface MockedPaymentRepository extends PaymentRepository {
    payments: Payment[];
}

export function mockPaymentRepository(payments: Payment[] = []): MockedPaymentRepository {
    let currentDelay = Math.floor(
        Math.random() * (MOCK_DELAY.MAX - MOCK_DELAY.MIN) + MOCK_DELAY.MIN
    );

    const simulateDatabaseDelay = async <T>(result: T): Promise<T> => {
        return new Promise((resolve) => setTimeout(() => resolve(result), currentDelay));
    };

    return {
        payments,

        async save(dto: CreatePaymentDTO): Promise<Payment> {
            const payment: Payment = {
                ...dto,
                id: crypto.randomUUID()
            };

            this.payments.push(payment);
            return simulateDatabaseDelay(payment);
        },

        async findByMemberId(memberId: string): Promise<Payment[]> {
            const payments = this.payments.filter(p => p.memberId === memberId);
            return simulateDatabaseDelay([...payments]);
        },

        async findByMemberIdAndMonth(memberId: string, month: Date): Promise<Payment | null> {
            const foundPayment = this.payments.find(
                p =>
                    p.memberId === memberId &&
                    p.paymentDate.getFullYear() === month.getFullYear() &&
                    p.paymentDate.getMonth() === month.getMonth()
            );
            return simulateDatabaseDelay(foundPayment ?? null);
        },

    };
}