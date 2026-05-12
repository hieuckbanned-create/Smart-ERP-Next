import { Module } from '@nestjs/common';
import { ChartOfAccountsController } from './chart-of-accounts.controller';
import { JournalEntriesController } from './journal-entries.controller';
import { ChartOfAccountsService } from './chart-of-accounts.service';
import { JournalEntriesService } from './journal-entries.service';

@Module({
  controllers: [ChartOfAccountsController, JournalEntriesController],
  providers: [ChartOfAccountsService, JournalEntriesService],
  exports: [ChartOfAccountsService, JournalEntriesService],
})
export class AccountingModule {}
