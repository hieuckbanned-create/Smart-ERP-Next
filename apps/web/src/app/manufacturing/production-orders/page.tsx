'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiBox, FiPlay, FiCheckCircle, FiClock } from 'react-icons/fi';
import AuthGuard from '@/components/layout/AuthGuard';
import { apiClient } from '@/lib/api-client';
import { DataTable, Card, Button, Badge, StatCard } from '@smart-erp/ui';

interface ProductionOrder {
  id: string;
  orderCode: string;
  productName: string;
  quantity: number;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
}

export default function ProductionOrdersPage() {
  const { t } = useTranslation('common');
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/manufacturing/orders');
      setOrders(res.data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      case 'draft':
      default: return 'secondary';
    }
  };

  const columns = [
    { header: t('manufacturing.transfers.code') || 'Mã Lệnh', accessor: 'orderCode' },
    { header: t('products.title'), accessor: 'productName' },
    { 
      header: t('manufacturing.transfers.quantity') || 'Số Lượng', 
      accessor: (row: ProductionOrder) => <span className="font-semibold">{row.quantity}</span> 
    },
    { 
      header: t('manufacturing.transfers.status') || 'Trạng Thái', 
      accessor: (row: ProductionOrder) => (
        <Badge variant={getStatusBadgeVariant(row.status)}>
          {t(`manufacturing.status.${row.status}`)}
        </Badge>
      )
    },
    { 
      header: t('export.createdAt') || 'Ngày Tạo', 
      accessor: (row: ProductionOrder) => new Date(row.createdAt).toLocaleDateString('vi-VN') 
    },
  ];

  const inProgressCount = orders.filter(o => o.status === 'in_progress').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;
  const pendingCount = orders.filter(o => o.status === 'draft').length;

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('manufacturing.productionOrders')}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý lệnh sản xuất, theo dõi tiến độ và kiểm soát chất lượng
            </p>
          </div>
          <Button icon={<FiPlus />}>
            {t('manufacturing.createOrder')}
          </Button>
        </div>

        {/* Dashboards / StatCards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Tổng số lệnh"
            value={orders.length}
            icon={<FiBox className="w-5 h-5" />}
            trend={{ value: 12, isPositive: true }}
            trendLabel="so với tháng trước"
          />
          <StatCard
            title="Đang sản xuất"
            value={inProgressCount}
            icon={<FiPlay className="w-5 h-5 text-blue-500" />}
            className="border-l-4 border-l-blue-500"
          />
          <StatCard
            title="Hoàn thành"
            value={completedCount}
            icon={<FiCheckCircle className="w-5 h-5 text-green-500" />}
            className="border-l-4 border-l-green-500"
          />
          <StatCard
            title="Chờ xử lý (Nháp)"
            value={pendingCount}
            icon={<FiClock className="w-5 h-5 text-gray-500" />}
            className="border-l-4 border-l-gray-500"
          />
        </div>

        {/* Data Table */}
        <Card className="shadow-sm border-gray-200 dark:border-gray-800">
          <DataTable
            data={orders}
            columns={columns}
            loading={loading}
            emptyMessage={t('common.noData')}
          />
        </Card>
      </div>
    </AuthGuard>
  );
}