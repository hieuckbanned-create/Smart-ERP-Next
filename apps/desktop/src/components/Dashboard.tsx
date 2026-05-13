// Desktop Dashboard Component
import React, { useEffect, useState } from 'react';
import { StatCard } from '@smart-erp/ui';
import { useTranslation } from '@smart-erp/i18n';
import { formatVND } from '@smart-erp/utils';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart,
  Users, Package, RefreshCw
} from 'lucide-react';

interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  totalCustomers: number;
  lowStockCount: number;
}

export function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('http://localhost:3000/insights/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'X-Tenant-ID': localStorage.getItem('tenant_id') || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
          {t('common.refresh')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.todayRevenue')}
          value={formatVND(stats?.todayRevenue || 0)}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          trend={{ value: 12.5, positive: true }}
        />
        <StatCard
          title={t('dashboard.todayOrders')}
          value={(stats?.todayOrders || 0).toLocaleString()}
          icon={<ShoppingCart className="w-6 h-6 text-blue-600" />}
          trend={{ value: 8.2, positive: true }}
        />
        <StatCard
          title={t('dashboard.newCustomers')}
          value={(stats?.totalCustomers || 0).toLocaleString()}
          icon={<Users className="w-6 h-6 text-purple-600" />}
          trend={{ value: 3.1, positive: true }}
        />
        <StatCard
          title={t('dashboard.lowStock')}
          value={(stats?.lowStockCount || 0).toLocaleString()}
          icon={<Package className="w-6 h-6 text-red-600" />}
          variant={stats?.lowStockCount ? 'warning' : 'default'}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('dashboard.recentOrders')}
        </h2>
        <p className="text-gray-400 text-center py-8">
          {t('common.noData')}
        </p>
      </div>
    </div>
  );
}