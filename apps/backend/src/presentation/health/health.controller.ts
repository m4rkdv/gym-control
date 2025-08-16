import { Request, Response } from 'express';

export class HealthController {
  checkHealth = (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'gymcontrol-backend',
      uptime: process.uptime()
    });
  };
}