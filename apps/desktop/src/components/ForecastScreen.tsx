import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ForecastData {
  productId: string;
  data: { month: string; demand: number }[];
}

export function ForecastScreen() {
  const { t } = useTranslation();
  const [data, setData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder: fetch from /forecast/product/:id
    // For now, render placeholder UI
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{t('forecast.title')}</h1>
      <p className="text-gray-600 mb-4">{t('forecast.description')}</p>
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm text-gray-500">{t('common.noData')}</p>
      </div>
    </div>
  );
}