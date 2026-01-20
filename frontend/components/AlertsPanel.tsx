"use client";

import { useEffect, useState } from "react";
import { fetchAlerts } from "@/lib/api";

type Alert = {
  station_id: string;
  district: string;
  water_level_m_bgl: number;
  alert_reason: string;
};

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      setLoading(true);
      const data = await fetchAlerts();
      setAlerts(data);
      setLoading(false);
    };

    loadAlerts();
    const id = setInterval(loadAlerts, 60000);
    return () => clearInterval(id);
  }, []);

  const hasAlerts = alerts.length > 0;

  return (
    <div
      className={`rounded-2xl shadow border ${
        hasAlerts ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-black">
          🚨 Alerts
        </h2>

        {!loading && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium text-black ${
              hasAlerts ? "bg-red-100" : "bg-gray-200"
            }`}
          >
            {hasAlerts ? alerts.length : "0"}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3 max-h-[260px] overflow-y-auto text-xs text-black">
        {loading && <p className="text-black/60">Checking alerts…</p>}

        {!loading && !hasAlerts && (
          <p className="text-black/70">All stations operating normally</p>
        )}

        {!loading &&
          alerts.slice(0, 4).map((alert, idx) => (
            <div
              key={idx}
              className="mb-2 rounded-lg border-l-4 border-red-500 bg-white p-2"
            >
              <div className="font-semibold">
                {alert.station_id}
              </div>

              <div className="text-black/80">
                WL: <b>{alert.water_level_m_bgl}</b> m bgl
              </div>

              <div className="text-black/70 truncate">
                {alert.alert_reason}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
