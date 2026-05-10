import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { initI18n } from '@smart-erp/i18n';
import { syncService } from '@smart-erp/sync';

// Khởi tạo i18n với tiếng Việt mặc định
initI18n('vi');

type Screen = 'dashboard' | 'products' | 'orders' | 'customers';

interface NavItem {
  key: Screen;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Tổng quan', icon: '📊' },
  { key: 'products', label: 'Sản phẩm', icon: '📦' },
  { key: 'orders', label: 'Đơn hàng', icon: '🛒' },
  { key: 'customers', label: 'Khách hàng', icon: '👥' },
];

// Mock stats for offline-first display
const mockStats = {
  todayRevenue: 12_500_000,
  todayOrders: 24,
  totalCustomers: 1_248,
  lowStockCount: 7,
};

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

function DashboardScreen() {
  return (
    <ScrollView style={styles.screenContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Bảng điều khiển</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderLeftColor: '#3b82f6' }]}>
          <Text style={styles.statLabel}>Doanh thu hôm nay</Text>
          <Text style={styles.statValue}>{formatVND(mockStats.todayRevenue)}</Text>
          <Text style={styles.statTrend}>↑ 12.5%</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#10b981' }]}>
          <Text style={styles.statLabel}>Đơn hàng hôm nay</Text>
          <Text style={styles.statValue}>{mockStats.todayOrders}</Text>
          <Text style={styles.statTrend}>↑ 8.2%</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#8b5cf6' }]}>
          <Text style={styles.statLabel}>Khách hàng</Text>
          <Text style={styles.statValue}>{mockStats.totalCustomers.toLocaleString('vi-VN')}</Text>
          <Text style={styles.statTrend}>↑ 3.1%</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#ef4444' }]}>
          <Text style={styles.statLabel}>Sắp hết hàng</Text>
          <Text style={[styles.statValue, { color: '#ef4444' }]}>{mockStats.lowStockCount}</Text>
          <Text style={[styles.statTrend, { color: '#ef4444' }]}>Cần nhập thêm</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderIcon}>🚧</Text>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderText}>Đang phát triển...</Text>
    </View>
  );
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    syncService.processQueue().catch(console.error);
  }, []);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'products':
        return <PlaceholderScreen title="Sản phẩm" />;
      case 'orders':
        return <PlaceholderScreen title="Đơn hàng" />;
      case 'customers':
        return <PlaceholderScreen title="Khách hàng" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Smart ERP</Text>
          <Text style={styles.headerSubtitle}>Quản trị doanh nghiệp</Text>
        </View>
        <View style={[styles.onlineBadge, { backgroundColor: isOnline ? '#dcfce7' : '#fef9c3' }]}>
          <Text style={[styles.onlineText, { color: isOnline ? '#16a34a' : '#ca8a04' }]}>
            {isOnline ? '● Online' : '○ Offline'}
          </Text>
        </View>
      </View>

      {/* Screen content */}
      <View style={styles.content}>{renderScreen()}</View>

      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.navItem}
            onPress={() => setActiveScreen(item.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text
              style={[
                styles.navLabel,
                activeScreen === item.key && styles.navLabelActive,
              ]}
            >
              {item.label}
            </Text>
            {activeScreen === item.key && <View style={styles.navIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 1,
  },
  onlineBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    padding: 16,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  statTrend: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#6b7280',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
    position: 'relative',
  },
  navIcon: {
    fontSize: 22,
    marginBottom: 3,
  },
  navLabel: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#3b82f6',
    fontWeight: '700',
  },
  navIndicator: {
    position: 'absolute',
    top: 0,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: '#3b82f6',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
});
