import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { ActivityModule } from '../../modules/activity/activity.module';
import { NotificationsModule } from '../../notifications/notifications.module';

@Module({
  imports: [ActivityModule, NotificationsModule],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class CrmLeadsModule {}