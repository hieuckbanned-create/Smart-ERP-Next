import React, { useEffect, useState } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, StatusBar, Platform,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { initI18n } from '@smart-erp/i18n';
import { syncService } from '@smart-erp/sync';
import ProductsScreen from './src/screens/ProductsScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import CustomersScreen from './src/screens/CustomersScreen';

initI18n('vi');

type Screen = 'dashboard' | 'products' | 'orders' | 'customers';

const NAV_ITEMS: { key: Screen; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Tổng quan', icon: '📊' },
  { key: 'products', label: 'Sản phẩm', icon: '📦' },
  { key: 'orders', label: 'Đơn hàng', icon: '🛒' },
  { key: 'customers', label: 'Khách hàng', icon: '👥' },
];

const MOCK_STATS = {
  todayRevenue: 12_500_000,
  todayOrders: 24,
  totalCustomers: 1_248,
  lowStockCount: 7,
};

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

function DashboardScreen() {
  return (
    <ScrollView style={styles.screenContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Bảng điều khiển</Text>
      <View style={styles.statsGrid}>
        {[
          { label: 'Doanh thu hôm nay', value: formatVND(MOCK_STATS.todayRevenue), trend: '↑ 12.5%', color: '#3b82f6' },
          { label: 'Đơn hàng hôm nay', value: MOCK_STATS.todayOrders.toString(), trend: '↑ 8.2%', color: '#10b981' },
          { label: 'Khách hàng', value: MOCK_STATS.totalCustomers.toLocaleString('vi-VN'), trend: '↑ 3.1%', color: '#8b5cf6' },
          { label: 'Sắp hết hàng', value: MOCK_STATS.lowStockCount.toString(), trend: 'Cần nhập thêm', color: '#ef4444', danger: true },
        ].map((card) => (
          <View key={card.label} style={[styles.statCard, { borderLeftColor: card.color }]}>
            <Text style={styles.statLabel}>{card.label}</Text>
            <Text style={[styles.statValue, card.danger && { color: card.color }]}>{card.value}</Text>
            <Text style={[styles.statTrend, card.danger && { color: card.color }]}>{card.trend}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
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
      case 'dashboard': return <DashboardScreen />;
      case 'products': return <ProductsScreen />;
      case 'orders': return <OrdersScreen />;
      case 'customers': return <CustomersScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Smart ERP</Text>
          <Text style={styles.headerSubtitle}>
            {NAV_ITEMS.find((n) => n.key === activeScreen)?.label}
          </Text>
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
        {NAV_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.navItem}
            onPress={() => setActiveScreen(item.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text style={[styles.navLabel, activeScreen === item.key && styles.navLabelActive]}>
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  headerSubtitle: { fontSize: 12, color: '#6b7280', marginTop: 1 },
  onlineBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  onlineText: { fontSize: 12, fontWeight: '600' },
  content: { flex: 1 },
  screenContainer: { flex: 1, padding: 16 },
  screenTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 16 },
  statsGrid: { gap: 12 },
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
  statLabel: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '700', color: '#111827' },
  statTrend: { fontSize: 12, color: '#10b981', marginTop: 4 },
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
  navIcon: { fontSize: 22, marginBottom: 3 },
  navLabel: { fontSize: 10, color: '#9ca3af', fontWeight: '500' },
  navLabelActive: { color: '#3b82f6', fontWeight: '700' },
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
