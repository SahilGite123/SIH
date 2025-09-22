import React from 'react';
import Card from '../UI/Card';
import { useTranslation } from 'react-i18next';

const Analytics = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('analytics')}</h1>

      <Card className="p-6">
        <p className="text-gray-600 dark:text-gray-300">
          {/* TODO: Show analytics like quiz completions, searches, reminders opened using Chart.js */}
          {t('analytics_placeholder') || 'Analytics charts and metrics will appear here.'}
        </p>
      </Card>
    </div>
  );
};

export default Analytics;
