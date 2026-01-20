"use client";

import { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function AvailabilityCard({
  stationId
}: {
  stationId: string;
}) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!stationId) return;

    fetch(`${API_BASE}/api/availability/${stationId}`)
      .then(res => res.json())
      .then(setData);
  }, [stationId]);

  if (!data) return null;

  const isSustainable = data.available_groundwater_mm > 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-black">
        💧 Recharge & Availability
      </h2>

      <div className="grid grid-cols-2 gap-4 text-sm text-black">
        <div>
          <div className="text-black/70">Rainfall (mm)</div>
          <div className="font-semibold">{data.rainfall_mm}</div>
        </div>

        <div>
          <div className="text-black/70">Season</div>
          <div className="font-semibold">{data.season}</div>
        </div>

        <div>
          <div className="text-black/70">Estimated Recharge (mm)</div>
          <div className="font-semibold">
            {data.estimated_recharge_mm}
          </div>
        </div>

        <div>
          <div className="text-black/70">Estimated Demand (mm)</div>
          <div className="font-semibold">
            {data.estimated_demand_mm}
          </div>
        </div>

        <div className="col-span-2">
          <div className="text-black/70">
            Available Groundwater (mm)
          </div>
          <div className="font-bold text-lg">
            {data.available_groundwater_mm}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-black">
        <span>Status:</span>
        <span
          className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${
            isSustainable
              ? "bg-gray-100 border-gray-300"
              : "bg-red-50 border-red-300"
          }`}
        >
          {data.status}
        </span>
      </div>
    </div>
  );
}
