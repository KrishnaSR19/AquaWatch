import pandas as pd

# --------------------------------------------------
# STEP 3.1 — Load & sort DWLR data
# --------------------------------------------------
df = pd.read_csv("dwlr_levels.csv", parse_dates=["timestamp"])

df = (
    df.sort_values(["station_id", "timestamp"])
      .reset_index(drop=True)
)

# --------------------------------------------------
# STEP 3.2 — Rolling averages (7-day & 30-day)
# --------------------------------------------------
df["avg_7d"] = (
    df.groupby("station_id")["water_level_m_bgl"]
      .rolling(window=7)
      .mean()
      .reset_index(level=0, drop=True)
)

df["avg_30d"] = (
    df.groupby("station_id")["water_level_m_bgl"]
      .rolling(window=30)
      .mean()
      .reset_index(level=0, drop=True)
)

# --------------------------------------------------
# STEP 3.3 — Trend detection (BGL logic)
# --------------------------------------------------
df["trend_slope"] = df["avg_7d"] - df["avg_30d"]

def get_trend(slope):
    if pd.isna(slope):
        return "Unknown"
    elif slope < -0.05:
        return "Rising"        # Water table improving
    elif slope > 0.05:
        return "Falling"       # Groundwater depletion
    else:
        return "Stable"

df["trend"] = df["trend_slope"].apply(get_trend)

# --------------------------------------------------
# STEP 3.4 — Zone classification (BGL thresholds)
# --------------------------------------------------
def classify_zone(level):
    if level > 10:
        return "Critical"
    elif level >= 5:
        return "Semi-Critical"
    else:
        return "Safe"

df["zone"] = df["water_level_m_bgl"].apply(classify_zone)

# --------------------------------------------------
# STEP 3.5 — Alert engine
# --------------------------------------------------
df["alert_flag"] = False
df["alert_reason"] = ""

for station in df["station_id"].unique():
    sdf = df[df["station_id"] == station].copy()
    sdf["change_7d"] = sdf["water_level_m_bgl"].diff(7)

    for idx in sdf.index:
        reasons = []

        # Condition 1: Critical zone
        if sdf.loc[idx, "zone"] == "Critical":
            reasons.append("Critical groundwater depth")

        # Condition 2: Falling trend + low rainfall
        if (
            sdf.loc[idx, "trend"] == "Falling" and
            sdf.loc[idx, "rainfall_mm"] < 5
        ):
            reasons.append("Declining water table with low recharge")

        # Condition 3: Rapid depletion in 7 days
        if sdf.loc[idx, "change_7d"] > 0.3:
            reasons.append("Rapid groundwater depletion")

        if reasons:
            df.loc[idx, "alert_flag"] = True
            df.loc[idx, "alert_reason"] = "; ".join(reasons)

# --------------------------------------------------
# STEP 3.6 — Validation checks (optional print)
# --------------------------------------------------
print("Zone distribution:")
print(df["zone"].value_counts(), "\n")

print("Trend distribution:")
print(df["trend"].value_counts(), "\n")

print("Alert count:")
print(df["alert_flag"].value_counts(), "\n")

# --------------------------------------------------
# STEP 3.7 — Save enriched dataset (optional)
# --------------------------------------------------
df.to_csv("dwlr_levels_step3_enriched.csv", index=False)

print("STEP 3 completed successfully.")
print("Enriched file saved as dwlr_levels_step3_enriched.csv")
