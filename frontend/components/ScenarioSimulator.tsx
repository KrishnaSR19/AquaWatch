"use client";

import { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function ScenarioSimulator({
  stationId
}: {
  stationId: string;
}) {
  const [rainfallFactor, setRainfallFactor] = useState(1);
  const [demandFactor, setDemandFactor] = useState(1);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!stationId) return;

    fetch(`${API_BASE}/api/scenario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        station_id: stationId,
        rainfall_factor: rainfallFactor,
        demand_factor: demandFactor
      })
    })
      .then(res => res.json())
      .then(setResult);
  }, [stationId, rainfallFactor, demandFactor]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-black">
        ⚠️ Demand–Supply Scenario Simulator
      </h2>

      {/* Controls */}
      <div className="space-y-4 text-sm text-black">
        <div>
          <label className="block font-medium mb-1">
            Rainfall Factor ({rainfallFactor})
          </label>
          <input
            type="range"
            min="0.5"
            max="1.2"
            step="0.1"
            value={rainfallFactor}
            onChange={e => setRainfallFactor(Number(e.target.value))}
            className="w-full accent-black"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">
            Demand Factor ({demandFactor})
          </label>
          <input
            type="range"
            min="0.8"
            max="1.5"
            step="0.1"
            value={demandFactor}
            onChange={e => setDemandFactor(Number(e.target.value))}
            className="w-full accent-black"
          />
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-6 text-sm space-y-2 text-black">
          <div>
            Adjusted Recharge: <b>{result.adjusted_recharge}</b>
          </div>

          <div>
            Adjusted Demand: <b>{result.adjusted_demand}</b>
          </div>

          <div>
            Net Availability: <b>{result.net_availability}</b>
          </div>

          <div className="flex items-center gap-2">
            <span>Risk Level:</span>
            <span
              className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${
                result.risk_level === "Low"
                  ? "bg-gray-100 border-gray-300"
                  : result.risk_level === "Medium"
                  ? "bg-gray-200 border-gray-400"
                  : "bg-red-50 border-red-300"
              }`}
            >
              {result.risk_level}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
