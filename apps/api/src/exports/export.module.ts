import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { DataExportService } from './data-export.service';

@Module({
  controllers: [ExportController],
  providers: [DataExportService],
  exports: [DataExportService],
})
export class ExportModule {}