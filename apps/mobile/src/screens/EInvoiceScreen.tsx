import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';

interface EInvoice {
  id: string;
  invoiceNumber: string | null;
  invoiceSeries: string;
  buyerName: string;
  buyerTaxCode: string | null;
  totalAmount: string;
  vatAmount: string;
  status: string;
  issuedAt: string | null;
  createdAt: string;
  provider: string;
  viewUrl: string | null;
  pdfUrl: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  draft:     '#6b7280',
  signed:    '#2563eb',
  issued:    '#059669',
  cancelled: '#dc2626',
  replaced:  '#9ca3af',
  adjusted:  '#d97706',
};

const STATUS_LABELS: Record<string, string> = {
  draft:     'Nháp',
  signed:    'Đã ký',
  issued:    'Đã phát hành',
  cancelled: 'Đã hủy',
  replaced:  'Đã thay thế',
  adjusted:  'Điều chỉnh',
};

const PROVIDER_LABELS: Record<string, string> = {
  vnpt:         'VNPT',
  viettel:      'Viettel',
  misa:         'MISA',
  easy_invoice: 'Easy Invoice',
  bkav:         'BKAV',
};

export default function EInvoiceScreen() {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<EInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [stats, setStats] = useState({
    issued: 0, draft: 0, cancelled: 0,
    revenue: '0', vat: '0',
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [invRes, statsRes]: [any, any] = await Promise.all([
        api.get('/e-invoice'),
        api.get('/e-invoice/stats/monthly'),
      ]);
      setInvoices(invRes.data?.items || invRes.data || []);
      const s = statsRes.data || {};
      setStats({
        issued:    Number(s.issued_count  || 0),
        draft:     Number(s.draft_count   || 0),
        cancelled: Number(s.cancelled_count || 0),
        revenue:   s.total_revenue || '0',
        vat:       s.total_vat     || '0',
      });
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchAll(); };

  const handleIssue = async (id: string) => {
    setActionLoading(id);
    try {
      await api.patch(`/e-invoice/${id}/issue`, {});
      await fetchAll();
    } finally {
      setActionLoading(null);
    }
  };

  const formatVND = (v: string | number) =>
    new Intl.NumberFormat('vi-VN').format(Number(v)) + ' đ';

  const filteredInvoices = activeFilter === 'all'
    ? invoices
    : invoices.filter(i => i.status === activeFilter);

  const FILTERS = [
    { key: 'all',      label: t('orders.statusAll') || 'Tất cả' },
    { key: 'draft',    label: t('einvoice.statuses.draft') },
    { key: 'issued',   label: t('einvoice.statuses.issued') },
    { key: 'cancelled',label: t('einvoice.statuses.cancelled') },
  ];

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
      {/* Header */}
      <Text style={styles.title}>{t('einvoice.title')}</Text>
      <Text style={styles.subtitle}>{t('einvoice.subtitle')}</Text>

      {/* Stats row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: '#059669' }]}>
          <Text style={[styles.statValue, { color: '#059669' }]}>{stats.issued}</Text>
          <Text style={styles.statLabel}>{t('einvoice.stats.issued')}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#6b7280' }]}>
          <Text style={styles.statValue}>{stats.draft}</Text>
          <Text style={styles.statLabel}>{t('einvoice.stats.draft')}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#dc2626' }]}>
          <Text style={[styles.statValue, { color: '#dc2626' }]}>{stats.cancelled}</Text>
          <Text style={styles.statLabel}>{t('einvoice.stats.cancelled')}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#2563eb' }]}>
          <Text style={[styles.statValue, { color: '#2563eb', fontSize: 14 }]}>{formatVND(stats.revenue)}</Text>
          <Text style={styles.statLabel}>{t('einvoice.stats.revenue')}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#7c3aed' }]}>
          <Text style={[styles.statValue, { fontSize: 14 }]}>{formatVND(stats.vat)}</Text>
          <Text style={styles.statLabel}>{t('einvoice.stats.vat')}</Text>
        </View>
      </ScrollView>

      {/* Create button */}
      <TouchableOpacity style={styles.addBtn}>
        <Text style={styles.addBtnText}>+ {t('einvoice.create')}</Text>
      </TouchableOpacity>

      {/* Filter pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setActiveFilter(f.key)}
            style={[styles.filterPill, activeFilter === f.key ? styles.filterPillActive : null]}
          >
            <Text style={[styles.filterPillText, activeFilter === f.key ? styles.filterPillTextActive : null]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Invoices list */}
      {filteredInvoices.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>{'\uD83D\uDCC4'}</Text>
          <Text style={styles.emptyText}>{t('einvoice.noInvoices')}</Text>
        </View>
      ) : (
        filteredInvoices.map(inv => (
          <View key={inv.id} style={styles.card}>
            {/* Card header */}
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.invoiceNum}>
                  {inv.invoiceNumber
                    ? `${inv.invoiceSeries}/${inv.invoiceNumber}`
                    : '--'}
                </Text>
                <Text style={styles.providerText}>
                  {PROVIDER_LABELS[inv.provider] || inv.provider}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: (STATUS_COLORS[inv.status] || '#6b7280') + '22' }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLORS[inv.status] || '#6b7280' }]}>
                  {t(`einvoice.statuses.${inv.status}`) || STATUS_LABELS[inv.status]}
                </Text>
              </View>
            </View>

            {/* Buyer info */}
            <Text style={styles.buyerName}>{inv.buyerName}</Text>
            {inv.buyerTaxCode ? (
              <Text style={styles.taxCode}>{t('einvoice.buyerTaxCode')}: {inv.buyerTaxCode}</Text>
            ) : null}

            {/* Amounts */}
            <View style={styles.amountsRow}>
              <View>
                <Text style={styles.amountLabel}>{t('einvoice.totalAmount')}</Text>
                <Text style={styles.amountValue}>{formatVND(inv.totalAmount)}</Text>
              </View>
              <View>
                <Text style={styles.amountLabel}>{t('einvoice.vatAmount')}</Text>
                <Text style={styles.vatValue}>{formatVND(inv.vatAmount)}</Text>
              </View>
              <View>
                <Text style={styles.amountLabel}>{t('einvoice.issuedAt')}</Text>
                <Text style={styles.dateValue}>
                  {inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString('vi-VN') : '-'}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              {inv.status === 'draft' ? (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.issueBtn]}
                  onPress={() => handleIssue(inv.id)}
                  disabled={actionLoading === inv.id}
                >
                  {actionLoading === inv.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.issueBtnText}>{'\uD83D\uDCE4'} {t('einvoice.issue')}</Text>
                  )}
                </TouchableOpacity>
              ) : null}
              {inv.viewUrl ? (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.viewBtn]}
                  onPress={() => Linking.openURL(inv.viewUrl!)}
                >
                  <Text style={styles.viewBtnText}>{'\uD83D\uDC41'} {t('einvoice.view')}</Text>
                </TouchableOpacity>
              ) : null}
              {inv.pdfUrl ? (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.pdfBtn]}
                  onPress={() => Linking.openURL(inv.pdfUrl!)}
                >
                  <Text style={styles.pdfBtnText}>{'\uD83D\uDCC5'} PDF</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ))
      )}

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  title:        { fontSize: 24, fontWeight: '800', color: '#111827' },
  subtitle:     { fontSize: 12, color: '#6b7280', marginTop: 2, marginBottom: 14 },

  statsRow:     { marginBottom: 14 },
  statCard:     {
    backgroundColor: '#fff', borderRadius: 12, padding: 12,
    marginRight: 10, minWidth: 110, borderLeftWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  statValue:    { fontSize: 20, fontWeight: '800', color: '#111827' },
  statLabel:    { fontSize: 10, color: '#6b7280', marginTop: 2 },

  addBtn:       {
    backgroundColor: '#059669', borderRadius: 10, paddingVertical: 13,
    alignItems: 'center', marginBottom: 12,
    shadowColor: '#059669', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },
  addBtnText:   { color: '#fff', fontWeight: '700', fontSize: 15 },

  filterRow:    { marginBottom: 14 },
  filterPill:   { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#e5e7eb', marginRight: 8 },
  filterPillActive: { backgroundColor: '#059669' },
  filterPillText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  filterPillTextActive: { color: '#fff' },

  emptyState:   { alignItems: 'center', paddingTop: 60 },
  emptyIcon:    { fontSize: 48, marginBottom: 12 },
  emptyText:    { color: '#9ca3af', fontSize: 15 },

  card:         {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  invoiceNum:   { fontSize: 15, fontWeight: '700', fontFamily: 'monospace', color: '#059669' },
  providerText: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
  badge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText:    { fontSize: 11, fontWeight: '700' },
  buyerName:    { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 2 },
  taxCode:      { fontSize: 11, color: '#6b7280', fontFamily: 'monospace', marginBottom: 10 },
  amountsRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  amountLabel:  { fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600' },
  amountValue:  { fontSize: 14, fontWeight: '800', color: '#111827', marginTop: 2 },
  vatValue:     { fontSize: 13, fontWeight: '700', color: '#7c3aed', marginTop: 2 },
  dateValue:    { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 2 },
  actionsRow:   { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn:    { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, minWidth: 80, alignItems: 'center' },
  issueBtn:     { backgroundColor: '#059669' },
  issueBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  viewBtn:      { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#93c5fd' },
  viewBtnText:  { color: '#2563eb', fontWeight: '600', fontSize: 13 },
  pdfBtn:       { backgroundColor: '#fdf4ff', borderWidth: 1, borderColor: '#d8b4fe' },
  pdfBtnText:   { color: '#7c3aed', fontWeight: '600', fontSize: 13 },
  bottomPad:    { height: 40 },
});
