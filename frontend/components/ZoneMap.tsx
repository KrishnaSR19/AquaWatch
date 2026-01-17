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

function getZoneColor(zone: string) {
  if (zone === "Safe") return "green";
  if (zone === "Semi-Critical") return "orange";
  if (zone === "Critical") return "red";
  return "gray";
}

export default function ZoneMap() {
  const [zones, setZones] = useState<ZoneData[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/zones`)
      .then(res => res.json())
      .then(data => setZones(data));
  }, []);

  return (
    <div className="h-125 w-full rounded-xl overflow-hidden shadow">
      <MapContainer
        center={[22.5937, 78.9629] as [number, number]}   // Center of India
        zoom={5}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // OpenStreetMap attribution is set by default in react-leaflet
        />

        {zones.map(station => (
          <CircleMarker
            key={station.station_id}
            center={[station.latitude, station.longitude]}
            pathOptions={{
              color: getZoneColor(station.zone),
              fillColor: getZoneColor(station.zone),
              fillOpacity: 0.8
            }}
            // Use 'radius' prop only if supported by your react-leaflet version
          >
            <Popup>
              <strong>{station.station_id}</strong><br />
              Zone: <b>{station.zone}</b>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
