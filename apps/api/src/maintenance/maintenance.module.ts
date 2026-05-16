import { Module } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
