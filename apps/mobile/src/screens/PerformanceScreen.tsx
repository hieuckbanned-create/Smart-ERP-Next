import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { api } from '../lib/api';
import { useTranslation } from 'react-i18next';

interface KPI {
  id: string;
  kpiName: string;
  targetValue: string;
  actualValue: string;
  score: string;
  period: string;
  status: string;
}

export default function PerformanceScreen() {
  const { t } = useTranslation();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hr/performance/my-kpis');
      setKpis(res || []);
    } catch (error) {
      console.error('Failed to fetch KPIs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  const handleUpdate = (kpi: KPI) => {
    Alert.prompt(
      'Cập nhật kết quả',
      `Nhập giá trị thực tế cho: ${kpi.kpiName}`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Cập nhật',
          onPress: async (value) => {
            if (!value || isNaN(Number(value))) return;
            try {
              await api.patch(`/hr/performance/kpis/${kpi.id}`, { actualValue: Number(value) });
              Alert.alert('Thành công', 'Đã cập nhật chỉ số KPI');
              fetchKPIs();
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể cập nhật');
            }
          }
        }
      ],
      'plain-text',
      kpi.actualValue
    );
  };

  const renderItem = ({ item }: { item: KPI }) => {
    const score = parseFloat(item.score);
    const scoreColor = score >= 90 ? '#059669' : score >= 70 ? '#d97706' : '#dc2626';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.kpiName}>{item.kpiName}</Text>
          <View style={[styles.scoreBadge, { backgroundColor: scoreColor + '20' }]}>
            <Text style={[styles.scoreText, { color: scoreColor }]}>{score.toFixed(1)}%</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Mục tiêu</Text>
            <Text style={styles.statValue}>{item.targetValue}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Thực tế</Text>
            <Text style={styles.statValue}>{item.actualValue}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Kỳ</Text>
            <Text style={styles.statValue}>{item.period}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.updateBtn} onPress={() => handleUpdate(item)}>
          <Text style={styles.updateBtnText}>Cập nhật tiến độ</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>KPI & Hiệu suất</Text>
      <FlatList
        data={kpis}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onRefresh={fetchKPIs}
        refreshing={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 20 },
  list: { paddingBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  kpiName: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1 },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  scoreText: { fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f3f4f6', paddingVertical: 12 },
  stat: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 10, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 },
  statValue: { fontSize: 14, fontWeight: '700', color: '#374151' },
  updateBtn: { marginTop: 12, backgroundColor: '#eff6ff', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  updateBtnText: { color: '#2563eb', fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
