import { Module } from '@nestjs/common';
import { FixedAssetsController } from './controllers/fixed-assets.controller';
import { FixedAssetsService } from './services/fixed-assets.service';

@Module({
  controllers: [FixedAssetsController],
  providers: [FixedAssetsService],
  exports: [FixedAssetsService],
})
export class FixedAssetsModule {}