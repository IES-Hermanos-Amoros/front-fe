import { useTranslation } from 'react-i18next';
import BaseChart from './BaseChart';

const PieChart = ({ title, data }) => {
  const { t } = useTranslation();
  const option = {
    title: { text: t(title), left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', show: false },
    series: [
      {
        name: title,
        type: 'pie',
        radius: '50%', // Si pones ['40%', '70%'] se convierte en Donut
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  return <BaseChart option={option} />;
};

export default PieChart;