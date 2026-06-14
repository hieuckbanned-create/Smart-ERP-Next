// Desktop CRM Screen Component
import React, { useEffect, useState, useCallback } from 'react';
import { DataTable, Button } from '@smart-erp/ui';
import { useTranslation } from '@smart-erp/i18n';
import type { Column } from '@smart-erp/ui';
import { Plus, RefreshCw, Phone, Mail, Target } from 'lucide-react';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  leadScore: number;
  source: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  new: { bg: '#dbeafe', text: '#1e40af' },
  contacted: { bg: '#d1fae5', text: '#065f46' },
  qualified: { bg: '#fef3c7', text: '#92400e' },
  won: { bg: '#ede9fe', text: '#5b21b6' },
  lost: { bg: '#fee2e2', text: '#991b1b' },
};

export function CRMScreen() {
  const { t } = useTranslation();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3456/crm/leads?limit=50', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'X-Tenant-ID': localStorage.getItem('tenant_id') || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const columns: Column<Lead>[] = [
    {
      key: 'name',
      title: 'Lead',
      render: (_, lead) => (
        <div>
          <div className="font-medium text-gray-900">{lead.firstName} {lead.lastName}</div>
          <div className="text-sm text-gray-500">{lead.email || '-'}</div>
        </div>
      ),
    },
    {
      key: 'company',
      title: t('crm.company'),
      dataIndex: 'company',
      render: (val) => val || '-',
    },
    {
      key: 'status',
      title: t('crm.status'),
      align: 'center',
      render: (_, lead) => {
        const colors = STATUS_COLORS[lead.status] || { bg: '#f3f4f6', text: '#374151' };
        return (
          <span
            className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {t(`crm.statuses.${lead.status}`, lead.status)}
          </span>
        );
      },
    },
    {
      key: 'leadScore',
      title: t('crm.leadScore'),
      align: 'center',
      render: (val: number) => (
        <span className={`font-bold ${
          val >= 80 ? 'text-green-600' : val >= 50 ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {val}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '',
      align: 'center',
      width: 120,
      render: (_, lead) => (
        <div className="flex justify-center gap-2">
          <button className="p-1.5 hover:bg-gray-100 rounded" title={t('crm.actions.call')}>
            <Phone className="w-4 h-4 text-gray-500" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded" title={t('crm.actions.email')}>
            <Mail className="w-4 h-4 text-gray-500" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded" title={t('crm.nextBestAction')}>
            <Target className="w-4 h-4 text-blue-500" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('crm.title')}</h1>
          <p className="text-sm text-gray-500">{t('crm.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLeads}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            {t('crm.addLead')}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <DataTable
          columns={columns}
          data={leads}
          rowKey="id"
          loading={loading}
          emptyText={t('common.noData')}
          onRowClick={(lead) => setSelectedLead(lead)}
        />
      </div>

      {selectedLead && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedLead.firstName} {selectedLead.lastName}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">{t('crm.email')}</p>
              <p className="text-gray-900">{selectedLead.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('crm.phone')}</p>
              <p className="text-gray-900">{selectedLead.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('crm.company')}</p>
              <p className="text-gray-900">{selectedLead.company || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('crm.source')}</p>
              <p className="text-gray-900">{t(`crm.sources.${selectedLead.source}`, selectedLead.source)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}