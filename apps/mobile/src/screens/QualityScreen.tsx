import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from '@smart-erp/i18n';
import { api } from '../lib/api';

interface SupplierScore {
  supplierId: string;
  totalInspections: number;
  passRate: number;
  grade: string;
  score: number;
  openNCRs: number;
  criticalNCRs: number;
}

export default function QualityScreen() {
  const { t } = useTranslation();
  const [scores, setScores] = useState<SupplierScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const res = await api.get<any>('/qms/suppliers/quality-report');
      setScores(res.data || []);
    } catch {
      // Graceful degrade if API is mock
      setScores([
        { supplierId: 'Công ty ABC', totalInspections: 45, passRate: 98, grade: 'A', score: 95, openNCRs: 0, criticalNCRs: 0 },
        { supplierId: 'Nhà máy XYZ', totalInspections: 32, passRate: 85, grade: 'C', score: 72, openNCRs: 2, criticalNCRs: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return '#059669'; // Green
      case 'B': return '#2563eb'; // Blue
      case 'C': return '#d97706'; // Yellow/Orange
      case 'D':
      case 'F': return '#dc2626'; // Red
      default: return '#6b7280'; // Gray
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('qms.title') || 'Quản lý chất lượng'}</Text>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tabActive}>
          <Text style={styles.tabActiveText}>{t('qms.supplierScore') || 'Điểm nhà cung cấp'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabInactive}>
          <Text style={styles.tabInactiveText}>{t('qms.ncrs') || 'Lỗi (NCR)'}</Text>
        </TouchableOpacity>
      </View>

      {scores.length === 0 ? (
        <Text style={styles.empty}>{t('qms.noSupplierData') || 'Chưa có dữ liệu nhà cung cấp'}</Text>
      ) : (
        scores.map((score, idx) => (
          <View key={idx} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.supplierName}>{score.supplierId}</Text>
              <View style={[styles.badge, { backgroundColor: getGradeColor(score.grade) + '20' }]}>
                <Text style={[styles.badgeText, { color: getGradeColor(score.grade) }]}>
                  {t('qms.supplierGrade') || 'Xếp hạng'}: {score.grade}
                </Text>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>{t('qms.totalInspections') || 'Tổng kiểm tra'}</Text>
                <Text style={styles.statValue}>{score.totalInspections}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>{t('qms.passRate') || 'Tỷ lệ đạt'}</Text>
                <Text style={styles.statValue}>{score.passRate}%</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>{t('qms.score') || 'Điểm số'}</Text>
                <Text style={[styles.statValue, { color: '#111827', fontWeight: 'bold' }]}>{score.score}</Text>
              </View>
            </View>

            {(score.openNCRs > 0 || score.criticalNCRs > 0) && (
              <View style={styles.alertsRow}>
                {score.openNCRs > 0 && (
                  <Text style={styles.alertTextWarn}>{score.openNCRs} {t('qms.openNCRs') || 'lỗi đang mở'}</Text>
                )}
                {score.criticalNCRs > 0 && (
                  <Text style={styles.alertTextDanger}>{score.criticalNCRs} {t('qms.criticalNCRs') || 'nghiêm trọng'}</Text>
                )}
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#111827' },
  tabContainer: { flexDirection: 'row', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#2563eb', paddingVertical: 8, paddingHorizontal: 12 },
  tabActiveText: { color: '#2563eb', fontWeight: '600' },
  tabInactive: { paddingVertical: 8, paddingHorizontal: 12 },
  tabInactiveText: { color: '#6b7280', fontWeight: '500' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  supplierName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  statBox: { alignItems: 'center' },
  statLabel: { fontSize: 11, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase' },
  statValue: { fontSize: 16, fontWeight: '600', color: '#374151' },
  alertsRow: { flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', gap: 12 },
  alertTextWarn: { fontSize: 12, color: '#d97706', fontWeight: '500' },
  alertTextDanger: { fontSize: 12, color: '#dc2626', fontWeight: '500' },
});
