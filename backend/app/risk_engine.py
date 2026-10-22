"""
Deterministic Prototype Risk Visualization Engine & Quality Scoring
"""
from typing import Dict, Any
from .config import PRODUCT_SAFE_RANGES

def evaluate_risk_level(temp: float, target_temp: float, product: str, accel_rms: float, shock_count: int, health_score: float, remaining_hours: float) -> str:
    dev = abs(temp - target_temp)
    safe_min, safe_max = PRODUCT_SAFE_RANGES.get(product, (2.0, 6.0))
    is_out_of_band = (temp < safe_min) or (temp > safe_max)

    if remaining_hours <= 0.0 or health_score < 35.0 or dev >= 8.0 or shock_count >= 4:
        return "CRITICAL"
    elif health_score < 60.0 or dev >= 4.0 or shock_count >= 2 or accel_rms > 0.45:
        return "HIGH"
    elif is_out_of_band or health_score < 80.0 or dev >= 1.8 or shock_count >= 1 or accel_rms > 0.18:
        return "MEDIUM"
    else:
        return "LOW"

def compute_health_score(rst_hours: float, max_hours: float, thermal_exposure: float, motion_exposure: float, shock_damage: float) -> float:
    time_ratio = max(0.0, min(1.0, rst_hours / max(max_hours, 1.0)))
    
    # Penalties
    thermal_penalty = min(35.0, thermal_exposure * 1.5)
    motion_penalty = min(20.0, motion_exposure * 0.8)
    shock_penalty = min(30.0, shock_damage * 8.0)

    raw_score = (time_ratio * 100.0) - (thermal_penalty + motion_penalty + shock_penalty)
    return round(max(0.0, min(100.0, raw_score)), 1)
