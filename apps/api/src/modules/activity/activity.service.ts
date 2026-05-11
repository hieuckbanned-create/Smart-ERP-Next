import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './activity-log.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityRepo: Repository<ActivityLog>,
  ) {}

  async getRecentActivities(tenantId: string, limit = 10): Promise<ActivityLog[]> {
    return this.activityRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }

  async log(
    tenantId: string,
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    details?: Record<string, any>,
  ): Promise<ActivityLog> {
    const activity = this.activityRepo.create({
      tenantId,
      userId,
      action,
      entityType,
      entityId,
      details,
    });
    return this.activityRepo.save(activity);
  }
}
