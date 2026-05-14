import React from 'react';
import { useTranslation } from 'react-i18next';
import { Chart } from '@smart-erp/ui';

export default function ForecastDashboard() {
  const { t } = useTranslation('common');

  // Placeholder data – to be replaced by real AI forecast service
  const data = [
    { month: 'Jan', demand: 120 },
    { month: 'Feb', demand: 135 },
    { month: 'Mar', demand: 150 },
    { month: 'Apr', demand: 165 },
    { month: 'May', demand: 180 },
    { month: 'Jun', demand: 200 },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{t('forecast.title')}</h1>
      <Chart
        type="line"
        data={data.map((d) => ({ x: d.month, y: d.demand }))}
        xLabel={t('forecast.month')}
        yLabel={t('forecast.demand')}
      />
      <p className="mt-4 text-sm text-gray-600">{t('forecast.description')}</p>
    </div>
  );
}
