import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# -----------------------------------
# Configuration (Hydrologically Valid)
# -----------------------------------
stations = [
    {"id": "DWLR_01", "lat": 18.52, "lon": 73.85, "district": "Pune", "rain_factor": 1.0},
    {"id": "DWLR_02", "lat": 28.61, "lon": 77.20, "district": "Delhi", "rain_factor": 0.6},
    {"id": "DWLR_03", "lat": 19.07, "lon": 72.87, "district": "Mumbai", "rain_factor": 1.8},
    {"id": "DWLR_04", "lat": 23.02, "lon": 72.57, "district": "Ahmedabad", "rain_factor": 0.7},
    {"id": "DWLR_05", "lat": 26.91, "lon": 75.79, "district": "Jaipur", "rain_factor": 0.6},
    {"id": "DWLR_06", "lat": 21.15, "lon": 79.09, "district": "Nagpur", "rain_factor": 0.9}
]

start_date = datetime(2022, 1, 1)
days = 1667   # ~10000 rows (6 × 1667)

# -----------------------------------
# Seasonal Logic (India-specific)
# -----------------------------------
def get_season(month):
    if month in [6, 7, 8, 9]:
        return "Monsoon"
    elif month in [10, 11]:
        return "Post-Monsoon"
    else:
        return "Pre-Monsoon"

def get_daily_rainfall(season, factor):
    if season == "Monsoon":
        return np.random.uniform(5, 25) * factor
    elif season == "Post-Monsoon":
        return np.random.uniform(0, 5) * factor
    else:
        return 0.0

# -----------------------------------
# Data Generation (Physics-aware)
# -----------------------------------
rows = []

for station in stations:
    # Initial groundwater depth (meters below ground level)
    water_level = np.random.uniform(5.0, 15.0)

    for d in range(days):
        date = start_date + timedelta(days=d)
        season = get_season(date.month)

        rainfall = get_daily_rainfall(season, station["rain_factor"])

        # ----------------------------
        # Groundwater Balance Equation
        # ----------------------------
        # ΔGWL = Pumping - Recharge

        # Base extraction (m/day)
        if season == "Pre-Monsoon":
            extraction = 0.008     # higher stress
        else:
            extraction = 0.004

        # Recharge coefficient (10–25% of rainfall)
        recharge_coeff = 0.15
        recharge = recharge_coeff * rainfall / 1000  # mm → meters

        # Update groundwater depth
        water_level = water_level + extraction - recharge

        # Physical constraints
        water_level = min(max(water_level, 2.0), 30.0)
        water_level = round(water_level, 2)

        rows.append([
            station["id"],
            date.strftime("%Y-%m-%d"),
            water_level,
            station["lat"],
            station["lon"],
            station["district"],
            season,
            round(rainfall, 1)
        ])

# -----------------------------------
# DataFrame & Save
# -----------------------------------
columns = [
    "station_id",
    "timestamp",
    "water_level_m_bgl",
    "latitude",
    "longitude",
    "district",
    "season",
    "rainfall_mm"
]

df = pd.DataFrame(rows, columns=columns)

# Enforce exactly 10,000 rows
df = df.head(10000)

df.to_csv("dwlr_levels.csv", index=False)

print("dwlr_levels.csv generated with realistic groundwater behavior (10,000 rows)")
