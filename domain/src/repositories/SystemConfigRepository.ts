import { SystemConfig } from "../entities/SystemConfig";

export interface SystemConfigRepository {
  getCurrent(): Promise<SystemConfig>;
}