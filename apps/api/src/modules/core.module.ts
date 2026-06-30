import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { TenantsModule } from '../tenants/tenants.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    AuthModule, UsersModule, TenantsModule, NotificationsModule,
  ],
  exports: [
    AuthModule, UsersModule, TenantsModule, NotificationsModule,
  ],
})
export class CoreModule {}
