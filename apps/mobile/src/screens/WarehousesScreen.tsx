import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { api, type PaginatedResponse } from '../lib/api';

interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string | null;
  isDefault: boolean;
  managerId: string | null;
}

export default function WarehousesScreen() {
  const { t } = useTranslation();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWarehouses = useCallback(async () => {
    try {
      const data = await api.get<PaginatedResponse<Warehouse>>('/warehouses');
      setWarehouses(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      console.error('Warehouses fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchWarehouses(); }, []);

  const handleRefresh = () => { setRefreshing(true); fetchWarehouses(); };

  const handleRemove = async (id: string) => {
    try {
      await api.delete(`/warehouses/${id}`);
      fetchWarehouses();
    } catch (err: any) {
      Alert.alert(t('common.error'), err.response?.data?.message || 'Xóa thất bại');
    }
  };

  const renderItem = ({ item }: { item: Warehouse }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: item.isDefault ? '#dbeafe' : '#fef3c7' }]}>
          <Text style={[styles.avatarText, { color: item.isDefault ? '#2563eb' : '#d97706' }]}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.cardInfoRow}>
            <Text style={styles.name}>{item.name}</Text>
            {item.isDefault && <Text style={styles.defaultBadge}>{t('warehouses.isDefault')}</Text>}
          </View>
          <Text style={styles.code}>{item.code}</Text>
        </View>
      </View>
      {item.address && <Text style={styles.address}>📍 {item.address}</Text>}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => Alert.alert(t('common.confirm'), t('warehouses.confirmDelete'), [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('common.delete'), style: 'destructive', onPress: () => handleRemove(item.id) },
          ])}>
          <Text style={styles.actionBtnText}>{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('warehouses.title')}</Text>
        <Text style={styles.headerSub}>{t('warehouses.subtitle', { count: warehouses.length })}</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      ) : (
        <FlatList
          data={warehouses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#3b82f6" />}
          ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyText}>{t('warehouses.empty')}</Text></View>}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => Alert.alert(t('common.info'), t('warehouses.createInfo'))}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  loadingText: { marginTop: 8, color: '#9ca3af', fontSize: 14 },
  emptyText: { color: '#9ca3af', fontSize: 14 },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  headerSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  list: { padding: 12, gap: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700' },
  cardInfo: { flex: 1 },
  cardInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  code: { fontSize: 11, color: '#9ca3af', fontFamily: 'monospace', marginTop: 1 },
  defaultBadge: { fontSize: 10, color: '#2563eb', fontWeight: '600', backgroundColor: '#dbeafe', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, overflow: 'hidden' },
  address: { fontSize: 12, color: '#6b7280', marginTop: 6, marginLeft: 50 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  deleteBtn: { backgroundColor: '#fee2e2' },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: '#dc2626' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '700' },
});
