import { Module } from '@nestjs/common';
import { ApprovalsModule } from '../approvals/approvals.module';
import { CommentsModule } from '../comments/comments.module';
import { ChatModule } from '../chat/chat.module';
import { ActivityModule } from './activity/activity.module';
import { ExportPdfModule } from '../export-pdf/export-pdf.module';
import { HealthModule } from '../health/health.module';
import { StatusModule } from '../monitor/status.module';
import { SettingsModule } from '../settings/settings.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { SearchModule } from '../search/search.module';
import { AutomationModule } from '../automation/automation.module';
import { SyncModule } from './sync/sync.module';
import { SocketModule } from '../socket/socket.module';
import { SchedulerModule } from '../scheduler/scheduler.module';
import { ImportModule } from '../import/import.module';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { PrintModule } from '../print/print.module';
import { CustomerPortalModule } from '../customers/customer-portal.module';

@Module({
  imports: [
    ApprovalsModule, CommentsModule, ChatModule, ActivityModule,
    ExportPdfModule, HealthModule, StatusModule,
    SettingsModule, WebhooksModule, SearchModule,
    AutomationModule, SyncModule, SocketModule,
    SchedulerModule, ImportModule, OnboardingModule,
    PrintModule, CustomerPortalModule,
  ],
  exports: [
    ApprovalsModule, CommentsModule, ChatModule, ActivityModule,
    ExportPdfModule, HealthModule, StatusModule,
    SettingsModule, WebhooksModule, SearchModule,
    AutomationModule, SyncModule, SocketModule,
    SchedulerModule, ImportModule, OnboardingModule,
    PrintModule, CustomerPortalModule,
  ],
})
export class InfraModule {}
