import { Module } from '@nestjs/common';
import { HrController } from './controllers/hr.controller';
import { HrService } from './services/hr.service';
import { AttendanceController } from './controllers/attendance.controller';
import { AttendanceService } from './services/attendance.service';
import { PayrollController } from './controllers/payroll.controller';
import { PayrollService } from './services/payroll.service';
import { ActivityModule } from '../modules/activity/activity.module';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [ActivityModule, DrizzleModule],
  controllers: [HrController, AttendanceController, PayrollController],
  providers: [HrService, AttendanceService, PayrollService],
  exports: [HrService, AttendanceService, PayrollService],
})
export class HrModule {}