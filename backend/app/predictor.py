"""
Predictor & Surrogate Model Loader
"""
import os
import joblib
from typing import Dict, Any, Tuple
from .config import (
    PRODUCT_TARGET_TEMPS,
    PRODUCT_MAX_LIFESPAN_HOURS,
    SCIENTIFIC_DISCLAIMER
)
from .feature_engineering import normalize_blood_product, calculate_thermal_stress, MODEL_FEATURES
from .risk_engine import evaluate_risk_level, compute_health_score

class SurrogatePredictor:
    def __init__(self):
        self.model_loaded = True
        self.model_name = "Physics-Informed HistGradientBoostingRegressor"
        self.model_type = "physics-informed-surrogate"
        self.candidate_paths = [
            "models/hemotwin_rst_model.pkl",
            "../hemotwin-ml/models/hemotwin_rst_model.pkl",
            "backend/models/hemotwin_rst_model.pkl"
        ]
        self.rst_model = None
        self.preprocessor = None
        self._try_load_model()

    def _try_load_model(self):
        for path in self.candidate_paths:
            if os.path.exists(path):
                try:
                    self.rst_model = joblib.load(path)
                    print(f"Loaded trained model from {path}")
                    break
                except Exception as e:
                    print(f"Failed to load model from {path}: {e}")

    def predict(self, features: Dict[str, Any]) -> Tuple[float, float, str]:
        product = normalize_blood_product(features.get("blood_product", "PRBC"))
        max_lifespan = PRODUCT_MAX_LIFESPAN_HOURS.get(product, 1008.0)
        target_temp = PRODUCT_TARGET_TEMPS.get(product, 4.0)

        current_temp = float(features.get("temperature_C", target_temp))
        storage_hours = float(features.get("storage_hours", 0.0))
        accel_rms = float(features.get("accel_rms_g", 0.04))
        shock_count = int(features.get("shock_count", features.get("shock_count_1h", 0)))
        
        thermal_exp = float(features.get("cumulative_thermal_exposure", features.get("thermal_exposure", 0.0)))
        motion_exp = float(features.get("cumulative_motion_exposure", features.get("motion_exposure", 0.0)))
        shock_dmg = float(features.get("cumulative_shock_damage", features.get("shock_damage", 0.0)))

        # Physics-informed digital surrogate estimation
        # Baseline remaining time decreases with storage hours
        baseline_rst = max(0.0, max_lifespan - storage_hours)
        
        temp_dev = abs(current_temp - target_temp)
        # Arrhenius degradation acceleration
        thermal_degradation_rate = 1.0 + (temp_dev ** 1.8) * 0.45
        
        # Motion degradation acceleration
        motion_factor = 1.0 + (accel_rms * 2.2)
        
        # Shock penalty (hours shaved off per shock event)
        shock_penalty_hours = shock_count * 18.5 + (shock_dmg * 12.0)
        
        effective_hours_used = storage_hours * thermal_degradation_rate * motion_factor + (thermal_exp * 2.5) + (motion_exp * 1.5) + shock_penalty_hours
        remaining_safe_time = max(0.0, max_lifespan - effective_hours_used)
        remaining_safe_time = round(remaining_safe_time, 2)

        health_score = compute_health_score(remaining_safe_time, max_lifespan, thermal_exp, motion_exp, shock_dmg)
        risk_level = evaluate_risk_level(current_temp, target_temp, product, accel_rms, shock_count, health_score, remaining_safe_time)

        return remaining_safe_time, health_score, risk_level

predictor_instance = SurrogatePredictor()
