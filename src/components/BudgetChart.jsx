import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as echarts from "echarts";

function BudgetChart() {
    const { t } = useTranslation();
    useEffect(() => {
        const chart = echarts.init(document.querySelector('#budgetChart'));
        chart.setOption({
            legend: {
                data: [t('Presupuesto asignado'), t('Gasto real')],
            },
            radar: {
                shape: 'circle',
                indicator: [
                    {
                        name: t('Ventas'),
                        max: 6500,
                    },
                    {
                        name: t('Administración'),
                        max: 16000,
                    },
                    {
                        name: t('Tecnologías de la información'),
                        max: 30000,
                    },
                    {
                        name: t('Atención al cliente'),
                        max: 38000,
                    },
                    {
                        name: t('Desarrollo'),
                        max: 52000,
                    },
                    {
                        name: t('Marketing'),
                        max: 25000,
                    }
                ]
            },
            series: [
                {
                    name: t('Presupuesto vs gasto'),
                    type: 'radar',
                    data: [
                        {
                            value: [4200, 3000, 20000, 35000, 50000, 18000],
                            name: t('Presupuesto asignado'),
                        },
                        {
                            value: [5000, 14000, 28000, 26000, 42000, 21000],
                            name: t('Gasto real'),
                        },
                    ],
                },
            ],
        });
        return () => chart.dispose();
    }, [t]);
    return (
        <div
        id='budgetChart'
        style={{ minHeight: '400px' }}
        className="echart"
        ></div>
    );
}

export default BudgetChart;