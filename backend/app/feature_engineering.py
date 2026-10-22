"""
Feature Engineering for Real-Time Kinematics & Thermal Stress
"""
import math
from typing import Dict, Any
from .config import PRODUCT_CANONICAL_MAP, PRODUCT_TARGET_TEMPS

MODEL_FEATURES = [
    "temperature_C", "target_temp_C", "temperature_deviation_C",
    "accel_x_g", "accel_y_g", "accel_z_g",
    "gyro_x_dps", "gyro_y_dps", "gyro_z_dps",
    "accel_rms_g", "gyro_rms_dps", "jerk_rms",
    "shock_event", "shock_magnitude", "shock_count_1h",
    "storage_hours", "thermal_stress", "cumulative_thermal_exposure",
    "core_temperature_est_C", "cumulative_motion_exposure",
    "cumulative_shock_damage", "blood_product"
]

def normalize_blood_product(prod: str) -> str:
    cleaned = prod.strip().lower()
    return PRODUCT_CANONICAL_MAP.get(cleaned, "PRBC")

def compute_kinematics(ax: float, ay: float, az: float, gx: float, gy: float, gz: float, prev_ax: float = 0.0, prev_ay: float = 0.0, prev_az: float = 1.0, dt_s: float = 1.0) -> Dict[str, float]:
    accel_rms = math.sqrt((ax**2 + ay**2 + az**2) / 3.0)
    gyro_rms = math.sqrt((gx**2 + gy**2 + gz**2) / 3.0)
    
    d_ax = (ax - prev_ax) / dt_s
    d_ay = (ay - prev_ay) / dt_s
    d_az = (az - prev_az) / dt_s
    jerk_rms = math.sqrt((d_ax**2 + d_ay**2 + d_az**2) / 3.0)

    return {
        "accel_rms_g": round(accel_rms, 4),
        "gyro_rms_dps": round(gyro_rms, 4),
        "jerk_rms": round(jerk_rms, 4)
    }

def estimate_core_temperature(prev_core: float, surface_temp: float, dt_hours: float = 0.0833, tau_hours: float = 1.5) -> float:
    """Lumped capacitance 1st order thermal response"""
    alpha = 1.0 - math.exp(-dt_hours / tau_hours)
    return prev_core + alpha * (surface_temp - prev_core)

def calculate_thermal_stress(current_temp: float, target_temp: float, product: str) -> float:
    dev = abs(current_temp - target_temp)
    # Scaled exponential thermal decay factor
    stress = max(0.0, math.exp(dev / 2.5) - 1.0)
    return round(stress, 4)
