import React, {useState, useEffect} from 'react'
import { useTranslation } from 'react-i18next';
import './news.css';
import CardFilter from './CardFilter';
import NewsPostItem from './NewsPostItem';

function News() {
    const { t } = useTranslation();
    const [news, setNews] = useState([]);
    const [filter, setFilter] = useState('Hoy');
    const handleFilterChange = (filter) => {
        setFilter(filter);
    };

    const fetchData = () => {
        fetch("http://localhost:4000/news")
            .then(res => res.json())
            .then(data => {
                setNews(data);
            })
            .catch(e => console.log(e.message));
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="card">
            <CardFilter filterChange={handleFilterChange} />
            
            <div className="card-body pb-0">
                <h5 className="card-title">
                    {t('Noticias y novedades')} <span>| {t(filter)}</span>
                </h5>

                <div className="news">
                    {news && news.length > 0 && 
                        news.map(item => <NewsPostItem key={item._id} item={item}/>)}
                </div>
            </div>
        </div>
    );
}

export default News;