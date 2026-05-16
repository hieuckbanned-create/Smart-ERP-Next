import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { useTranslation } from '@smart-erp/i18n';
import { api } from '../lib/api';

interface TodayStatus {
  status: string;
  checkInAt?: string;
  checkOutAt?: string;
  actualHours?: string;
  overtimeHours?: string;
  lateMinutes?: number;
  workDate: string;
}

interface MonthlySummary {
  present_days: number;
  late_days: number;
  absent_days: number;
  total_hours: string;
  total_overtime: string;
}

export default function AttendanceScreen() {
  const { t } = useTranslation();
  const [today, setToday] = useState<TodayStatus | null>(null);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [todayRes, summaryRes]: [any, any] = await Promise.all([
        api.get('/hr/attendance/today'),
        api.get('/hr/attendance/summary/monthly'),
      ]);
      setToday(todayRes.data);
      const s = summaryRes.data || {};
      setSummary({
        present_days: Number(s.present_days || 0),
        late_days: Number(s.late_days || 0),
        absent_days: Number(s.absent_days || 0),
        total_hours: s.total_hours || '0',
        total_overtime: s.total_overtime || '0',
      });
    } catch (e) {
      console.log(e);
      setToday(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCheckIn = async () => {
    setActionLoading('checkin');
    try {
      // In a real app, you would get location here:
      // const location = await Location.getCurrentPositionAsync({});
      await api.post('/hr/attendance/check-in', { method: 'app' });
      await fetchData();
      Alert.alert('Thành công', 'Đã chấm công vào ca làm việc!');
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể chấm công');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading('checkout');
    try {
      await api.post('/hr/attendance/check-out', { method: 'app' });
      await fetchData();
      Alert.alert('Thành công', 'Đã chấm công kết thúc ca làm việc!');
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể chấm ra');
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (ts?: string | null) => {
    if (!ts) return '--:--';
    const date = new Date(ts);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const isCheckedIn = today?.checkInAt && !today?.checkOutAt;
  const isCheckedOut = today?.checkInAt && today?.checkOutAt;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>{t('attendance.title')}</Text>
      <Text style={styles.subtitle}>{t('attendance.subtitle')}</Text>

      {/* Main Action Card */}
      <View style={styles.mainCard}>
        <View style={styles.clockCircle}>
          <Text style={styles.currentTime}>
            {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Text style={styles.currentDate}>
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </Text>
        </View>

        <View style={styles.actionRow}>
          {!isCheckedIn && !isCheckedOut ? (
            <TouchableOpacity
              style={[styles.mainBtn, styles.checkInBtn]}
              onPress={handleCheckIn}
              disabled={actionLoading === 'checkin'}
            >
              {actionLoading === 'checkin' ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.btnIcon}>➡️</Text>
                  <Text style={styles.btnText}>{t('attendance.checkIn')}</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}

          {isCheckedIn ? (
            <TouchableOpacity
              style={[styles.mainBtn, styles.checkOutBtn]}
              onPress={handleCheckOut}
              disabled={actionLoading === 'checkout'}
            >
              {actionLoading === 'checkout' ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.btnIcon}>🚪</Text>
                  <Text style={styles.btnText}>{t('attendance.checkOut')}</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}

          {isCheckedOut ? (
            <View style={styles.doneBadge}>
              <Text style={styles.doneText}>✅ {t('attendance.checkedIn')} — Hoàn tất ca</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Today's Status */}
      <Text style={styles.sectionTitle}>{t('attendance.today')}</Text>
      <View style={styles.todayCard}>
        <View style={styles.timeRow}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>{t('attendance.checkIn')}</Text>
            <Text style={styles.timeValue}>{formatTime(today?.checkInAt)}</Text>
          </View>
          <View style={styles.timeDivider} />
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>{t('attendance.checkOut')}</Text>
            <Text style={styles.timeValue}>{formatTime(today?.checkOutAt)}</Text>
          </View>
        </View>

        {(today?.actualHours || today?.overtimeHours || today?.lateMinutes) ? (
          <View style={styles.metricsRow}>
            {today.actualHours ? (
              <View style={styles.metric}>
                <Text style={styles.metricVal}>{Number(today.actualHours).toFixed(1)}h</Text>
                <Text style={styles.metricLab}>{t('attendance.workHours')}</Text>
              </View>
            ) : null}
            {Number(today.overtimeHours) > 0 ? (
              <View style={styles.metric}>
                <Text style={[styles.metricVal, { color: '#f97316' }]}>+{Number(today.overtimeHours).toFixed(1)}h</Text>
                <Text style={styles.metricLab}>{t('attendance.overtime')}</Text>
              </View>
            ) : null}
            {Number(today.lateMinutes) > 0 ? (
              <View style={styles.metric}>
                <Text style={[styles.metricVal, { color: '#ef4444' }]}>{today.lateMinutes}m</Text>
                <Text style={styles.metricLab}>{t('attendance.late')}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Monthly Summary */}
      <Text style={styles.sectionTitle}>{t('attendance.monthly')}</Text>
      {summary ? (
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={[styles.sumValue, { color: '#10b981' }]}>{summary.present_days}</Text>
            <Text style={styles.sumLabel}>{t('attendance.totalDays')}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.sumValue, { color: '#f59e0b' }]}>{summary.late_days}</Text>
            <Text style={styles.sumLabel}>{t('attendance.lateCount')}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.sumValue, { color: '#ef4444' }]}>{summary.absent_days}</Text>
            <Text style={styles.sumLabel}>{t('attendance.absences')}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.sumValue, { color: '#6366f1' }]}>{Number(summary.total_hours).toFixed(0)}h</Text>
            <Text style={styles.sumLabel}>{t('attendance.totalHours')}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6b7280', marginTop: 2, marginBottom: 16 },

  mainCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24,
    alignItems: 'center', marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  clockCircle: {
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 4, borderColor: '#eff6ff',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24, backgroundColor: '#fff',
  },
  currentTime: { fontSize: 36, fontWeight: '800', color: '#1d4ed8', letterSpacing: 1 },
  currentDate: { fontSize: 13, color: '#6b7280', marginTop: 4, fontWeight: '500' },

  actionRow: { width: '100%', alignItems: 'center' },
  mainBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    width: '100%', paddingVertical: 16, borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  checkInBtn: { backgroundColor: '#10b981' },
  checkOutBtn: { backgroundColor: '#ef4444' },
  btnIcon: { fontSize: 18, marginRight: 8 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  doneBadge: {
    backgroundColor: '#dcfce7', paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: 8, width: '100%', alignItems: 'center'
  },
  doneText: { color: '#166534', fontWeight: '700', fontSize: 15 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 12 },
  todayCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  timeBlock: { flex: 1, alignItems: 'center' },
  timeLabel: { fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600', marginBottom: 4 },
  timeValue: { fontSize: 20, fontWeight: '700', color: '#111827', fontFamily: 'monospace' },
  timeDivider: { width: 1, height: 30, backgroundColor: '#e5e7eb', marginHorizontal: 16 },

  metricsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 16
  },
  metric: { alignItems: 'center' },
  metricVal: { fontSize: 16, fontWeight: '800', color: '#3b82f6' },
  metricLab: { fontSize: 11, color: '#6b7280', marginTop: 2 },

  summaryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
  },
  summaryItem: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    flex: 1, minWidth: '45%', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  sumValue: { fontSize: 24, fontWeight: '800' },
  sumLabel: { fontSize: 12, color: '#6b7280', marginTop: 4, fontWeight: '500' },

  bottomPad: { height: 40 },
});
