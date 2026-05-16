import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { api } from '../lib/api';
import { formatVND } from '@smart-erp/utils';

export default function FinanceExecutiveScreen() {
  const [forecast, setForecast] = useState<any>(null);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [forecastRes, budgetsRes] = await Promise.all([
        api.get('/finance/cashflow/forecast?period=2026-Q3'),
        api.get('/finance/budgets')
      ]);
      setForecast(forecastRes);
      setBudgets(budgetsRes || []);
    } catch (err) {
      console.error('Fetch Finance data failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderBudget = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.budgetCard} onPress={() => {}}>
      <View style={styles.budgetHeader}>
        <Text style={styles.budgetName}>{item.name}</Text>
        <Text style={styles.budgetYear}>Năm {item.fiscalYear}</Text>
      </View>
      <Text style={styles.budgetTotal}>{formatVND(item.totalAmount)}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '65%' }]} /> 
      </View>
      <Text style={styles.progressLabel}>Đã chi: 65%</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tài chính Chiến lược</Text>

      {forecast && (
        <View style={styles.cashflowCard}>
          <Text style={styles.cardTitle}>Dự báo Dòng tiền (Q3-2026)</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Số dư đầu kỳ:</Text>
            <Text style={styles.balanceVal}>{formatVND(forecast.openingBalance)}</Text>
          </View>
          <View style={styles.statGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValPos}>+{formatVND(forecast.expectedInflow)}</Text>
              <Text style={styles.statLabel}>Dự thu (AR)</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValNeg}>-{formatVND(forecast.expectedOutflow)}</Text>
              <Text style={styles.statLabel}>Dự chi (AP)</Text>
            </View>
          </View>
          <View style={styles.netRow}>
            <Text style={styles.netLabel}>Dòng tiền thuần:</Text>
            <Text style={[styles.netVal, { color: Number(forecast.netCashflow) >= 0 ? '#059669' : '#dc2626' }]}>
              {formatVND(forecast.netCashflow)}
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.subtitle}>Quản lý Ngân sách</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={budgets}
          renderItem={renderBudget}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onRefresh={fetchData}
          refreshing={loading}
          ListEmptyComponent={
            <Text style={styles.empty}>Chưa có ngân sách nào được lập.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 20 },
  cashflowCard: { backgroundColor: '#1e1b4b', borderRadius: 20, padding: 20, marginBottom: 24, elevation: 4 },
  cardTitle: { color: '#9ca3af', fontSize: 13, fontWeight: '600', marginBottom: 16 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  balanceLabel: { color: '#fff', fontSize: 14 },
  balanceVal: { color: '#fff', fontSize: 18, fontWeight: '800' },
  statGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 12 },
  statValPos: { color: '#10b981', fontSize: 14, fontWeight: '700' },
  statValNeg: { color: '#f87171', fontSize: 14, fontWeight: '700' },
  statLabel: { color: '#9ca3af', fontSize: 10, marginTop: 4 },
  netRow: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between' },
  netLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },
  netVal: { fontSize: 16, fontWeight: '800' },
  subtitle: { fontSize: 17, fontWeight: '700', color: '#374151', marginBottom: 12 },
  list: { paddingBottom: 20 },
  budgetCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  budgetName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  budgetYear: { fontSize: 12, color: '#6b7280' },
  budgetTotal: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 12 },
  progressBar: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#3b82f6' },
  progressLabel: { fontSize: 11, color: '#6b7280' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 50 },
});
