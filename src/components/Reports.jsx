import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CardFilter from './CardFilter';
import ReportCharts from './ReportCharts';

function Reports() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('Hoy');
  const handleFilterChange = filter => {
    setFilter(filter);
  };

  return (
    <div className="card">
      <CardFilter filterChange={handleFilterChange} />
      <div className="card-body">
        <h5 className="card-title">
          {t('Informes')} <span>| {t(filter)}</span>
        </h5>
        <ReportCharts />
      </div>
    </div>
  );
}

export default Reports;