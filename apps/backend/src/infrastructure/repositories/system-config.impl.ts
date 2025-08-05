import { SystemConfig } from '@gymcontrol/domain/entities/SystemConfig';
import { SystemConfigRepository } from '@gymcontrol/domain/repositories/system-config-repository';
import { SystemConfigModel } from '../database/mongo/models/system-config.model';

export class MongoSystemConfigRepository implements SystemConfigRepository {
    async getCurrent(): Promise<SystemConfig> {
        let config = await SystemConfigModel.findOne();

        if (!config) {
            config = new SystemConfigModel({
                basePrice: 15000,
                gracePeriodDays: 10,
                suspensionMonths: 3,
                updatedBy: 'system'
            });
            await config.save();
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