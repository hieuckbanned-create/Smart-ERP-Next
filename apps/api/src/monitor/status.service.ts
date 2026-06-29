import { Injectable } from '@nestjs/common';
import { db } from '@smart-erp/database';
import { sql } from '@smart-erp/database/drizzle';

@Injectable()
export class StatusService {
  private readonly startTime = Date.now();

  async getSystemStatus(): Promise<{ version: string; uptime: number; dbStatus: 'healthy' | 'unhealthy'; timestamp: string }> {
    let dbStatus: 'healthy' | 'unhealthy' = 'healthy';
    try {
      await db.execute(sql`SELECT 1`);
    } catch {
      dbStatus = 'unhealthy';
    }

    return {
      version: process.env.npm_package_version || '0.0.0',
      uptime: Math.round((Date.now() - this.startTime) / 1000),
      dbStatus,
      timestamp: new Date().toISOString(),
    };
  }

  async getPrometheusMetrics(): Promise<string> {
    const status = await this.getSystemStatus();
    const dbHealthy = status.dbStatus === 'healthy' ? 1 : 0;

    return [
      '# HELP smart_erp_status_db_healthy Database health from Smart ERP status check (1 healthy, 0 unhealthy).',
      '# TYPE smart_erp_status_db_healthy gauge',
      `smart_erp_status_db_healthy ${dbHealthy}`,
      '# HELP smart_erp_uptime_seconds Smart ERP API process uptime in seconds.',
      '# TYPE smart_erp_uptime_seconds gauge',
      `smart_erp_uptime_seconds ${status.uptime}`,
      '',
    ].join('\n');
  }
}
