import { useTranslation } from 'react-i18next';
import BaseChart from './BaseChart';

const HorizontalBarChart = ({ title, data }) => {
  const { t } = useTranslation();
  const sortedData = [...data].sort((a, b) => a.value - b.value);

  // 🚀 CÁLCULO DINÁMICO: 35px por cada barra + 80px para título y márgenes
  const minHeightPerBar = 35; 
  const calculatedHeight = (sortedData.length * minHeightPerBar) + 80;

  const option = {
    title: { text: t(title) },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    // Ajustamos el top del grid para que el título no se solape si hay scroll
    grid: { left: '3%', right: '8%', bottom: '3%', top: '60px', containLabel: true },
    xAxis: { type: 'value', boundaryGap: [0, 0.01] },
    yAxis: {
      type: 'category',
      data: sortedData.map(item => item.name),
      axisLabel: {
        interval: 0 // 🚀 Obliga a ECharts a mostrar TODOS los nombres del eje Y sin saltarse ninguno
      }
    },
    // 🚀 NUEVO: Activa el scrollbar vertical dentro del gráfico
    dataZoom: [
      {
        type: 'slider', // Barra de scroll interactiva
        yAxisIndex: 0,  // Se aplica al eje Y
        right: 10,      // Posición a la derecha
        start: 70,      // Muestra por defecto desde el 70% 
        end: 100,       // hasta el 100% de los datos (los más grandes arriba)
        zoomLock: false  // Permite hacer scroll y también redimensionar la ventana de zoom
      },
      {
        type: 'inside', // Permite hacer scroll arrastrando directamente el dedo en móviles o con la rueda del ratón
        yAxisIndex: 0,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true
      }
    ],
    series: [
      {
        type: 'bar',
        data: sortedData.map(item => item.value),
        barWidth: '60%', // Controla el grosor de la barra dentro de su celda
        itemStyle: {
          color: '#ff771d',
          borderRadius: [0, 5, 5, 0]
        },
        label: { show: true, position: 'right' }
      }
    ]
  };

  // Le pasamos la altura calculada al contenedor
  return (
    
      <BaseChart option={option} />
    
  );
};

export default HorizontalBarChart;