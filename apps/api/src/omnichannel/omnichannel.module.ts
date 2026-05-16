import { Module } from '@nestjs/common';
import { OmnichannelController } from './omnichannel.controller';
import { OmnichannelService } from './omnichannel.service';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [OmnichannelController],
  providers: [OmnichannelService],
  exports: [OmnichannelService],
})
export class OmnichannelModule {}
