import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('pull')
  async pull(@Request() req: any, @Body() body: any) {
    return this.syncService.pull(req.user.tenantId, body.clientId, body.vectorClock);
  }

  @Post('push')
  async push(@Request() req: any, @Body() body: any) {
    return this.syncService.push(req.user.tenantId, body.clientId, body.changes);
  }

  @Post('resolve')
  async resolve(@Request() req: any, @Body() body: { entityType: string; entityId: string; chosenVersion: any }) {
    return this.syncService.resolveConflict(req.user.tenantId, body.entityType, body.entityId, body.chosenVersion);
  }
}
