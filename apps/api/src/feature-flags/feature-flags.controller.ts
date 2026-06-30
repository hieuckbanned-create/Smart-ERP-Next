import { Controller, Get, Patch, Param, Body, Request, UseGuards } from '@nestjs/common';
import { FeatureFlagsService } from './feature-flags.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('feature-flags')
export class FeatureFlagsController {
  constructor(private readonly service: FeatureFlagsService) {}

  @Get()
  async getAllFlags(@Request() req: any) {
    return this.service.getAllFlags(req.user.tenantId);
  }

  @Get(':key')
  async getFlag(@Request() req: any, @Param('key') key: string) {
    const enabled = await this.service.isEnabled(req.user.tenantId, key);
    return { flagKey: key, enabled };
  }

  @Patch(':key')
  async setFlag(@Request() req: any, @Param('key') key: string, @Body() body: { enabled: boolean }) {
    await this.service.setFlag(req.user.tenantId, key, body.enabled, req.user.sub);
  }
}
