import { Module } from '@nestjs/common';
import { HelpdeskController } from './controllers/helpdesk.controller';
import { HelpdeskService } from './services/helpdesk.service';

@Module({
  controllers: [HelpdeskController],
  providers: [HelpdeskService],
  exports: [HelpdeskService],
})
export class HelpdeskModule {}