import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('insights')
@UseGuards(JwtAuthGuard)
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('dashboard')
  getDashboardInsights(@Request() req: any) {
    return this.insightsService.getDashboardInsights(req.user.tenantId);
  }
}
