import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthMonitorService } from './health-monitor.service';

@Module({
  controllers: [HealthController],
  providers: [HealthMonitorService],
  exports: [HealthMonitorService],
})
export class HealthModule {}