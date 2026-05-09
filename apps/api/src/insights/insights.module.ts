import { Module } from '@nestjs/common';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { UsersModule } from '../users/users.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [UsersModule, TenantsModule],
  controllers: [InsightsController],
  providers: [InsightsService],
})
export class InsightsModule {}