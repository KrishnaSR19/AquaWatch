"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";
import { useEffect, useState } from "react";
import { fetchHistory } from "@/lib/api";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function HistoryChart({ stationId }: { stationId: string }) {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (!stationId) return;

    fetchHistory(stationId).then(data => {
      setChartData({
        labels: data.map((d: any) =>
          new Date(d.timestamp).toLocaleDateString()
        ),
        datasets: [
          {
            label: "30-Day Groundwater Trend",
            data: data.map((d: any) => d.water_level_m_bgl),
            borderColor: "#2563eb",
            backgroundColor: "rgba(37,99,235,0.3)",
            tension: 0.45,
            fill: true
          }
        ]
      });
    });
  }, [stationId]);

  if (!chartData) return null;

  return <Line data={chartData} />;
}
