import { SystemConfig } from '@gymcontrol/domain/entities/SystemConfig';
import { SystemConfigRepository } from '@gymcontrol/domain/repositories/system-config-repository';
import { SystemConfigModel } from '../database/mongo/models/system-config.model';

export class MongoSystemConfigRepository implements SystemConfigRepository {
    async getCurrent(): Promise<SystemConfig> {
        const defaultConfig = new SystemConfigModel({
            basePrice: 28000,
            gracePeriodDays: 10,
            suspensionMonths: 3,
            updatedBy: 'system'
        });
        const config = await defaultConfig.save();

        return {
            basePrice: config.basePrice,
            gracePeriodDays: config.gracePeriodDays,
            suspensionMonths: config.suspensionMonths,
            updatedAt: config.updatedAt,
            updatedBy: config.updatedBy
        };
    }
}