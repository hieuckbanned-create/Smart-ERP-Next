import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { api } from '../lib/api';
import { formatVND } from '@smart-erp/utils';

export default function CrmPipelineScreen() {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/crm/pipelines');
      setPipelines(res || []);
    } catch (error) {
      console.error('Failed to fetch CRM pipelines', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderDeal = (deal: any) => (
    <TouchableOpacity key={deal.id} style={styles.dealCard} onPress={() => {}}>
      <Text style={styles.dealTitle}>{deal.title}</Text>
      <Text style={styles.dealAmount}>{formatVND(deal.amount)}</Text>
      <View style={styles.dealFooter}>
        <Text style={styles.dealDate}>Dự kiến: {new Date(deal.expectedCloseDate).toLocaleDateString('vi-VN')}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderStage = (stage: any) => (
    <View key={stage.id} style={styles.stageColumn}>
      <View style={styles.stageHeader}>
        <Text style={styles.stageName}>{stage.name}</Text>
        <Text style={styles.stageProb}>{stage.probability}%</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* In real app, we would fetch deals for this stage */}
        <View style={styles.dealList}>
          {stage.name === 'Qualification' && renderDeal({ id: '1', title: 'HĐ Phần mềm ABC', amount: 500000000, expectedCloseDate: new Date() })}
          {stage.name === 'Negotiation' && renderDeal({ id: '2', title: 'Triển khai ERP - Nhà máy X', amount: 1200000000, expectedCloseDate: new Date() })}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pipeline Bán hàng</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => Alert.alert('Thêm Deal', 'Tính năng đang khởi tạo...')}>
          <Text style={styles.addBtnText}>+ Thêm Deal</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pipelineScroll}>
          {pipelines[0]?.stages?.map((stage: any) => renderStage(stage))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  addBtn: { backgroundColor: '#4f46e5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  pipelineScroll: { paddingRight: 20 },
  stageColumn: { width: 280, backgroundColor: '#f3f4f6', borderRadius: 16, padding: 12, marginRight: 16, maxHeight: '90%' },
  stageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  stageName: { fontSize: 14, fontWeight: '800', color: '#374151' },
  stageProb: { fontSize: 11, color: '#6b7280', fontWeight: '600' },
  dealList: { gap: 12 },
  dealCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  dealTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 },
  dealAmount: { fontSize: 16, fontWeight: '800', color: '#059669', marginBottom: 12 },
  dealFooter: { borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8 },
  dealDate: { fontSize: 11, color: '#9ca3af' },
});
