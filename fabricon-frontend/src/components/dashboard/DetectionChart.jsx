import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Colors aligned to Fabricon design tokens (kept as literal hex since
// Chart.js can't read CSS variables directly)
const BAR_COLORS = ['#0B4F9E', '#D33A3A', '#E08A1E', '#5A6578'];

const DetectionChart = ({ labels, counts }) => {
  const data = {
    labels,
    datasets: [
      {
        label: 'Defects Detected',
        data: counts,
        backgroundColor: BAR_COLORS,
        borderRadius: 6,
        maxBarThickness: 56,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0A1F44',
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} occurrences`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#5A6578', font: { size: 12.5, weight: '500' } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#E1E5EB' },
        ticks: { color: '#8A93A6', stepSize: 25 },
      },
    },
  };

  return (
    <div className="fc-chart-container">
      <Bar data={data} options={options} />
    </div>
  );
};

export default DetectionChart;