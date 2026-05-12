import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ActivityService } from './activity.service';
import { QueryActivityDto } from './dto/query-activity.dto';

@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryActivityDto,
  ) {
    return this.activityService.findAllPaginated(tenantId, query);
  }

  @Get('recent')
  async getRecentActivities(@CurrentUser('tenantId') tenantId: string) {
    const items = await this.activityService.getRecentActivities(tenantId, 10);
    return { items };
  }
}
