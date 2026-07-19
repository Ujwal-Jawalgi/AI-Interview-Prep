"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface ProgressChartProps {
  data: {
    labels: string[];
    interviewScores: number[];
    resumeScores: number[];
  };
}

export default function ProgressChart({ data }: ProgressChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        fill: true,
        label: "Interview Score",
        data: data.interviewScores,
        borderColor: "rgb(139, 92, 246)", // violet-500
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        tension: 0.4,
        pointBackgroundColor: "rgb(139, 92, 246)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(139, 92, 246)",
      },
      {
        fill: true,
        label: "Resume Score",
        data: data.resumeScores,
        borderColor: "rgb(6, 182, 212)", // cyan-500
        backgroundColor: "rgba(6, 182, 212, 0.1)",
        tension: 0.4,
        pointBackgroundColor: "rgb(6, 182, 212)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(6, 182, 212)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "rgba(255, 255, 255, 0.7)",
          usePointStyle: true,
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(13, 18, 36, 0.9)",
        titleColor: "#fff",
        bodyColor: "rgba(255, 255, 255, 0.7)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 13,
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.5)",
          stepSize: 20,
        },
        border: { dash: [4, 4] },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.5)",
        },
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
  };

  if (!data.labels.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-500">
        <p>No progress data available yet.</p>
        <p className="text-sm mt-1">Complete an interview or resume scan to see your progress.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <Line data={chartData} options={options} />
    </div>
  );
}
