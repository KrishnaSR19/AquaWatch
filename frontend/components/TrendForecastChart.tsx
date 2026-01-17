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
import { fetchHistory, fetchForecast } from "@/lib/api";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function TrendForecastChart({
  stationId
}: {
  stationId: string;
}) {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (!stationId) return;

    async function loadData() {
      const history = await fetchHistory(stationId);
      const forecast = await fetchForecast(stationId);

      // X-axis labels
      const historyLabels = history.map((d: any) =>
        new Date(d.timestamp).toLocaleDateString()
      );

      const forecastLabels = forecast.map((d: any) =>
        new Date(d.date).toLocaleDateString()
      );

      const labels = [...historyLabels, ...forecastLabels];

      setChartData({
        labels,
        datasets: [
          {
            label: "Historical Water Level (Last 30 Days)",
            data: history.map((d: any) => d.water_level_m_bgl),
            borderColor: "#2563eb",
            backgroundColor: "rgba(37,99,235,0.25)",
            tension: 0.4,
            fill: true,
            pointRadius: 2
          },
          {
            label: "Forecast (Next 7 Days)",
            data: [
              ...new Array(history.length).fill(null),
              ...forecast.map((d: any) => d.water_level_m_bgl)
            ],
            borderColor: "#f97316",
            backgroundColor: "rgba(249,115,22,0.25)",
            borderDash: [6, 4],
            tension: 0.4,
            fill: true,
            pointRadius: 4
          }
        ]
      });
    }

    loadData();
  }, [stationId]);

  if (!chartData) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">
        📊 Groundwater Trend & Forecast
      </h2>
      <Line data={chartData} />
    </div>
  );
}
