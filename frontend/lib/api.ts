const API_BASE = "http://127.0.0.1:8000";

export async function fetchGroundwater() {
  const res = await fetch(`${API_BASE}/api/groundwater`);
  return res.json();
}

export async function fetchAlerts() {
  const res = await fetch(`${API_BASE}/api/alerts`);
  return res.json();
}

export async function fetchHistory(stationId: string) {
  const res = await fetch(`${API_BASE}/api/history/${stationId}`);
  return res.json();
}

export async function fetchForecast(stationId: string) {
  const res = await fetch(`${API_BASE}/api/forecast/${stationId}`);
  return res.json();
}

export async function fetchSummary() {
  const res = await fetch("http://127.0.0.1:8000/api/summary");
  return res.json();
}

