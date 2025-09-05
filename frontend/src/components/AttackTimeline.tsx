import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Attack {
  id: string;
  timestamp: Date;
  sourceIP: string;
  endpoint: string;
  method: string;
  payload?: string;
  blocked: boolean;
}

interface AttackTimelineProps {
  attacks: Attack[];
}

export const AttackTimeline = ({ attacks }: AttackTimelineProps) => {
  const chartRef = useRef<ChartJS<"line">>(null);

  // Group attacks by hour for the last 24 hours
  const getHourlyData = () => {
    const now = new Date();
    const hours = [];
    const attackCounts = [];
    const blockedCounts = [];

    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(now);
      hourStart.setHours(now.getHours() - i, 0, 0, 0);
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(hourStart.getHours() + 1);

      const hourAttacks = attacks.filter(
        (attack) => attack.timestamp >= hourStart && attack.timestamp < hourEnd
      );

      hours.push(hourStart.getHours().toString().padStart(2, '0') + ':00');
      attackCounts.push(hourAttacks.length);
      blockedCounts.push(hourAttacks.filter(a => a.blocked).length);
    }

    return { hours, attackCounts, blockedCounts };
  };

  const { hours, attackCounts, blockedCounts } = getHourlyData();

  const data = {
    labels: hours,
    datasets: [
      {
        label: "Total Attacks",
        data: attackCounts,
        borderColor: "hsl(0, 70%, 70%)",
        backgroundColor: "hsl(0, 70%, 70%, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "hsl(0, 70%, 70%)",
        pointBorderColor: "hsl(0, 70%, 70%)",
        pointHoverRadius: 6,
      },
      {
        label: "Blocked Attacks",
        data: blockedCounts,
        borderColor: "hsl(150, 95%, 45%)",
        backgroundColor: "hsl(150, 95%, 45%, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "hsl(150, 95%, 45%)",
        pointBorderColor: "hsl(150, 95%, 45%)",
        pointHoverRadius: 6,
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
          color: "hsl(150, 30%, 85%)",
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "hsl(150, 50%, 18%)",
        titleColor: "hsl(150, 30%, 85%)",
        bodyColor: "hsl(150, 30%, 85%)",
        borderColor: "hsl(150, 50%, 25%)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: "hsl(150, 50%, 25%)",
          drawBorder: false,
        },
        ticks: {
          color: "hsl(150, 30%, 65%)",
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: "hsl(150, 50%, 25%)",
          drawBorder: false,
        },
        ticks: {
          color: "hsl(150, 30%, 65%)",
          font: {
            size: 11,
          },
        },
        beginAtZero: true,
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update("none");
    }
  }, [attacks]);

  return (
    <div className="metric-card">
      <h3 className="text-lg font-semibold mb-4">Attack Timeline (24h)</h3>
      <div className="h-64">
        <Line ref={chartRef} data={data} options={options} />
      </div>
      <div className="mt-4 flex justify-between text-sm text-secondary">
        <span>Last 24 hours</span>
        <span>{attackCounts.reduce((a, b) => a + b, 0)} total attacks</span>
      </div>
    </div>
  );
};