import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, RefreshControl, TouchableOpacity, Alert,
} from 'react-native';
import { useTranslation } from '@smart-erp/i18n';
import { api } from '../lib/api';
import { formatVND } from '@smart-erp/utils';

interface Store {
  id: string;
  platform: string;
  name: string;
  isActive: boolean;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
}

interface SyncLog {
  id: string;
  storeId: string;
  syncType: string;
  status: string;
  itemsProcessed: string;
  errorMessage: string | null;
  startedAt: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  shopee: '#ee4d2d',
  lazda: '#0f51a5',
  tiktokshop: '#000000',
  shopify: '#96bf48',
  amazon: '#ff9900',
  ebay: '#0064d2',
  woocommerce: '#7f54b3',
};

const STATUS_COLORS: Record<string, string> = {
  success: '#059669',
  failed: '#dc2626',
  partial: '#d97706',
  reserved: '#2563eb',
  consumed: '#059669',
  released: '#6b7280',
};

export default function OmnichannelScreen() {
  const { t } = useTranslation();
  const [stores, setStores] = useState<Store[]>([]);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [storesRes, logsRes] = await Promise.all([
        api.get('/ecommerce/stores'),
        api.get('/ecommerce/logs'),
      ]);
      setStores(storesRes.data || []);
      setLogs(logsRes.data || []);
    } catch (err) {
      console.error('Failed to load omnichannel data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleSync = async (storeId: string, storeName: string) => {
    setSyncingId(storeId);
    try {
      const res = await api.post(`/inventory/sync-channel-stock/${storeId}`);
      Alert.alert(
        t('actions.success', 'Thành công'),
        `${t('ecommerce.sync.success', 'Đồng bộ thành công')}: ${storeName}\n${JSON.stringify(res.data?.items?.length || 0)} items`,
      );
      fetchData();
    } catch (err: any) {
      Alert.alert(t('common.error'), err.response?.data?.message ?? t('ecommerce.sync.failed'));
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    setSyncingId('all');
    try {
      const res = await api.post('/inventory/sync-all-stores-stock');
      Alert.alert(t('actions.success', 'Thành công'), t('ecommerce.sync.allSuccess', 'Đồng bộ tất cả stores thành công'));
      fetchData();
    } catch (err: any) {
      Alert.alert(t('common.error'), err.response?.data?.message ?? t('ecommerce.sync.failed'));
    } finally {
      setSyncingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{t('ecommerce.title', 'Omnichannel')}</Text>
            <Text style={styles.headerSubtitle}>{stores.length} {t('ecommerce.stores.title', 'stores')}</Text>
          </View>
          <TouchableOpacity
            style={[styles.syncAllBtn, syncingId === 'all' && styles.syncAllBtnDisabled]}
            onPress={handleSyncAll}
            disabled={syncingId === 'all' || stores.length === 0}
          >
            {syncingId === 'all' ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.syncAllBtnText}>{t('ecommerce.actions.syncAll', 'Sync All')}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Stores List */}
        {stores.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('ecommerce.stores.empty', 'Chưa có store nào kết nối')}</Text>
            <Text style={styles.emptyHint}>{t('ecommerce.stores.addHint', 'Vào Settings → E-commerce để thêm store')}</Text>
          </View>
        ) : (
          stores.map((store) => (
            <View key={store.id} style={styles.storeCard}>
              <View style={styles.storeHeader}>
                <View style={[styles.platformBadge, { backgroundColor: PLATFORM_COLORS[store.platform] || '#6b7280' }]}>
                  <Text style={styles.platformText}>{store.platform.toUpperCase()}</Text>
                </View>
                <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
              </View>

              <View style={styles.storeMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>{t('ecommerce.stores.lastSync')}:</Text>
                  <Text style={[styles.metaValue, { color: STATUS_COLORS[store.lastSyncStatus || ''] || '#6b7280' }]}>
                    {store.lastSyncStatus ?? '—'}
                  </Text>
                </View>
                {store.lastSyncAt && (
                  <Text style={styles.metaTime}>
                    {new Date(store.lastSyncAt).toLocaleString('vi-VN')}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.syncBtn, syncingId === store.id && styles.syncBtnDisabled]}
                onPress={() => handleSync(store.id, store.name)}
                disabled={syncingId === store.id}
              >
                {syncingId === store.id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.syncBtnText}>{t('ecommerce.actions.syncStore', 'Push Stock')}</Text>
                )}
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Recent Sync Logs */}
        {logs.length > 0 && (
          <View style={styles.logsSection}>
            <Text style={styles.logsTitle}>{t('ecommerce.logs.title', 'Lịch sử đồng bộ')}</Text>
            {logs.slice(0, 10).map((log) => {
              const store = stores.find((s) => s.id === log.storeId);
              return (
                <View key={log.id} style={styles.logItem}>
                  <View style={styles.logHeader}>
                    <View style={[styles.logStatusBadge, { backgroundColor: STATUS_COLORS[log.status] || '#6b7280' }]}>
                      <Text style={styles.logStatusText}>{log.status}</Text>
                    </View>
                    <Text style={styles.logStoreName}>{store?.name || log.storeId?.slice(0, 8)}</Text>
                    <Text style={styles.logTime}>
                      {new Date(log.startedAt).toLocaleString('vi-VN')}
                    </Text>
                  </View>
                  {log.errorMessage && (
                    <Text style={styles.logError} numberOfLines={2}>{log.errorMessage}</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 8, color: '#9ca3af', fontSize: 14 },
  scrollView: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  headerSubtitle: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  syncAllBtn: {
    backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 8, minWidth: 100, alignItems: 'center',
  },
  syncAllBtnDisabled: { opacity: 0.5 },
  syncAllBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  emptyHint: { fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 8 },
  storeCard: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, padding: 16,
    borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb',
  },
  storeHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  platformBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  platformText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  storeName: { fontSize: 15, fontWeight: '600', color: '#111827', flex: 1 },
  storeMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaLabel: { fontSize: 11, color: '#9ca3af' },
  metaValue: { fontSize: 11, fontWeight: '600' },
  metaTime: { fontSize: 10, color: '#9ca3af' },
  syncBtn: {
    backgroundColor: '#3b82f6', paddingVertical: 10, borderRadius: 8,
    alignItems: 'center',
  },
  syncBtnDisabled: { opacity: 0.5 },
  syncBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  logsSection: { marginTop: 24, paddingHorizontal: 16, paddingBottom: 24 },
  logsTitle: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  logItem: {
    backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 6,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  logHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logStatusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  logStatusText: { color: '#fff', fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  logStoreName: { fontSize: 12, fontWeight: '500', color: '#111827', flex: 1 },
  logTime: { fontSize: 10, color: '#9ca3af' },
  logError: { fontSize: 10, color: '#dc2626', marginTop: 4, backgroundColor: '#fef2f2', padding: 4, borderRadius: 4 },
});
