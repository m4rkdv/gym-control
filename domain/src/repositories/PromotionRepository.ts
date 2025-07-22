import { Promotion } from "../entities/Promotion";

export interface PromotionRepository {
  findActiveByMinimumMonths(months: number): Promise<Promotion[]>;
  findById(id: string): Promise<Promotion | null>;
}