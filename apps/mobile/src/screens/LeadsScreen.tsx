import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity, TextInput, RefreshControl,
} from 'react-native';
import { useTranslation } from '@smart-erp/i18n';
import { api } from '../lib/api';
import { syncService } from '../lib/sync-service';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: string;
  leadScore: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  new: { bg: '#dbeafe', text: '#1e40af' },
  contacted: { bg: '#d1fae5', text: '#065f46' },
  qualified: { bg: '#fef3c7', text: '#92400e' },
  won: { bg: '#ede9fe', text: '#5b21b6' },
  lost: { bg: '#fee2e2', text: '#991b1b' },
};

const SOURCE_COLORS: Record<string, { bg: string; text: string }> = {
  website: { bg: '#e0f2fe', text: '#0369a1' },
  referral: { bg: '#dcfce7', text: '#15803d' },
  trade_show: { bg: '#fef3c7', text: '#b45309' },
  social_media: { bg: '#f3e8ff', text: '#7e22ce' },
  email_campaign: { bg: '#ffedd5', text: '#c2410c' },
  other: { bg: '#f1f5f9', text: '#475569' },
};

export default function LeadsScreen() {
  const { t } = useTranslation();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, byStatus: [] as { status: string; count: number }[], winRate: 0 });

  const fetchLeads = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedStatus) params.append('status', selectedStatus);
      const res = await api.get<{ items: Lead[] }>(`/crm/leads?${params}`);
      setLeads(res.items || []);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, selectedStatus]);

  const fetchStats = async () => {
    try {
      const res = await api.get<{ total: number; byStatus: { status: string; count: number }[]; winRate: number }>('/crm/leads/stats');
      setStats(res);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => { fetchStats(); }, []);

  const handleRefresh = () => { setRefreshing(true); fetchLeads(); fetchStats(); };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#059669';
    if (score >= 50) return '#d97706';
    return '#dc2626';
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('crm.title')}</Text>
        <Text style={styles.subtitle}>{t('crm.subtitle')}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('crm.searchLeads')}
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statCard} onPress={() => setSelectedStatus('')}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tổng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.statCard, styles.statCardBlue]} onPress={() => setSelectedStatus('new')}>
          <Text style={[styles.statValue, styles.statValueBlue]}>{stats.byStatus.find(s => s.status === 'new')?.count || 0}</Text>
          <Text style={styles.statLabel}>{t('crm.statuses.new')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.statCard, styles.statCardGreen]} onPress={() => setSelectedStatus('qualified')}>
          <Text style={[styles.statValue, styles.statValueGreen]}>{stats.byStatus.find(s => s.status === 'qualified')?.count || 0}</Text>
          <Text style={styles.statLabel}>{t('crm.statuses.qualified')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.statCard, styles.statCardPurple]} onPress={() => setSelectedStatus('won')}>
          <Text style={[styles.statValue, styles.statValuePurple]}>{stats.winRate}%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </TouchableOpacity>
      </View>

      {/* Filter */}
      <View style={styles.filterRow}>
        {['', 'new', 'contacted', 'qualified', 'won'].map((status) => (
          <TouchableOpacity
            key={status || 'all'}
            style={[styles.filterChip, selectedStatus === status && styles.filterChipActive]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text style={[styles.filterChipText, selectedStatus === status && styles.filterChipTextActive]}>
              {status ? t(`crm.statuses.${status}`) : 'Tất cả'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lead List */}
      <ScrollView
        style={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {leads.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('common.noData')}</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
              <Text style={styles.addButtonText}>{t('crm.addLead')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          leads.map((lead) => (
            <View key={lead.id} style={styles.leadCard}>
              <View style={styles.leadHeader}>
                <View>
                  <Text style={styles.leadName}>{lead.firstName} {lead.lastName}</Text>
                  <Text style={styles.leadCompany}>{lead.company || '-'}</Text>
                </View>
                <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(parseInt(lead.leadScore) || 0) + '20' }]}>
                  <Text style={[styles.scoreText, { color: getScoreColor(parseInt(lead.leadScore) || 0) }]}>
                    {lead.leadScore}
                  </Text>
                </View>
              </View>
              <View style={styles.leadDetails}>
                <Text style={styles.leadEmail}>{lead.email || '-'}</Text>
                <Text style={styles.leadPhone}>{lead.phone || '-'}</Text>
              </View>
              <View style={styles.leadFooter}>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[lead.status]?.bg || '#f3f4f6' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[lead.status]?.text || '#374151' }]}>
                    {t(`crm.statuses.${lead.status}`) || lead.status}
                  </Text>
                </View>
                <Text style={styles.leadSource}>{t(`crm.sources.${lead.source}`)}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6b7280' },
  header: { padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  searchContainer: { padding: 16, paddingTop: 8 },
  searchInput: {
    backgroundColor: '#fff', padding: 12, borderRadius: 8,
    fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb',
  },
  statsRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 12, alignItems: 'center' },
  statCardBlue: { backgroundColor: '#eff6ff' },
  statCardGreen: { backgroundColor: '#ecfdf5' },
  statCardPurple: { backgroundColor: '#f5f3ff' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  statValueBlue: { color: '#2563eb' },
  statValueGreen: { color: '#059669' },
  statValuePurple: { color: '#7c3aed' },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 4 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#fff' },
  filterChipActive: { backgroundColor: '#3b82f6' },
  filterChipText: { fontSize: 13, color: '#6b7280' },
  filterChipTextActive: { color: '#fff', fontWeight: '600' },
  list: { flex: 1, paddingHorizontal: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: '#6b7280', marginBottom: 16 },
  addButton: { backgroundColor: '#3b82f6', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  leadCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  leadHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  leadName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  leadCompany: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  scoreText: { fontSize: 14, fontWeight: '700' },
  leadDetails: { marginTop: 8 },
  leadEmail: { fontSize: 13, color: '#374151' },
  leadPhone: { fontSize: 13, color: '#374151', marginTop: 2 },
  leadFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  leadSource: { fontSize: 12, color: '#9ca3af' },
});