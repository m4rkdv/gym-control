import { SystemConfig } from "../entities/SystemConfig";
import { SystemConfigRepository } from "../repositories/system-config-repository";

export interface MockedSystemConfigRepository extends SystemConfigRepository {
  config: SystemConfig;
}

export function mockSystemConfigRepository(
  overrides: Partial<SystemConfig> = {}
): MockedSystemConfigRepository {
  const defaultConfig: SystemConfig = {
    basePrice: 5000,
    gracePeriodDays: 10,
    suspensionMonths: 3,
    updatedAt: new Date('2025-01-01'),
    updatedBy: 'system',
    ...overrides,
  };

  return {
    config: defaultConfig,
    async getCurrent(): Promise<SystemConfig> {
      return Promise.resolve({ ...this.config });
    },
  };
}