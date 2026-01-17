import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

# --------------------------------------------------
# STEP 4.0 — Load enriched dataset (from Step 3)
# --------------------------------------------------
df = pd.read_csv(
    "dwlr_levels_step3_enriched.csv",
    parse_dates=["timestamp"]
)

df = df.sort_values(["station_id", "timestamp"]).reset_index(drop=True)

# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------
TRAIN_WINDOW_DAYS = 30     # past days used for training
FORECAST_DAYS = 7          # future days to predict

# --------------------------------------------------
# STEP 4.1 — Forecast function (per station)
# --------------------------------------------------
def forecast_station(station_id, df):
    """
    Trains a Linear Regression model on last N days
    and forecasts next K days for one station
    """

    # Select station data
    sdf = df[df["station_id"] == station_id].tail(TRAIN_WINDOW_DAYS)

    # Safety check
    if len(sdf) < TRAIN_WINDOW_DAYS:
        return None

    # ---------------------------
    # STEP 4.2 — Prepare ML data
    # ---------------------------
    # Feature: time index (0, 1, 2, ...)
    X = np.arange(len(sdf)).reshape(-1, 1)

    # Target: groundwater depth (meters below ground)
    y = sdf["water_level_m_bgl"].values

    # ---------------------------
    # STEP 4.3 — ML TRAINING
    # ---------------------------
    model = LinearRegression()
    model.fit(X, y)   # <<< ML TRAINING HAPPENS HERE

    # ---------------------------
    # STEP 4.4 — Forecast future
    # ---------------------------
    future_X = np.arange(
        len(sdf),
        len(sdf) + FORECAST_DAYS
    ).reshape(-1, 1)

    forecast_values = model.predict(future_X)

    # ---------------------------
    # STEP 4.5 — Build result
    # ---------------------------
    last_date = sdf["timestamp"].iloc[-1]

    forecast_dates = pd.date_range(
        start=last_date + pd.Timedelta(days=1),
        periods=FORECAST_DAYS
    )

    forecast_df = pd.DataFrame({
        "station_id": station_id,
        "date": forecast_dates,
        "forecast_water_level_m_bgl": forecast_values.round(2)
    })

    return forecast_df


# --------------------------------------------------
# STEP 4.6 — Run forecasting for ALL stations
# --------------------------------------------------
all_forecasts = []

for station in df["station_id"].unique():
    result = forecast_station(station, df)
    if result is not None:
        all_forecasts.append(result)

forecast_df = pd.concat(all_forecasts, ignore_index=True)

# --------------------------------------------------
# STEP 4.7 — Derive FUTURE ZONE & RISK
# --------------------------------------------------
def classify_zone(level):
    if level > 10:
        return "Critical"
    elif level >= 5:
        return "Semi-Critical"
    else:
        return "Safe"

forecast_df["forecast_zone"] = forecast_df[
    "forecast_water_level_m_bgl"
].apply(classify_zone)

# --------------------------------------------------
# STEP 4.8 — Save forecast output
# --------------------------------------------------
forecast_df.to_csv(
    "dwlr_forecast_7_days.csv",
    index=False
)

print("STEP 4 completed successfully.")
print("Forecast saved as dwlr_forecast_7_days.csv")
