import { SystemConfig, SystemConfigRepository } from '@gymcontrol/domain';
import { SystemConfigModel } from '../database/mongo/models/system-config.model.js';

export class MongoSystemConfigRepository implements SystemConfigRepository {
    async getCurrent(): Promise<SystemConfig> {
        let config = await SystemConfigModel.findOne();

        if (!config) {
            config = await SystemConfigModel.create({
                basePrice: 28000,
                gracePeriodDays: 10,
                suspensionMonths: 3,
                updatedBy: 'system'
            });
        }

        return {
            basePrice: config.basePrice,
            gracePeriodDays: config.gracePeriodDays,
            suspensionMonths: config.suspensionMonths,
            updatedAt: config.updatedAt,
            updatedBy: config.updatedBy
        };
    }
}