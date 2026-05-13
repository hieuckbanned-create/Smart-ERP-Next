import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useTranslation } from '@smart-erp/i18n';
import { api, type PaginatedResponse } from '../lib/api';
import { formatVND } from '@smart-erp/utils';

interface Supplier {
  id: string;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  currentDebt: string | null;
  totalPurchased: string | null;
}

export default function SuppliersScreen() {
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchSuppliers = useCallback(async (p = 1, s = search, append = false) => {
    try {
      const params = new URLSearchParams({ page: p.toString(), limit: '20' });
      if (s) params.set('search', s);
      const data = await api.get<PaginatedResponse<Supplier>>(`/suppliers?${params}`);
      setSuppliers((prev) => append ? [...prev, ...data.items] : data.items);
      setHasMore(p < data.totalPages);
    } catch (err) {
      console.error('Suppliers fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => { fetchSuppliers(1, search); }, []);

  const handleSearch = () => { setPage(1); setLoading(true); fetchSuppliers(1, search); };
  const handleRefresh = () => { setRefreshing(true); setPage(1); fetchSuppliers(1, search); };
  const handleLoadMore = () => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    fetchSuppliers(next, search, true);
  };

  const renderItem = ({ item }: { item: Supplier }) => {
    const hasDebt = parseFloat(item.currentDebt ?? '0') > 0;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={[styles.avatar, { backgroundColor: '#fef3c7' }]}>
            <Text style={[styles.avatarText, { color: '#d97706' }]}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.code}>{item.code}</Text>
          </View>
        </View>
        {item.phone && <Text style={styles.contact}>📞 {item.phone}</Text>}
        {item.email && <Text style={styles.contact}>✉️ {item.email}</Text>}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>{t('suppliers.totalPurchased')}</Text>
            <Text style={styles.statValue}>{formatVND(item.totalPurchased)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>{t('suppliers.currentDebt')}</Text>
            <Text style={[styles.statValue, hasDebt && styles.debtValue]}>{formatVND(item.currentDebt)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={t('suppliers.searchPlaceholder')}
          placeholderTextColor="#9ca3af"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>{t('actions.search')}</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      ) : (
        <FlatList
          data={suppliers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#3b82f6" />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyText}>{t('suppliers.empty')}</Text></View>}
          ListFooterComponent={hasMore ? <ActivityIndicator style={{ marginVertical: 16 }} color="#3b82f6" /> : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  searchRow: { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  searchInput: { flex: 1, height: 40, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 12, fontSize: 14, color: '#111827', backgroundColor: '#f9fafb' },
  searchBtn: { backgroundColor: '#3b82f6', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  list: { padding: 12, gap: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#2563eb' },
  cardInfo: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  code: { fontSize: 11, color: '#9ca3af', fontFamily: 'monospace', marginTop: 1 },
  contact: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  stats: { flexDirection: 'row', gap: 16, marginTop: 6 },
  stat: {},
  statLabel: { fontSize: 10, color: '#9ca3af' },
  statValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
  debtValue: { color: '#dc2626' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  loadingText: { marginTop: 8, color: '#9ca3af', fontSize: 14 },
  emptyText: { color: '#9ca3af', fontSize: 14 },
});