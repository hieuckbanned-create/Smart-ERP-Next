import { Controller, Get } from '@nestjs/common';
import { HealthMonitorService } from './health-monitor.service';

@Controller('health')
export class HealthController {
  constructor(private readonly service: HealthMonitorService) {}

  @Get()
  async getHealth() {
    return this.service.getHealth();
  }

  @Get('ready')
  async getReadiness() {
    const health = await this.service.getHealth();
    return {
      ready: health.status !== 'down',
      status: health.status,
    };
  }

  @Get('live')
  async getLiveness() {
    return { alive: true };
  }
}