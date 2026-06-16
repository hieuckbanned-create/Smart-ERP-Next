import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { api } from '../lib/api';
import { useTranslation } from 'react-i18next';

interface ServiceTicket {
  id: string;
  ticketNumber: string;
  title: string;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: string;
  createdAt: string;
}

export default function FieldServiceScreen() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/field-service/tickets');
      setTickets(res.data || []);
    } catch (error) {
      console.error('Failed to fetch tickets', error);
      Alert.alert(t('common.error'), 'Could not load service tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCheckIn = (ticketId: string) => {
    Alert.alert(
      'Check-in at Site',
      'This will record your GPS location and start the service timer. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check-in Now',
          onPress: async () => {
            try {
              // In real app, get GPS location here
              await api.patch(`/field-service/tickets/${ticketId}/check-in`, {
                lat: 10.762622,
                lng: 106.660172,
                address: 'Quận 1, TP. HCM',
              });
              Alert.alert('Success', 'Check-in recorded. You are now in-progress.');
              fetchTickets();
            } catch (error) {
              Alert.alert('Error', 'Check-in failed');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: ServiceTicket }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.ticketNumber}>{item.ticketNumber}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: item.priority === 'urgent' ? '#dc2626' : '#3b82f6' }]}>
          <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.status}>Status: {item.status.replace('_', ' ')}</Text>
      
      {item.status === 'assigned' && (
        <TouchableOpacity 
          style={styles.checkInButton}
          onPress={() => handleCheckIn(item.id)}
        >
          <Text style={styles.buttonText}>Site Check-in</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Field Service Tickets</Text>
      <FlatList
        data={tickets}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onRefresh={fetchTickets}
        refreshing={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#111827' },
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticketNumber: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  priorityText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  status: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  checkInButton: { backgroundColor: '#3b82f6', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
});
