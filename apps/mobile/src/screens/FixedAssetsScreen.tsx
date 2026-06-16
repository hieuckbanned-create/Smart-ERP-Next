import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';

export default function FixedAssetsScreen() {
  const { t } = useTranslation('common');
  
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAssets(); }, []);

  const loadAssets = async () => {
    try {
      const res = await api.get('/fixed-assets');
      setAssets(res.data?.items || []);
    } catch (err) {
      console.error('Failed to load fixed assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'disposed': return '#ef4444';
      case 'maintenance': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{t(`fixedAssets.statuses.${item.status}`)}</Text>
        </View>
      </View>
      <Text style={styles.code}>{item.code}</Text>
      <Text style={styles.detail}>{t('fixedAssets.purchaseCost')}: {item.purchaseCost?.toLocaleString()} VND</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('fixedAssets.title')}</Text>
      <FlatList
        data={assets}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.empty}>{t('common.noData')}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '600', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: 'white', fontSize: 12, fontWeight: '600' },
  code: { fontSize: 14, color: '#666', marginBottom: 4 },
  detail: { fontSize: 14, color: '#888', marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 32, color: '#999' },
});
