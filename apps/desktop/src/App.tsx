// Smart ERP Desktop - Main App (Tauri)
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from '@smart-erp/ui';
import type { NavItem } from '@smart-erp/ui';
import { Dashboard } from './components/Dashboard';
import { CRMScreen } from './components/CRMScreen';
import { POSScreen } from './components/POSScreen';
import { AccountingScreen } from './components/AccountingScreen';
import { InventoryScreen } from './components/InventoryScreen';
import { ForecastScreen } from './components/ForecastScreen';
import { syncService } from './lib/sync-service';

type Screen =
  | 'dashboard'
  | 'pos'
  | 'crm'
  | 'products'
  | 'orders'
  | 'inventory'
  | 'accounting'
  | 'forecast'
  | 'quality'
  | 'omnichannel'
  | 'hr'
  | 'manufacturing';

export default function DesktopApp() {
  const { t } = useTranslation();
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const NAV_ITEMS: NavItem[] = [
    { key: 'dashboard', label: t('nav.dashboard') || 'Tổng quan', href: '/dashboard' },
    { key: 'pos', label: t('nav.pos') || 'Bán hàng', href: '/pos' },
    { key: 'orders', label: t('nav.orders') || 'Đơn hàng', href: '/orders' },
    { key: 'products', label: t('nav.products') || 'Sản phẩm', href: '/products' },
    { key: 'inventory', label: t('nav.inventory') || 'Kho hàng', href: '/inventory' },
    { key: 'quality', label: t('nav.quality') || 'Chất lượng', href: '/quality' },
    { key: 'manufacturing', label: t('nav.manufacturing') || 'Sản xuất', href: '/manufacturing' },
    { key: 'crm', label: t('nav.crm') || 'CRM', href: '/crm' },
    { key: 'omnichannel', label: t('nav.omnichannel') || 'Đa kênh', href: '/omnichannel' },
    { key: 'accounting', label: t('nav.accounting') || 'Kế toán', href: '/accounting' },
    { key: 'hr', label: t('nav.hr') || 'Nhân sự', href: '/hr' },
    { key: 'forecast', label: t('nav.forecast') || 'Dự báo', href: '/forecast' },
  ];

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleNavigate = (item: NavItem) => {
    const key = item.key as Screen;
    setActiveScreen(key);
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <Dashboard />;
      case 'crm':
        return <CRMScreen />;
      case 'pos':
        return <POSScreen />;
      case 'accounting':
        return <AccountingScreen />;
      case 'inventory':
        return <InventoryScreen />;
      case 'forecast':
        return <ForecastScreen />;
      case 'products':
        return <div className="p-8 text-gray-500">{t('nav.products')}</div>;
      case 'orders':
        return <div className="p-8 text-gray-500">{t('nav.orders')}</div>;
      case 'quality':
        return <div className="p-8 text-gray-500">{t('nav.quality') || 'Quản lý chất lượng'}</div>;
      case 'manufacturing':
        return <div className="p-8 text-gray-500">{t('nav.manufacturing') || 'Sản xuất (MRP)'}</div>;
      case 'omnichannel':
        return <div className="p-8 text-gray-500">{t('nav.omnichannel') || 'Bán hàng đa kênh'}</div>;
      case 'hr':
        return <div className="p-8 text-gray-500">{t('nav.hr') || 'Nhân sự & Tiền lương'}</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        items={NAV_ITEMS}
        activeKey={activeScreen}
        onNavigate={handleNavigate}
        header={
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-lg font-bold text-gray-900">Smart ERP</h1>
            <div className={`text-xs mt-1 ${isOnline ? 'text-green-600' : 'text-yellow-600'}`}>
              {isOnline ? '● Online' : '○ Offline'}
            </div>
          </div>
        }
        footer={
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-400">v0.4.0 - Desktop (Tauri)</p>
          </div>
        }
      />
      <main className="flex-1 overflow-auto">
        {renderScreen()}
      </main>
    </div>
  );
}