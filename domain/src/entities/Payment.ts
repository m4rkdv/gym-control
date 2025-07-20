export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  paymentMethod: 'mercadopago' | 'cash' | 'transfer' | 'mercadopago_transfer';
  paymentDate: Date;
  monthsCovered: number;
  isProportional: boolean;
  hasPromotion: boolean;
  promotionId?: string;
}

export type CreatePaymentDTO = Omit<Payment, 'id'>;