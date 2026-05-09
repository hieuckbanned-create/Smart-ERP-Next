import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('insights')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('dashboard')
  async getDashboardInsights(@Req() req: any) {
    const tenantId = req.tenantId;
    return this.insightsService.getDashboardInsights(tenantId);
  }
}
