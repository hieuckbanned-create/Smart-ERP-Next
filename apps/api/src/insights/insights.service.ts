import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';

@Injectable()
export class InsightsService {
  constructor(
    private usersService: UsersService,
    private tenantsService: TenantsService,
  ) {}

  async getDashboardInsights(tenantId?: string) {
    // Fetch real data
    const users = await this.usersService.findAll(tenantId);
    const tenants = tenantId ? null : await this.tenantsService.findAll();

    // Calculate metrics
    const totalUsers = users.length;
    const newUsersLast7d = users.filter(u => {
      const daysSince = (Date.now() - new Date(u.createdAt).getTime()) / (1000 * 3600 * 24);
      return daysSince <= 7;
    }).length;

    const insights = [];

    // Rule-based insights (no AI call for MVP)
    if (newUsersLast7d > totalUsers * 0.3) {
      insights.push({
        type: 'growth',
        severity: 'info',
        message: `📈 High user growth: ${newUsersLast7d} new users in the last 7 days (${Math.round(newUsersLast7d/totalUsers*100)}% of total).`,
      });
    } else if (newUsersLast7d === 0 && totalUsers > 5) {
      insights.push({
        type: 'warning',
        severity: 'medium',
        message: '⚠️ No new user registrations in the last 7 days. Consider running a marketing campaign.',
      });
    }

    if (totalUsers < 3 && (Date.now() - new Date(users[0]?.createdAt).getTime()) > 30*24*3600*1000) {
      insights.push({
        type: 'alert',
        severity: 'high',
        message: '🔴 Tenant has only 1‑2 users after 30+ days. Low engagement risk.',
      });
    }

    // Always return some generic insight
    if (insights.length === 0) {
      insights.push({
        type: 'info',
        severity: 'low',
        message: '✅ All metrics look healthy. Keep up the good work!',
      });
    }

    return {
      insights,
      metrics: {
        totalUsers,
        newUsersLast7d,
        totalTenants: tenants?.length || 1,
      },
      generatedAt: new Date().toISOString(),
    };
  }
}
