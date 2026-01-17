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

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">
        💧 Recharge & Availability
      </h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          Rainfall (mm)
          <div className="font-semibold">{data.rainfall_mm}</div>
        </div>

        <div>
          Season
          <div className="font-semibold">{data.season}</div>
        </div>

        <div>
          Estimated Recharge (mm)
          <div className="font-semibold text-blue-600">
            {data.estimated_recharge_mm}
          </div>
        </div>

        <div>
          Estimated Demand (mm)
          <div className="font-semibold text-orange-600">
            {data.estimated_demand_mm}
          </div>
        </div>

        <div className="col-span-2">
          Available Groundwater (mm)
          <div
            className={`font-bold text-lg ${
              data.available_groundwater_mm > 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {data.available_groundwater_mm}
          </div>
        </div>
      </div>

      <div className="mt-4">
        Status:
        <span
          className={`ml-2 font-semibold ${
            data.status === "Sustainable"
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {data.status}
        </span>
      </div>
    </div>
  );
}
