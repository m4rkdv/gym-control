export interface SystemConfig {
  basePrice: number;
  gracePeriodDays: number; // Pay grace period (default: 10)
  suspensionMonths: number; // month until Auto-suspension (default: 3)
  updatedAt: Date;
  updatedBy: string;
}

export type UpdateSystemConfigDTO = Omit<SystemConfig, 'id' | 'updatedAt' | 'updatedBy'>;