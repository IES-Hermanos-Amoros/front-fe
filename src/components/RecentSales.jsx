import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './recentSales.css';
import CardFilter from './CardFilter';
import RecentSalesTable from './RecentSalesTable';

function RecentSales() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('Hoy');
  const handleFilterChange = filter => {
    setFilter(filter);
  };

  const fetchData = () => {
    fetch('http://localhost:4000/recentSales')
      .then(res => res.json())
      .then(data => {
        setItems(data);
      })
      .catch(e => console.log(e.message));
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="card recent-sales overflow-auto">
      <CardFilter filterChange={handleFilterChange} />
      
      <div className="card-body">
        <h5 className="card-title">
          {t('Ventas recientes')} <span>| {t(filter)}</span>
        </h5>
        <RecentSalesTable items={items} />
      </div>
    </div>
  );
}

export default RecentSales;