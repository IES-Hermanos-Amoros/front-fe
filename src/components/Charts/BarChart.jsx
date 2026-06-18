import { useTranslation } from 'react-i18next';
import BaseChart from './BaseChart';

const BarChart = ({ title, labels, values, color = '#5470c6' }) => {
  const { t } = useTranslation();
  const option = {
    title: { text: t(title) },
    tooltip: {},
    xAxis: { data: labels },
    yAxis: {},
    series: [{
      type: 'bar',
      data: values,
      itemStyle: { color }
    }]
  };

  return <BaseChart option={option} />;
};

export default BarChart;