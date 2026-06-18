import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CardFilter from './CardFilter';
import BudgetChart from './BudgetChart';

function BudgetReport() {
    const { t } = useTranslation();
    const [filter, setFilter] = useState('Hoy');
    const handleFilterChange = (filter) => {
        setFilter(filter);
    };
    
    return (
        <div className="card">
            <CardFilter filterChange={handleFilterChange} />
            
            <div className="card-body pb-0">
                <h5 className="card-title">
                    {t('Informe de presupuesto')} <span>| {t(filter)}</span>
                </h5>
                <BudgetChart />
            </div>
        </div>
    );
}

export default BudgetReport;