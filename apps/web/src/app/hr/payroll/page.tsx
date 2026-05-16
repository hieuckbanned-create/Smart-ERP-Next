'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiDollarSign, FiUsers, FiClock, FiCheckCircle, FiDownload, FiPlay } from 'react-icons/fi';
import AuthGuard from '@/components/layout/AuthGuard';
import { Card, Button, Badge, DataTable, StatCard } from '@smart-erp/ui';

interface PayrollRecord {
  id: string;
  employeeName: string;
  department: string;
  baseSalary: number;
  allowances: number;
  overtime: number;
  deductions: number;
  netSalary: number;
  status: 'draft' | 'approved' | 'paid';
}

export default function PayrollPage() {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState('2026-05');
  const [records, setRecords] = useState<PayrollRecord[]>([
    {
      id: 'EMP-001',
      employeeName: 'Nguyễn Văn A',
      department: 'Phát triển phần mềm',
      baseSalary: 25000000,
      allowances: 2000000,
      overtime: 1500000,
      deductions: 2650000,
      netSalary: 25850000,
      status: 'approved'
    },
    {
      id: 'EMP-002',
      employeeName: 'Trần Thị B',
      department: 'Kinh doanh',
      baseSalary: 18000000,
      allowances: 3000000,
      overtime: 0,
      deductions: 1800000,
      netSalary: 19200000,
      status: 'paid'
    },
    {
      id: 'EMP-003',
      employeeName: 'Lê Minh C',
      department: 'Marketing',
      baseSalary: 20000000,
      allowances: 1500000,
      overtime: 500000,
      deductions: 2100000,
      netSalary: 19900000,
      status: 'draft'
    }
  ]);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge variant="success" icon={<FiCheckCircle />}>{t('hr.payroll.paid') || 'Đã thanh toán'}</Badge>;
      case 'approved': return <Badge variant="primary" icon={<FiCheckCircle />}>{t('hr.payroll.approved') || 'Đã duyệt'}</Badge>;
      case 'draft': return <Badge variant="secondary">{t('hr.payroll.draft') || 'Bản nháp'}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleProcessPayroll = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRecords(prev => prev.map(r => r.status === 'draft' ? { ...r, status: 'approved' } : r));
    }, 1500);
  };

  const columns = [
    { 
      header: t('hr.payroll.employee') || 'Nhân viên', 
      accessor: (row: PayrollRecord) => (
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{row.employeeName}</div>
          <div className="text-xs text-gray-500">{row.department}</div>
        </div>
      )
    },
    { header: t('hr.payroll.baseSalary') || 'Lương cơ bản', accessor: (row: PayrollRecord) => formatVND(row.baseSalary) },
    { header: t('hr.payroll.allowances') || 'Phụ cấp', accessor: (row: PayrollRecord) => <span className="text-green-600">+{formatVND(row.allowances)}</span> },
    { header: t('hr.payroll.overtime') || 'Làm thêm (OT)', accessor: (row: PayrollRecord) => <span className="text-green-600">+{formatVND(row.overtime)}</span> },
    { header: t('hr.payroll.deductions') || 'Khấu trừ (BH, Thuế)', accessor: (row: PayrollRecord) => <span className="text-red-600">-{formatVND(row.deductions)}</span> },
    { 
      header: t('hr.payroll.netSalary') || 'Thực lãnh', 
      accessor: (row: PayrollRecord) => <span className="font-bold text-blue-600">{formatVND(row.netSalary)}</span>
    },
    { 
      header: t('hr.payroll.status') || 'Trạng thái', 
      accessor: (row: PayrollRecord) => getStatusBadge(row.status)
    },
  ];

  const totalPayroll = records.reduce((sum, r) => sum + r.netSalary, 0);

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('hr.payroll.title') || 'Quản lý Lương & Thưởng (Payroll)'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {t('hr.payroll.subtitle') || 'Tính lương tự động, tích hợp chấm công và thuế.'}
            </p>
          </div>
          <div className="flex gap-2">
            <input 
              type="month" 
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <Button icon={<FiDownload />} variant="outline">
              {t('common.export') || 'Xuất Excel'}
            </Button>
            <Button 
              icon={<FiPlay />} 
              variant="primary" 
              loading={loading}
              onClick={handleProcessPayroll}
            >
              {t('hr.payroll.process') || 'Chạy tính lương'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title={t('hr.payroll.totalEmployees') || 'Nhân sự tính lương'}
            value={records.length}
            icon={<FiUsers className="w-5 h-5 text-blue-500" />}
          />
          <StatCard
            title={t('hr.payroll.totalNet') || 'Tổng quỹ lương'}
            value={formatVND(totalPayroll)}
            icon={<FiDollarSign className="w-5 h-5 text-green-500" />}
            className="border-l-4 border-l-green-500"
          />
          <StatCard
            title={t('hr.payroll.totalOT') || 'Tổng OT'}
            value={formatVND(records.reduce((sum, r) => sum + r.overtime, 0))}
            icon={<FiClock className="w-5 h-5 text-orange-500" />}
          />
          <StatCard
            title={t('hr.payroll.totalDeductions') || 'BHXH & Thuế'}
            value={formatVND(records.reduce((sum, r) => sum + r.deductions, 0))}
            icon={<FiDollarSign className="w-5 h-5 text-red-500" />}
          />
        </div>

        <Card className="shadow-sm border-gray-200 dark:border-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold">{t('hr.payroll.salaryBoard') || 'Bảng lương chi tiết'} - {currentMonth}</h3>
          </div>
          <DataTable
            data={records}
            columns={columns}
            emptyMessage={t('common.noData') || 'Chưa có dữ liệu tính lương tháng này.'}
          />
        </Card>
      </div>
    </AuthGuard>
  );
}