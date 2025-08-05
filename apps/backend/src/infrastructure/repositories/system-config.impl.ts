import { SystemConfig } from '@gymcontrol/domain/entities/SystemConfig';
import { SystemConfigRepository } from '@gymcontrol/domain/repositories/system-config-repository';
import { SystemConfigModel } from '../database/mongo/models/system-config.model';

export class MongoSystemConfigRepository implements SystemConfigRepository {
  async getCurrent(): Promise<SystemConfig> {
    throw new Error('Method not implemented');
  }
}