'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Users,
  Truck,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  Building2,
  Menu,
} from 'lucide-react';

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  children?: NavItem[];
}

interface AppLayoutProps {
  children: React.ReactNode;
  user?: {
    id: string;
    name?: string | null;
    email: string;
    role: string;
    tenantId: string;
  };
  isOnline?: boolean;
  pendingSync?: number;
  onLogout?: () => void;
}

export default function AppLayout({
  children,
  user,
  isOnline = true,
  pendingSync = 0,
  onLogout,
}: AppLayoutProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      key: 'dashboard',
      label: t('nav.dashboard'),
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: '/dashboard',
    },
    {
      key: 'pos',
      label: t('nav.pos'),
      icon: <ShoppingCart className="w-5 h-5" />,
      href: '/pos',
    },
    {
      key: 'orders',
      label: t('nav.orders'),
      icon: <ShoppingBag className="w-5 h-5" />,
      href: '/orders',
    },
    {
      key: 'products',
      label: t('nav.products'),
      icon: <Package className="w-5 h-5" />,
      href: '/products',
    },
    {
      key: 'inventory',
      label: t('nav.inventory'),
      icon: <Warehouse className="w-5 h-5" />,
      href: '/inventory',
    },
    {
      key: 'customers',
      label: t('nav.customers'),
      icon: <Users className="w-5 h-5" />,
      href: '/customers',
    },
    {
      key: 'suppliers',
      label: t('nav.suppliers'),
      icon: <Truck className="w-5 h-5" />,
      href: '/suppliers',
    },
    {
      key: 'purchasing',
      label: t('nav.purchasing'),
      icon: <ShoppingBag className="w-5 h-5" />,
      href: '/purchasing',
    },
    {
      key: 'reports',
      label: t('nav.reports'),
      icon: <BarChart3 className="w-5 h-5" />,
      href: '/reports',
    },
    {
      key: 'settings',
      label: t('nav.settings'),
      icon: <Settings className="w-5 h-5" />,
      href: '/settings',
    },
  ];

  const activeKey = navItems.find((item) => pathname.startsWith(item.href))?.key;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Smart ERP</p>
            <p className="text-xs text-gray-400 truncate">Next</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                router.push(item.href);
                setMobileOpen(false);
              }}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-3">
        {!collapsed && user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user.name || user.email}
            </p>
            <p className="text-xs text-gray-400 truncate capitalize">{user.role}</p>
          </div>
        )}
        <button
          onClick={onLogout}
          title={collapsed ? 'Đăng xuất' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex flex-col w-64 h-full bg-white dark:bg-gray-800 shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Desktop collapse toggle */}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="hidden md:flex p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Sync status */}
            <div
              className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                isOnline
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
              {pendingSync > 0 && (
                <span className="bg-yellow-500 text-white rounded-full px-1 text-xs">{pendingSync}</span>
              )}
            </div>

            {/* Notifications */}
            <button className="relative p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
