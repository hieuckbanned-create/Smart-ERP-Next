'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AuthGuard from '@/components/layout/AuthGuard';
import { apiClient } from '@/lib/api-client';
import { formatVND } from '@smart-erp/utils';

interface KPIResult {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalCustomers: number;
  lowStockCount: number;
  productionInProgress: number;
  qualityPassRate: number;
  periodComparison: { revenueChange: number; ordersChange: number; customersChange: number };
}

export default function AnalyticsDashboardPage() {
  const { t } = useTranslation('common');
  const [kpis, setKpis] = useState<KPIResult | null>(null);
  const [revenueChart, setRevenueChart] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kpiRes, chartRes, productsRes] = await Promise.all([
        apiClient.get('/analytics-dashboard/kpis', { params: { period } }),
        apiClient.get('/analytics-dashboard/revenue-chart', { params: { days: 30 } }),
        apiClient.get('/analytics-dashboard/top-products', { params: { limit: 10 } }),
      ]);
      setKpis(kpiRes.data);
      setRevenueChart(chartRes.data || []);
      setTopProducts(productsRes.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const maxRevenue = Math.max(...revenueChart.map((d: any) => Number(d.revenue || 0)), 1);

  return (
    <AuthGuard>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <div className="flex gap-2">
            {(['today', 'week', 'month', 'quarter'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-sm rounded-lg ${period === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">{t('common.loading')}</div>
        ) : kpis && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
              <KPICard label="Revenue" value={formatVND(kpis.totalRevenue)} change={kpis.periodComparison.revenueChange} color="blue" />
              <KPICard label="Orders" value={kpis.totalOrders.toString()} change={kpis.periodComparison.ordersChange} color="green" />
              <KPICard label="Avg Order" value={formatVND(kpis.avgOrderValue)} color="purple" />
              <KPICard label="Customers" value={kpis.totalCustomers.toString()} color="orange" />
              <KPICard label="Low Stock" value={kpis.lowStockCount.toString()} color={kpis.lowStockCount > 0 ? 'red' : 'green'} />
              <KPICard label="In Production" value={kpis.productionInProgress.toString()} color="blue" />
              <KPICard label="Quality Pass" value={`${kpis.qualityPassRate}%`} color={kpis.qualityPassRate >= 80 ? 'green' : 'yellow'} />
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Revenue (30 days)</h2>
              <div className="flex items-end gap-1 h-48">
                {revenueChart.map((d: any, i: number) => {
                  const height = (Number(d.revenue || 0) / maxRevenue) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${d.date}: ${formatVND(d.revenue)}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Top Products</h2>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-right">Sold</th>
                    <th className="px-4 py-2 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {topProducts.map((p: any) => (
                    <tr key={p.id}>
                      <td className="px-4 py-2">{p.name} <span className="text-gray-400">({p.sku})</span></td>
                      <td className="px-4 py-2 text-right">{p.total_sold}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatVND(p.total_revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}

function KPICard({ label, value, change, color }: { label: string; value: string; change?: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'border-blue-500', green: 'border-green-500', purple: 'border-purple-500',
    orange: 'border-orange-500', red: 'border-red-500', yellow: 'border-yellow-500',
  };
  return (
    <div className={`bg-white rounded-xl shadow p-4 border-l-4 ${colorMap[color] || 'border-gray-300'}`}>
      <div className="text-xs text-gray-500 uppercase">{label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
      {change !== undefined && (
        <div className={`text-xs mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </div>
      )}
    </div>
  );
}