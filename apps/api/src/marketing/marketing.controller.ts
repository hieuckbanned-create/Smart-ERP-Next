import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Marketing Automation')
@UseGuards(JwtAuthGuard)
@Controller('marketing')
export class MarketingController {
  constructor(private readonly service: MarketingService) {}

  @ApiOperation({ summary: 'Get campaign performance' })
  @Get('campaigns')
  getCampaigns(@Request() req: any) {
    return this.service.getCampaignPerformance(req.user.tenantId);
  }

  @ApiOperation({ summary: 'Get customer segments' })
  @Get('segments')
  getSegments(@Request() req: any) {
    return this.service.getSegments(req.user.tenantId);
  }

  @ApiOperation({ summary: 'Create marketing campaign' })
  @Post('campaigns')
  createCampaign(@Request() req: any, @Body() body: any) {
    return this.service.createCampaign(req.user.tenantId, body);
  }

  @ApiOperation({ summary: 'Track lead event (Score impact)' })
  @Post('leads/:id/track')
  trackEvent(@Request() req: any, @Param('id') id: string, @Body() body: { event: string }) {
    return this.service.processEvent(req.user.tenantId, id, body.event);
  }
}
