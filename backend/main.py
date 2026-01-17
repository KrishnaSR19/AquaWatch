from fastapi import FastAPI
import pandas as pd

from fastapi.middleware.cors import CORSMiddleware


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
