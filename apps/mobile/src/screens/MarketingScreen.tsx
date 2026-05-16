import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { api } from '../lib/api';
import { formatVND } from '@smart-erp/utils';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  budget: string;
  actualCost: string;
  sentCount: number;
  openCount: number;
  clickCount: number;
  conversionCount: number;
}

export default function MarketingScreen() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/marketing/campaigns');
      setCampaigns(res || []);
    } catch (error) {
      console.error('Failed to fetch campaigns', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const renderCampaign = ({ item }: { item: Campaign }) => {
    const conversionRate = item.sentCount > 0 ? (item.conversionCount / item.sentCount) * 100 : 0;
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.campName}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#ecfdf5' : '#f3f4f6' }]}>
            <Text style={[styles.statusText, { color: item.status === 'active' ? '#059669' : '#6b7280' }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Đã gửi</Text>
            <Text style={styles.metricValue}>{item.sentCount}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Mở</Text>
            <Text style={styles.metricValue}>{item.openCount}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Click</Text>
            <Text style={styles.metricValue}>{item.clickCount}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Chuyển đổi</Text>
            <Text style={[styles.metricValue, { color: '#059669' }]}>{conversionRate.toFixed(1)}%</Text>
          </View>
        </View>

        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Chi phí: <Text style={styles.costValue}>{formatVND(item.actualCost)}</Text></Text>
          <Text style={styles.costLabel}>Ngân sách: <Text style={styles.costValue}>{formatVND(item.budget)}</Text></Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chiến dịch Tiếp thị</Text>
        <TouchableOpacity style={styles.createBtn} onPress={() => {}}>
          <Text style={styles.createBtnText}>+ Mới</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={campaigns}
          renderItem={renderCampaign}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onRefresh={fetchCampaigns}
          refreshing={loading}
          ListEmptyComponent={
            <Text style={styles.empty}>Chưa có chiến dịch nào.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  createBtn: { backgroundColor: '#4f46e5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  createBtnText: { color: '#fff', fontWeight: '700' },
  list: { paddingBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  campName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800' },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 16, marginBottom: 12 },
  metric: { alignItems: 'center' },
  metricLabel: { fontSize: 11, color: '#6b7280', marginBottom: 4 },
  metricValue: { fontSize: 14, fontWeight: '700', color: '#374151' },
  costRow: { flexDirection: 'row', justifyContent: 'space-between' },
  costLabel: { fontSize: 12, color: '#9ca3af' },
  costValue: { color: '#374151', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 50 },
});
