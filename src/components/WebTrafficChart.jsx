import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as echarts from 'echarts';

function WebTrafficChart() {
    const { t } = useTranslation();
    useEffect(() => {
        const chart = echarts.init(document.querySelector('#trafficChart'));
        chart.setOption({
            tooltip: {
                trigger: 'item'
            },
            legend: {
                top: '5%',
                left: 'center'
            },
            series: [
                {
                    name: t('Procedencia del acceso'),
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '18',
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: [
                        {
                            value: 1048,
                            name: t('Motor de búsqueda')
                        },
                        {
                            value: 735,
                            name: t('Directo')
                        },
                        {
                            value: 580,
                            name: t('Correo')
                        },
                        {
                            value: 484,
                            name: t('Anuncios Union')
                        },
                        {
                            value: 300,
                            name: t('Anuncios de vídeo')
                        },
                    ],
                },
            ],
        });
        return () => chart.dispose();
    }, [t]);
    return (
        <div 
        id="trafficChart"
        style={{minHeight: '400px'}}
        className='echart'
        ></div>
    );
}

export default WebTrafficChart;