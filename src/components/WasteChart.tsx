import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface WasteChartProps {
  wasteData: {
    [key: string]: number;
  };
}

const WasteChart: React.FC<WasteChartProps> = ({ wasteData }) => {
  const chartData = {
    labels: Object.keys(wasteData).map(
      (key) => key.charAt(0).toUpperCase() + key.slice(1)
    ),
    datasets: [
      {
        label: 'kg of Waste',
        data: Object.values(wasteData),
        backgroundColor: [
          'rgba(59, 130, 246, 0.9)',   // Plastic - soft blue
          'rgba(16, 185, 129, 0.9)',   // Biodegradable - green
          'rgba(107, 114, 128, 0.9)',  // E-waste - gray
          'rgba(249, 115, 22, 0.9)',   // Other - orange
        ],
        borderColor: '#fff',
        borderWidth: 6,
        hoverOffset: 12, // slight zoom on hover for interactivity
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true, // ensures perfect circle
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 16,
          font: {
            size: 14,
            family: 'Inter, sans-serif',
          },
          color: '#374151',
        },
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#f9fafb',
        bodyColor: '#d1d5db',
        cornerRadius: 8,
        padding: 12,
      },
    },
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '400px',
        height: '400px',
        margin: '0 auto',
        borderRadius: '50%', // ensures circular container
        background: 'radial-gradient(circle at center, #f9fafb, #e5e7eb)', // soft background
        boxShadow: '0 10px 25px rgba(0,0,0,0.1), inset 0 4px 8px rgba(0,0,0,0.05)',
        padding: '20px',
      }}
    >
      <Doughnut data={chartData} options={options} />

      {/* Centered text inside the donut */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
          Waste Stats
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
          {Object.values(wasteData).reduce((a, b) => a + b, 0)} kg
        </p>
      </div>
    </div>
  );
};

export default WasteChart;
