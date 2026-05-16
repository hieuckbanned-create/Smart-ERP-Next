import { Module } from '@nestjs/common';
import { HrController } from './controllers/hr.controller';
import { HrService } from './services/hr.service';
import { AttendanceController } from './controllers/attendance.controller';
import { AttendanceService } from './services/attendance.service';
import { PayrollController } from './controllers/payroll.controller';
import { PayrollService } from './services/payroll.service';
import { PerformanceController } from './controllers/performance.controller';
import { PerformanceService } from './services/performance.service';
import { ActivityModule } from '../modules/activity/activity.module';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [ActivityModule, DrizzleModule],
  controllers: [HrController, AttendanceController, PayrollController, PerformanceController],
  providers: [HrService, AttendanceService, PayrollService, PerformanceService],
  exports: [HrService, AttendanceService, PayrollService, PerformanceService],
})
export class HrModule {}