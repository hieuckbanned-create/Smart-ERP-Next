import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { PerformanceService } from '../services/performance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('HR Performance')
@UseGuards(JwtAuthGuard)
@Controller('hr/performance')
export class PerformanceController {
  constructor(private readonly service: PerformanceService) {}

  @ApiOperation({ summary: 'Get current user KPIs' })
  @Get('my-kpis')
  getMyKPIs(@Request() req: any, @Query('period') period?: string) {
    return this.service.getEmployeeKPIs(req.user.tenantId, req.user.sub, period);
  }

  @ApiOperation({ summary: 'Get employee KPIs (for managers)' })
  @Get('employee/:id/kpis')
  getEmployeeKPIs(@Request() req: any, @Param('id') id: string, @Query('period') period?: string) {
    return this.service.getEmployeeKPIs(req.user.tenantId, id, period);
  }

  @ApiOperation({ summary: 'Update KPI progress' })
  @Patch('kpis/:targetId')
  updateProgress(@Request() req: any, @Param('targetId') targetId: string, @Body() body: { actualValue: number }) {
    return this.service.updateKpiProgress(req.user.tenantId, req.user.sub, targetId, body.actualValue);
  }

  @ApiOperation({ summary: 'Create performance review' })
  @Post('reviews')
  createReview(@Request() req: any, @Body() body: any) {
    return this.service.createPerformanceReview(req.user.tenantId, body);
  }
}
