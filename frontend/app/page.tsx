"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import HistoryChart from "@/components/HistoryChart";
import TrendForecastChart from "@/components/TrendForecastChart";
import AvailabilityCard from "@/components/AvailabilityCard";
import ScenarioSimulator from "@/components/ScenarioSimulator";
import AlertsPanel from "@/components/AlertsPanel";
import ZoneMap from "@/components/ZoneMap";
import KpiCard from "@/components/KpiCard";

import { fetchGroundwater, fetchSummary } from "@/lib/api";

export default function Dashboard() {
  const [stations, setStations] = useState<any[]>([]);
  const [stationId, setStationId] = useState("");
  const [summary, setSummary] = useState<any>(null);

  // Icons (neutral)
  const DropIcon = () => <span className="text-black text-xl">💧</span>;
  const RechargeIcon = () => <span className="text-black text-xl">📈</span>;
  const AlertIcon = () => <span className="text-black text-xl">⚠️</span>;
  const StationIcon = () => <span className="text-black text-xl">📡</span>;

  useEffect(() => {
    fetchGroundwater().then((data) => {
      setStations(data);
      if (data.length > 0) {
        setStationId(data[0].station_id);
      }
    });

    fetchSummary().then(setSummary);
  }, []);

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8 bg-gray-50 min-h-screen space-y-8 text-black">

        {/* ================= KPI SECTION ================= */}
        {summary && (
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              <KpiCard
                title="Average Water Level"
                value={`${summary.avg_water_level} m`}
                subtitle="Across all stations"
                icon={<DropIcon />}
                bg="bg-gray-100"
              />
              <KpiCard
                title="Total Recharge"
                value={`${summary.total_recharge} MCM`}
                subtitle="Annual estimate"
                icon={<RechargeIcon />}
                bg="bg-gray-100"
              />
              <KpiCard
                title="Critical Alerts"
                value={summary.critical_alerts}
                subtitle="Require attention"
                icon={<AlertIcon />}
                bg="bg-gray-100"
              />
              <KpiCard
                title="Active Stations"
                value={summary.active_stations}
                subtitle="Real-time monitoring"
                icon={<StationIcon />}
                bg="bg-gray-100"
              />
            </div>
          </section>
        )}

        {/* ================= CONTROL BAR ================= */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-2xl shadow border border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-black">
              Station Selection
            </h2>
            <p className="text-sm text-black/70">
              Choose a DWLR station to view detailed analysis
            </p>
          </div>

          <select
            className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-64 text-black focus:outline-none focus:ring-1 focus:ring-black"
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
          >
            {stations.map((s) => (
              <option key={s.station_id} value={s.station_id}>
                {s.station_id} ({s.district})
              </option>
            ))}
          </select>
        </section>

        {/* ================= ALERTS + FORECAST ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AlertsPanel />
          <TrendForecastChart stationId={stationId} />
        </section>

        {/* ================= RECHARGE & SCENARIO ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AvailabilityCard stationId={stationId} />
          <ScenarioSimulator stationId={stationId} />
        </section>

        {/* ================= MAP SECTION ================= */}
        <section className="bg-white p-6 rounded-2xl shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-black">
            🗺️ Groundwater Zone Classification
          </h2>

          <ZoneMap />

          {/* Legend */}
          <div className="flex gap-6 mt-4 text-sm text-black">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-600"></span>
              Safe
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              Semi-Critical
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600"></span>
              Critical
            </span>
          </div>
        </section>

        {/* ================= RAW HISTORY ================= */}
        <section className="bg-white p-6 rounded-2xl shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-black">
            📈 Historical Groundwater Levels
          </h2>
          <HistoryChart stationId={stationId} />
        </section>

      </main>
    </>
  );
}
