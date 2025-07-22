export interface Promotion {
  id: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  minimumMonths: number;
  isActive: boolean;
  validFrom: Date;
  validUntil?: Date;
}

export type CreatePromotionDTO = Omit<Promotion, 'id'>;