"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";

type ZoneData = {
  station_id: string;
  latitude: number;
  longitude: number;
  zone: string;
};

const API_BASE = "http://127.0.0.1:8000";

function getZoneStyle(zone: string) {
  switch (zone) {
    case "Safe":
      return { color: "#16a34a", fillColor: "#22c55e" };
    case "Semi-Critical":
      return { color: "#f59e0b", fillColor: "#fbbf24" };
    case "Critical":
      return { color: "#dc2626", fillColor: "#ef4444" };
    default:
      return { color: "#6b7280", fillColor: "#9ca3af" };
  }
}

function getZoneBadge(zone: string) {
  switch (zone) {
    case "Safe":
      return "bg-gray-100 border-gray-300";
    case "Semi-Critical":
      return "bg-gray-200 border-gray-400";
    case "Critical":
      return "bg-red-50 border-red-300";
    default:
      return "bg-gray-100 border-gray-300";
  }
}

export default function ZoneMap() {
  const [zones, setZones] = useState<ZoneData[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/zones`)
      .then(res => res.json())
      .then(setZones);
  }, []);

  return (
    <div className="relative w-full h-[420px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">

      {/* Map */}
      <MapContainer
        center={[22.5937, 78.9629]}
        zoom={5}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {zones.map(station => {
          const style = getZoneStyle(station.zone);

          return (
            <CircleMarker
              key={station.station_id}
              center={[station.latitude, station.longitude]}
              radius={8}
              pathOptions={{
                color: style.color,
                fillColor: style.fillColor,
                fillOpacity: 0.85,
                weight: 2
              }}
            >
              <Popup>
                <div className="space-y-2 text-sm text-black">
                  <div className="font-semibold">
                    {station.station_id}
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Zone:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${getZoneBadge(
                        station.zone
                      )}`}
                    >
                      {station.zone}
                    </span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Overlay Title */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-200 shadow text-sm font-semibold text-black z-10">
        🗺️ Groundwater Zone Map
      </div>
    </div>
  );
}
