import { Module } from '@nestjs/common';
import { AccountingModule } from '../accounting/accounting.module';
import { FixedAssetsModule } from '../fixed-assets/fixed-assets.module';

@Module({
  imports: [AccountingModule, FixedAssetsModule],
  exports: [AccountingModule, FixedAssetsModule],
})
export class FinanceModule {}
