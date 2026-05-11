import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ActivityService } from './activity.service';

@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('recent')
  async getRecentActivities(@CurrentUser('tenantId') tenantId: string) {
    const items = await this.activityService.getRecentActivities(tenantId, 10);
    return { items };
  }
}
