import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './activity.entity';
import { QueryActivityDto } from './dto/query-activity.dto';

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

  async findAllPaginated(
    tenantId: string,
    query: QueryActivityDto,
  ): Promise<{ items: ActivityLog[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page, limit, entityType, action, userId, fromDate, toDate } = query;
    const skip = (page - 1) * limit;

    const qb = this.activityRepo.createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .where('log.tenantId = :tenantId', { tenantId });

    if (entityType) qb.andWhere('log.entityType = :entityType', { entityType });
    if (action) qb.andWhere('log.action = :action', { action });
    if (userId) qb.andWhere('log.userId = :userId', { userId });
    if (fromDate) qb.andWhere('log.createdAt >= :fromDate', { fromDate });
    if (toDate) qb.andWhere('log.createdAt <= :toDate', { toDate });

    const [items, total] = await qb
      .orderBy('log.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
