'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Input, Button, Tabs, Tab, useToast, Select } from '@smart-erp/ui';
import { apiClient } from '@/lib/api-client';

type EcommerceStore = {
  id: string;
  platform: string;
  name: string;
  isActive: boolean;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
};

type EcommerceSyncLog = {
  id: string;
  storeId: string;
  syncType: string;
  status: string;
  itemsProcessed: string;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
};

export default function EcommerceSettingsPage() {
  const { t } = useTranslation('common');
  const toast = useToast();

  const [stores, setStores] = useState<EcommerceStore[]>([]);
  const [logs, setLogs] = useState<EcommerceSyncLog[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('woocommerce');
  const [shopeeConfig, setShopeeConfig] = useState({ partnerId: '', partnerKey: '', shopId: '' });
  const [tiktokConfig, setTiktokConfig] = useState({ appKey: '', appSecret: '', shopId: '' });
  const [amazonConfig, setAmazonConfig] = useState({ clientId: '', clientSecret: '', refreshToken: '', sellerId: '', region: 'na' });
  const [ebayConfig, setEbayConfig] = useState({ appId: '', certId: '', devId: '', userToken: '', siteId: '0' });

  const loadStores = async () => {
    setLoadingStores(true);
    try {
      const res = await apiClient.get('/ecommerce/stores');
      setStores(res.data || []);
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoadingStores(false);
    }
  };

  const loadLogs = async (storeId?: string | null) => {
    setLoadingLogs(true);
    try {
      const res = await apiClient.get('/ecommerce/logs', {
        params: storeId ? { storeId } : {},
      });
      setLogs(res.data || []);
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadStores();
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncAll = async () => {
    try {
      await apiClient.post('/ecommerce/sync/all');
      toast.success(t('actions.success'));
      await loadStores();
      await loadLogs(selectedStoreId);
    } catch {
      toast.error(t('common.error'));
    }
  };

  const syncStore = async (storeId: string) => {
    try {
      await apiClient.post(`/ecommerce/stores/${storeId}/sync`);
      toast.success(t('actions.success'));
      await loadStores();
      setSelectedStoreId(storeId);
      await loadLogs(storeId);
    } catch {
      toast.error(t('common.error'));
    }
  };

  const saveTikTok = async () => {
    try {
      await apiClient.post('/ecommerce/stores', {
        platform: 'tiktokshop',
        name: 'TikTok Shop',
        configJson: JSON.stringify(tiktokConfig),
      });
      toast.success(t('ecommerce.tiktokSaved'));
      await loadStores();
    } catch {
      toast.error(t('common.error'));
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('ecommerce.title')}</h1>
          <p className="text-sm text-gray-500">{t('ecommerce.stores.title')}</p>
        </div>
        <Button onClick={syncAll} disabled={loadingStores}>
          {t('ecommerce.actions.syncAll')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{t('ecommerce.stores.title')}</h2>
          </div>

          <div className="mt-3 space-y-2">
            {loadingStores && (
              <div className="text-sm text-gray-500">{t('common.loading')}</div>
            )}

            {!loadingStores && stores.length === 0 && (
              <div className="text-sm text-gray-500">{t('ecommerce.logs.empty')}</div>
            )}

            {stores.map((s) => (
              <div
                key={s.id}
                className="border border-gray-200 rounded-lg p-3 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">{s.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {s.platform} · {s.lastSyncStatus ?? '—'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setSelectedStoreId(s.id); loadLogs(s.id); }}>
                    {t('ecommerce.actions.viewLogs')}
                  </Button>
                  <Button size="sm" onClick={() => syncStore(s.id)}>
                    {t('ecommerce.actions.syncStore')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-base font-semibold">{t('ecommerce.logs.title')}</h2>

          <div className="mt-3 space-y-2">
            {loadingLogs && (
              <div className="text-sm text-gray-500">{t('common.loading')}</div>
            )}

            {!loadingLogs && logs.length === 0 && (
              <div className="text-sm text-gray-500">{t('ecommerce.logs.empty')}</div>
            )}

            {!loadingLogs && logs.map((l) => (
              <div key={l.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{l.status}</div>
                  <div className="text-xs text-gray-500">{new Date(l.startedAt).toLocaleString('vi-VN')}</div>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {l.syncType} · {l.itemsProcessed}
                </div>
                {l.errorMessage && (
                  <div className="text-xs text-red-600 mt-1">{l.errorMessage}</div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tab value="woocommerce" label="WooCommerce" />
        <Tab value="shopify" label="Shopify" />
        <Tab value="shopee" label="Shopee" />
        <Tab value="tiktokshop" label="TikTok Shop" />
        <Tab value="amazon" label="Amazon" />
        <Tab value="ebay" label="eBay" />
      </Tabs>

      {activeTab === 'tiktokshop' && (
        <Card className="mt-4 p-4">
          <div className="space-y-4">
            <Input label={t('ecommerce.tiktokAppKey')} value={tiktokConfig.appKey} onChange={e => setTiktokConfig({ ...tiktokConfig, appKey: e.target.value })} />
            <Input label={t('ecommerce.tiktokAppSecret')} type="password" value={tiktokConfig.appSecret} onChange={e => setTiktokConfig({ ...tiktokConfig, appSecret: e.target.value })} />
            <Input label={t('ecommerce.tiktokShopId')} value={tiktokConfig.shopId} onChange={e => setTiktokConfig({ ...tiktokConfig, shopId: e.target.value })} />
            <Button onClick={saveTikTok}>{t('actions.save')}</Button>
          </div>
        </Card>
      )}

      {activeTab === 'amazon' && (
        <Card className="mt-4 p-4">
          <div className="space-y-4">
            <Input label={t('ecommerce.amazonClientId')} value={amazonConfig.clientId} onChange={e => setAmazonConfig({ ...amazonConfig, clientId: e.target.value })} />
            <Input label={t('ecommerce.amazonClientSecret')} type="password" value={amazonConfig.clientSecret} onChange={e => setAmazonConfig({ ...amazonConfig, clientSecret: e.target.value })} />
            <Input label={t('ecommerce.amazonRefreshToken')} type="password" value={amazonConfig.refreshToken} onChange={e => setAmazonConfig({ ...amazonConfig, refreshToken: e.target.value })} />
            <Input label={t('ecommerce.amazonSellerId')} value={amazonConfig.sellerId} onChange={e => setAmazonConfig({ ...amazonConfig, sellerId: e.target.value })} />
            <Select label={t('ecommerce.amazonRegion')} value={amazonConfig.region} onChange={v => setAmazonConfig({ ...amazonConfig, region: v })} options={[
              { value: 'na', label: 'North America' },
              { value: 'eu', label: 'Europe' },
              { value: 'fe', label: 'Far East' },
            ]} />
            <Button onClick={async () => {
              await apiClient.post('/ecommerce/stores', { platform: 'amazon', name: 'Amazon Store', configJson: JSON.stringify(amazonConfig) });
              toast.success(t('ecommerce.amazonSaved'));
            }}>{t('actions.save')}</Button>
          </div>
        </Card>
      )}

      {activeTab === 'ebay' && (
        <Card className="mt-4 p-4">
          <div className="space-y-4">
            <Input label={t('ecommerce.ebayAppId')} value={ebayConfig.appId} onChange={e => setEbayConfig({ ...ebayConfig, appId: e.target.value })} />
            <Input label={t('ecommerce.ebayCertId')} type="password" value={ebayConfig.certId} onChange={e => setEbayConfig({ ...ebayConfig, certId: e.target.value })} />
            <Input label={t('ecommerce.ebayDevId')} type="password" value={ebayConfig.devId} onChange={e => setEbayConfig({ ...ebayConfig, devId: e.target.value })} />
            <Input label={t('ecommerce.ebayUserToken')} type="password" value={ebayConfig.userToken} onChange={e => setEbayConfig({ ...ebayConfig, userToken: e.target.value })} />
            <Input label={t('ecommerce.ebaySiteId')} value={ebayConfig.siteId} onChange={e => setEbayConfig({ ...ebayConfig, siteId: e.target.value })} />
            <Button onClick={async () => {
              await apiClient.post('/ecommerce/stores', { platform: 'ebay', name: 'eBay Store', configJson: JSON.stringify(ebayConfig) });
              toast.success(t('ecommerce.ebaySaved'));
            }}>{t('actions.save')}</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
