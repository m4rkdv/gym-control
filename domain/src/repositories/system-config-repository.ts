import { SystemConfig } from "../entities/SystemConfig.js";

export interface SystemConfigRepository {
  getCurrent(): Promise<SystemConfig>;
}