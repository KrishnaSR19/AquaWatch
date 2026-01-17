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
    fetchAlerts()
      .then(data => {
        setAlerts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold text-red-600 mb-4">
        🚨 Early Warning Alerts
      </h2>

      {loading && (
        <p className="text-sm text-gray-500">
          Checking groundwater alerts...
        </p>
      )}

      {!loading && alerts.length === 0 && (
        <p className="text-sm text-green-600">
          ✅ No critical alerts at the moment
        </p>
      )}

      <div className="space-y-3">
        {alerts.map((alert, idx) => (
          <div
            key={idx}
            className="border-l-4 border-red-500 bg-red-50 p-4 rounded"
          >
            <div className="font-semibold text-gray-800">
              {alert.station_id} ({alert.district})
            </div>

            <div className="text-sm text-gray-700 mt-1">
              Water Level:{" "}
              <span className="font-medium">
                {alert.water_level_m_bgl} m bgl
              </span>
            </div>

            <div className="text-sm text-red-700 mt-1">
              Reason: {alert.alert_reason}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
