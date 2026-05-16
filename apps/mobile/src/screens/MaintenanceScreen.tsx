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

interface MaintenanceOrder {
  id: string;
  orderNumber: string;
  title: string;
  status: string;
  type: 'corrective' | 'preventive';
  assetName: string;
  createdAt: string;
}

export default function MaintenanceScreen() {
  const [orders, setOrders] = useState<MaintenanceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/maintenance/orders');
      setOrders(res || []);
    } catch (error) {
      console.error('Failed to fetch maintenance orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleReportFailure = () => {
    Alert.prompt(
      'Báo cáo sự cố thiết bị',
      'Nhập tên thiết bị hoặc mã tài sản cần sửa chữa:',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gửi yêu cầu',
          onPress: async (assetCode) => {
            if (!assetCode) return;
            try {
              // In real case, we would select from a list of assets
              await api.post('/maintenance/requests', { 
                assetId: 'dummy-asset-id', 
                title: `Sự cố thiết bị: ${assetCode}`,
                description: 'Yêu cầu kiểm tra gấp từ Mobile'
              });
              Alert.alert('Thành công', 'Yêu cầu bảo trì đã được gửi đi.');
              fetchOrders();
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể gửi yêu cầu');
            }
          }
        }
      ]
    );
  };

  const renderOrder = ({ item }: { item: MaintenanceOrder }) => {
    const typeColor = item.type === 'corrective' ? '#dc2626' : '#2563eb';
    const statusColor = item.status === 'completed' ? '#059669' : '#d97706';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
            <Text style={[styles.typeText, { color: typeColor }]}>
              {item.type === 'corrective' ? 'SỰ CỐ' : 'ĐỊNH KỲ'}
            </Text>
          </View>
        </View>

        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.assetName}>Thiết bị: {item.assetName}</Text>

        <View style={styles.footer}>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bảo trì Thiết bị (EAM)</Text>
        <TouchableOpacity style={styles.reportBtn} onPress={handleReportFailure}>
          <Text style={styles.reportBtnText}>🚨 Báo lỗi</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onRefresh={fetchOrders}
          refreshing={loading}
          ListEmptyComponent={
            <Text style={styles.empty}>Chưa có yêu cầu bảo trì nào.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  reportBtn: { backgroundColor: '#dc2626', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  reportBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  list: { paddingBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderNumber: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  typeText: { fontSize: 10, fontWeight: '800' },
  titleText: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  assetName: { fontSize: 14, color: '#374151', marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
  date: { fontSize: 12, color: '#9ca3af' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '700' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 50 },
});
