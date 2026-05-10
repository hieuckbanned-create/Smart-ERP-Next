'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AuthGuard from '@/components/layout/AuthGuard';
import {
  Settings,
  Building2,
  Globe,
  Bell,
  Shield,
  Palette,
  Database,
  ChevronRight,
  Save,
  Check,
} from 'lucide-react';

type SettingsTab = 'company' | 'general' | 'notifications' | 'security' | 'appearance';

const TABS: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { key: 'company', label: 'Thông tin công ty', icon: <Building2 className="w-4 h-4" /> },
  { key: 'general', label: 'Chung', icon: <Globe className="w-4 h-4" /> },
  { key: 'notifications', label: 'Thông báo', icon: <Bell className="w-4 h-4" /> },
  { key: 'security', label: 'Bảo mật', icon: <Shield className="w-4 h-4" /> },
  { key: 'appearance', label: 'Giao diện', icon: <Palette className="w-4 h-4" /> },
];

export default function SettingsPage() {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');
  const [saved, setSaved] = useState(false);

  const [company, setCompany] = useState({
    name: 'Công ty TNHH Smart ERP',
    address: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
    phone: '028 1234 5678',
    email: 'info@smarterp.vn',
    taxCode: '0123456789',
    website: 'https://smarterp.vn',
  });

  const [general, setGeneral] = useState({
    language: 'vi',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    dateFormat: 'DD/MM/YYYY',
    fiscalYearStart: '01',
  });

  const [notifications, setNotifications] = useState({
    lowStockAlert: true,
    newOrderAlert: true,
    paymentAlert: true,
    emailNotifications: false,
    browserNotifications: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AuthGuard>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cấu hình hệ thống</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Đã lưu' : 'Lưu thay đổi'}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar tabs */}
          <div className="w-52 flex-shrink-0">
            <nav className="space-y-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    activeTab === tab.key
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {tab.icon}
                    {tab.label}
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            {/* Company info */}
            {activeTab === 'company' && (
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
                  Thông tin công ty
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Tên công ty', type: 'text' },
                    { key: 'taxCode', label: 'Mã số thuế', type: 'text' },
                    { key: 'phone', label: 'Điện thoại', type: 'tel' },
                    { key: 'email', label: 'Email', type: 'email' },
                    { key: 'website', label: 'Website', type: 'url' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        value={(company as any)[field.key]}
                        onChange={(e) => setCompany((c) => ({ ...c, [field.key]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Địa chỉ
                    </label>
                    <textarea
                      value={company.address}
                      onChange={(e) => setCompany((c) => ({ ...c, address: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* General settings */}
            {activeTab === 'general' && (
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
                  Cài đặt chung
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ngôn ngữ
                    </label>
                    <select
                      value={general.language}
                      onChange={(e) => setGeneral((g) => ({ ...g, language: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Đơn vị tiền tệ
                    </label>
                    <select
                      value={general.currency}
                      onChange={(e) => setGeneral((g) => ({ ...g, currency: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="VND">VND — Đồng Việt Nam</option>
                      <option value="USD">USD — US Dollar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Múi giờ
                    </label>
                    <select
                      value={general.timezone}
                      onChange={(e) => setGeneral((g) => ({ ...g, timezone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (UTC+7)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Định dạng ngày
                    </label>
                    <select
                      value={general.dateFormat}
                      onChange={(e) => setGeneral((g) => ({ ...g, dateFormat: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
                  Cài đặt thông báo
                </h2>
                <div className="space-y-4">
                  {[
                    { key: 'lowStockAlert', label: 'Cảnh báo sắp hết hàng', desc: 'Thông báo khi tồn kho dưới mức tối thiểu' },
                    { key: 'newOrderAlert', label: 'Đơn hàng mới', desc: 'Thông báo khi có đơn hàng mới' },
                    { key: 'paymentAlert', label: 'Thanh toán', desc: 'Thông báo khi nhận được thanh toán' },
                    { key: 'emailNotifications', label: 'Thông báo qua email', desc: 'Gửi email cho các sự kiện quan trọng' },
                    { key: 'browserNotifications', label: 'Thông báo trình duyệt', desc: 'Hiển thị thông báo trên trình duyệt' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications((n) => ({ ...n, [item.key]: !(n as any)[item.key] }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          (notifications as any)[item.key] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            (notifications as any)[item.key] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
                  Bảo mật
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mật khẩu hiện tại
                    </label>
                    <input type="password" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mật khẩu mới
                    </label>
                    <input type="password" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Xác nhận mật khẩu mới
                    </label>
                    <input type="password" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Phiên đăng nhập hiện tại: <span className="font-medium text-gray-700 dark:text-gray-300">Thiết bị này</span>
                    </p>
                    <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition">
                      Đăng xuất tất cả thiết bị khác
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
                  Giao diện
                </h2>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Chủ đề màu sắc</p>
                  <div className="flex gap-3">
                    {[
                      { key: 'light', label: 'Sáng', bg: 'bg-white border-2 border-gray-200' },
                      { key: 'dark', label: 'Tối', bg: 'bg-gray-900 border-2 border-gray-700' },
                      { key: 'system', label: 'Hệ thống', bg: 'bg-gradient-to-r from-white to-gray-900 border-2 border-gray-300' },
                    ].map((theme) => (
                      <button key={theme.key} className={`w-20 h-14 rounded-lg ${theme.bg} flex items-end justify-center pb-1.5 hover:ring-2 hover:ring-blue-500 transition`}>
                        <span className="text-xs font-medium text-gray-600">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Màu chủ đạo</p>
                  <div className="flex gap-2">
                    {['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'].map((color) => (
                      <button
                        key={color}
                        style={{ backgroundColor: color }}
                        className="w-8 h-8 rounded-full hover:ring-2 hover:ring-offset-2 hover:ring-gray-400 transition"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
