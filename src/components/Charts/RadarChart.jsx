import { useTranslation } from 'react-i18next';
import BaseChart from './BaseChart';

const RadarChart = ({ title, data }) => {
  const { t } = useTranslation();
  // 1. Buscamos el valor más alto real en tus datos (ej: si el top tiene 25 alumnos, el max será 25)
  const maxRealValue = data.length > 0 ? Math.max(...data.map(item => item.value)) : 10;
  
  // 2. Redondeamos hacia arriba para tener un número bonito en el extremo exterior (ej: si es 25, lo llevamos a 30)
  const ejeMaximo = Math.ceil(maxRealValue / 10) * 10;

  const option = {
    title: { text: t(title), left: 'center', textStyle: { fontSize: 16 } },
    // 🚀 SOLUCIÓN AL CORTE DEL TOOLTIP
    tooltip: { 
      trigger: 'item',
      confine: true // Mantiene el globo del tooltip SIEMPRE dentro de los límites del gráfico
    },
    radar: {
      // 🚀 SOLUCIÓN: Forzamos a que cada indicador empiece obligatoriamente en 0 
      // y termine en nuestro máximo redondeado. Así los valores grandes SIEMPRE van hacia fuera.
      indicator: data.map(item => ({
        name: item.name,
        min: 0,
        max: ejeMaximo
      })),
      shape: 'circle',
      splitNumber: 5,
      axisName: { color: '#666' },
      splitLine: { lineStyle: { color: ['#eee'] } },
      splitArea: { show: false },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: data.map(item => item.value),
            name: t('Total de alumnos por habilidad'),
            areaStyle: { opacity: 0.3, color: '#3498db' },
            lineStyle: { width: 2, color: '#3498db' },
            itemStyle: { color: '#3498db' }
          }
        ]
      }
    ]
  };

  return <BaseChart option={option} />;
};

export default RadarChart;