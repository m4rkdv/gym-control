import { Router } from 'express';
import { HealthController } from './health.controller.js';

export class HealthRoutes {
  get routes(): Router {
    const router = Router();
    const controller = new HealthController();

    router.get('/health', controller.checkHealth);

    return router;
  }
}