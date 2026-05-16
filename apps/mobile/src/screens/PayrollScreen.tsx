import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from '@smart-erp/i18n';
import { api } from '../lib/api';

interface Payslip {
  id: string;
  board_name: string;
  month: string;
  year: string;
  base_salary: string;
  actual_work_days: string;
  standard_work_days: string;
  overtime_hours: string;
  overtime_pay: string;
  deductions: string;
  net_salary: string;
  status: string; // của board
}

export default function PayrollScreen() {
  const { t } = useTranslation();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      // Trong thực tế cần 1 endpoint API: GET /hr/payroll/my-payslips
      // Hiện tại ta dùng API chung (cần backend lọc theo req.user)
      const res = await api.get('/hr/payroll/my-payslips');
      setPayslips(res.data || []);
    } catch (e) {
      // ignore cho demo
      setPayslips([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatVND = (val: string | number) => 
    new Intl.NumberFormat('vi-VN').format(Number(val)) + ' đ';

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Phiếu lương của tôi</Text>
      <Text style={styles.subtitle}>Chi tiết lương, thưởng và ngày công hàng tháng</Text>

      {payslips.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💰</Text>
          <Text style={styles.emptyText}>Chưa có phiếu lương nào được chốt.</Text>
        </View>
      ) : (
        payslips.map(p => (
          <View key={p.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.periodText}>Tháng {p.month}/{p.year}</Text>
                <Text style={styles.boardText}>{p.board_name}</Text>
              </View>
              <View style={[styles.badge, p.status === 'paid' ? styles.badgePaid : styles.badgeDraft]}>
                <Text style={p.status === 'paid' ? styles.badgePaidText : styles.badgeDraftText}>
                  {p.status === 'paid' ? 'Đã thanh toán' : 'Chờ duyệt'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Lương cơ bản</Text>
              <Text style={styles.value}>{formatVND(p.base_salary)}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Ngày công thực tế</Text>
              <Text style={styles.value}>{p.actual_work_days} / {p.standard_work_days} ngày</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Làm thêm (OT) ({Number(p.overtime_hours).toFixed(1)}h)</Text>
              <Text style={[styles.value, { color: '#059669' }]}>+{formatVND(p.overtime_pay)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Trừ đi trễ / Khấu trừ</Text>
              <Text style={[styles.value, { color: '#dc2626' }]}>-{formatVND(p.deductions)}</Text>
            </View>

            <View style={[styles.divider, { borderStyle: 'dashed' }]} />

            <View style={styles.netRow}>
              <Text style={styles.netLabel}>Thực lĩnh</Text>
              <Text style={styles.netValue}>{formatVND(p.net_salary)}</Text>
            </View>
          </View>
        ))
      )}
      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6b7280', marginTop: 2, marginBottom: 16 },

  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#9ca3af', fontSize: 15 },

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  periodText: { fontSize: 18, fontWeight: '800', color: '#111827' },
  boardText: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgePaid: { backgroundColor: '#dcfce7' },
  badgePaidText: { color: '#166534', fontSize: 11, fontWeight: '700' },
  badgeDraft: { backgroundColor: '#fef3c7' },
  badgeDraftText: { color: '#b45309', fontSize: 11, fontWeight: '700' },

  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 12 },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: '#4b5563' },
  value: { fontSize: 14, fontWeight: '600', color: '#111827' },

  netRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  netLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  netValue: { fontSize: 22, fontWeight: '800', color: '#4f46e5' },

  bottomPad: { height: 40 },
});
