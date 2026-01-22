"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { useEffect, useState } from "react";
import { fetchHistory, fetchForecast } from "@/lib/api";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
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
            label: "Observed (Last 30 Days)",
            data: history.map((d: any) => d.water_level_m_bgl),
            borderColor: "#2563eb",
            backgroundColor: "rgba(37,99,235,0.15)",
            tension: 0.45,
            fill: true,
            pointRadius: 0,
            borderWidth: 2
          },
          {
            label: "Forecast (Next 7 Days)",
            data: [
              ...new Array(history.length).fill(null),
              ...forecast.map((d: any) => d.water_level_m_bgl)
            ],
            borderColor: "#f97316",
            backgroundColor: "rgba(249,115,22,0.15)",
            borderDash: [6, 4],
            tension: 0.45,
            fill: true,
            pointRadius: 3,
            borderWidth: 2
          }
        ]
      });
    }

    loadData();
  }, [stationId]);

  if (!chartData) return null;

  return (
    <div className="bg-white rounded-2xl shadow border p-4">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-sm font-semibold">
          📊 Groundwater Trend & Forecast
        </h2>
        <p className="text-xs text-gray-500">
          30-day historical levels with 7-day projection
        </p>
      </div>

      {/* Chart */}
      <div className="h-[300px]">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: "index",
              intersect: false
            },
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  boxWidth: 10,
                  usePointStyle: true,
                  font: {
                    size: 11
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: (ctx) =>
                    `${ctx.dataset.label}: ${ctx.parsed.y} m bgl`
                }
              }
            },
            scales: {
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  maxTicksLimit: 8,
                  font: { size: 10 }
                }
              },
              y: {
                grid: {
                  color: "#f1f5f9"
                },
                ticks: {
                  font: { size: 10 }
                },
                title: {
                  display: true,
                  text: "Water Level (m bgl)",
                  font: { size: 11 }
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
}
