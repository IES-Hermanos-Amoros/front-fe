import React, {useState, useEffect} from 'react'
import { useTranslation } from 'react-i18next';
import './topSelling.css'
import CardFilter from './CardFilter';
import TopSellingItem from './TopSellingItem';

function TopSelling() {
    const { t } = useTranslation();
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState('Hoy');
    const handleFilterChange = filter => {
    setFilter(filter);
    };

    const fetchData = () => {
    fetch('http://localhost:4000/topselling')
      .then(res => res.json())
      .then(data => {
        setItems(data);
      })
      .catch(e => console.log(e.message));
    };

    useEffect(() => {
        fetchData();
    }, []);

    return ( 
        <div className="card top-selling overflow-auto">
            <CardFilter filterChange={handleFilterChange} />

            <div className="card-body pb-0">
                <h5 className="card-title">
                    {t('Más vendidos')} <span>| {t(filter)}</span>
                </h5>

                <table className="table table-borderless">
                    <thead className="table-light">
                        <tr>
                            <th scope="col">{t('Vista previa')}</th>
                            <th scope="col">{t('Producto')}</th>
                            <th scope="col">{t('Precio')}</th>
                            <th scope="col">{t('Vendidos')}</th>
                            <th scope="col">{t('Ingresos')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items &&
                            items.length > 0 &&
                            items.map(item => <TopSellingItem key={item._id} item={item}/>)}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TopSelling