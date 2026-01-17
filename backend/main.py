from fastapi import FastAPI
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI(
    title="DWLR Groundwater Monitoring API",
    description="Real-Time Groundwater Resource Evaluation Platform",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow all origins (hackathon safe)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



groundwater_df = pd.read_csv(
    "dwlr_levels_step3_enriched.csv",
    parse_dates=["timestamp"]
)

groundwater_df = groundwater_df.sort_values(
    ["station_id", "timestamp"]
).reset_index(drop=True)

forecast_df = pd.read_csv(
    "dwlr_forecast_7_days.csv",
    parse_dates=["date"]
)


@app.get("/")
def root():
    return {
        "status": "DWLR Backend Running",
        "message": "API is live"
    }


@app.get("/api/groundwater")
def get_groundwater_status():
    latest = groundwater_df.groupby("station_id").tail(1)

    response = []
    for _, row in latest.iterrows():
        response.append({
            "station_id": row["station_id"],
            "timestamp": row["timestamp"],
            "water_level_m_bgl": row["water_level_m_bgl"],
            "zone": row["zone"],
            "trend": row["trend"],
            "district": row["district"]
        })

    return response

@app.get("/api/zones")
def get_zone_data():
    latest = groundwater_df.groupby("station_id").tail(1)

    return latest[[
        "station_id",
        "latitude",
        "longitude",
        "zone"
    ]].to_dict(orient="records")

@app.get("/api/alerts")
def get_alerts():
    latest = groundwater_df.groupby("station_id").tail(1)
    alerts = latest[latest["alert_flag"] == True]

    return alerts[[
        "station_id",
        "district",
        "water_level_m_bgl",
        "alert_reason"
    ]].to_dict(orient="records")


@app.get("/api/forecast/{station_id}")
def get_forecast(station_id: str):
    sdf = forecast_df[forecast_df["station_id"] == station_id]

    if sdf.empty:
        return {
            "error": "Invalid station_id"
        }

    return sdf.to_dict(orient="records")


@app.get("/api/history/{station_id}")
def get_30_day_history(station_id: str):
    sdf = groundwater_df[
        groundwater_df["station_id"] == station_id
    ].sort_values("timestamp").tail(30)

    if sdf.empty:
        return {"error": "Invalid station_id"}

    return sdf[[
        "timestamp",
        "water_level_m_bgl"
    ]].to_dict(orient="records")


@app.get("/api/availability/{station_id}")
def get_availability(station_id: str):
    sdf = groundwater_df[
        groundwater_df["station_id"] == station_id
    ].sort_values("timestamp").tail(1)

    if sdf.empty:
        return {"error": "Invalid station_id"}

    row = sdf.iloc[0]

    rainfall = row["rainfall_mm"]
    season = row["season"]

    # Recharge factors (domain-based)
    recharge_factor = {
        "Monsoon": 0.20,
        "Post-Monsoon": 0.10,
        "Summer": 0.05
    }.get(season, 0.08)

    recharge = rainfall * recharge_factor

    # Dummy demand estimation (can be improved later)
    demand = 0.6 * recharge

    availability = recharge - demand

    sustainability = (
        "Sustainable" if availability > 0 else "Over-Exploited"
    )

    return {
        "station_id": station_id,
        "rainfall_mm": rainfall,
        "season": season,
        "estimated_recharge_mm": round(recharge, 2),
        "estimated_demand_mm": round(demand, 2),
        "available_groundwater_mm": round(availability, 2),
        "status": sustainability
    }


class ScenarioInput(BaseModel):
    station_id: str
    rainfall_factor: float    # e.g. 0.7 = 30% less rainfall
    demand_factor: float      # e.g. 1.3 = 30% more demand


@app.post("/api/scenario")
def run_scenario(data: ScenarioInput):

    sdf = groundwater_df[
        groundwater_df["station_id"] == data.station_id
    ].sort_values("timestamp").tail(1)

    if sdf.empty:
        return {"error": "Invalid station_id"}

    row = sdf.iloc[0]

    rainfall = row["rainfall_mm"]
    season = row["season"]

    recharge_factor = {
        "Monsoon": 0.20,
        "Post-Monsoon": 0.10,
        "Summer": 0.05
    }.get(season, 0.08)

    base_recharge = rainfall * recharge_factor
    base_demand = 0.6 * base_recharge

    adjusted_recharge = base_recharge * data.rainfall_factor
    adjusted_demand = base_demand * data.demand_factor

    net_availability = adjusted_recharge - adjusted_demand

    # Risk classification
    if net_availability > 10:
        risk = "Low"
    elif net_availability > 0:
        risk = "Medium"
    else:
        risk = "High"

    return {
        "station_id": data.station_id,
        "base_recharge": round(base_recharge, 2),
        "base_demand": round(base_demand, 2),
        "adjusted_recharge": round(adjusted_recharge, 2),
        "adjusted_demand": round(adjusted_demand, 2),
        "net_availability": round(net_availability, 2),
        "risk_level": risk
    }



@app.get("/api/summary")
def get_dashboard_summary():
    latest = groundwater_df.groupby("station_id").tail(1)

    # KPI 1: Average Water Level
    avg_water_level = round(latest["water_level_m_bgl"].mean(), 2)

    # KPI 2: Total Recharge (sum of estimated recharge)
    recharge_factor_map = {
        "Monsoon": 0.20,
        "Post-Monsoon": 0.10,
        "Summer": 0.05
    }

    def calc_recharge(row):
        return row["rainfall_mm"] * recharge_factor_map.get(row["season"], 0.08)

    total_recharge = round(latest.apply(calc_recharge, axis=1).sum(), 2)

    # KPI 3: Critical Alerts count
    critical_alerts = int(latest["alert_flag"].sum())

    # KPI 4: Active Stations
    active_stations = latest["station_id"].nunique()

    # Zone classification counts
    zone_counts = latest["zone"].value_counts().to_dict()

    return {
        "avg_water_level": avg_water_level,
        "total_recharge": total_recharge,
        "critical_alerts": critical_alerts,
        "active_stations": active_stations,
        "zones": {
            "safe": zone_counts.get("Safe", 0),
            "semi_critical": zone_counts.get("Semi-Critical", 0),
            "critical": zone_counts.get("Critical", 0),
            "total": active_stations
        }
    }
