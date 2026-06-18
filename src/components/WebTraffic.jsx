import React, {useState} from 'react'
import { useTranslation } from 'react-i18next';
import CardFilter from './CardFilter';
import WebTrafficChart from './WebTrafficChart';

function WebTraffic() {
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
                    {t('Tráfico web')} <span>| {t(filter)}</span>
                </h5>
                <WebTrafficChart />
            </div>
        </div>
    );
}

export default WebTraffic; 