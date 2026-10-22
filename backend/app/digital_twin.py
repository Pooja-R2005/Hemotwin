"""
Stateful Digital Twin Manager & Synthetic Scenario Simulator
"""
import time
import random
from collections import deque
from datetime import datetime
from typing import Dict, Any, List, Optional
from .config import PRODUCT_TARGET_TEMPS, PRODUCT_SAFE_RANGES, SCIENTIFIC_DISCLAIMER
from .feature_engineering import (
    normalize_blood_product,
    compute_kinematics,
    estimate_core_temperature,
    calculate_thermal_stress
)
from .predictor import predictor_instance
from .schemas import DigitalTwinResponse, BagSummary

class ManagedBag:
    def __init__(self, bag_id: str, blood_product: str, initial_hours: float = 0.0, donor_id: Optional[str] = None):
        self.bag_id = bag_id
        self.blood_product = normalize_blood_product(blood_product)
        self.donor_id = donor_id
        self.registered_at = datetime.now().isoformat()
        self.last_update = datetime.now().isoformat()
        self.storage_hours = initial_hours
        
        target = PRODUCT_TARGET_TEMPS.get(self.blood_product, 4.0)
        self.target_temperature_C = target
        self.current_temperature_C = target
        self.core_temperature_C = target
        
        self.thermal_exposure = 0.0
        self.motion_exposure = 0.0
        self.shock_damage = 0.0
        self.shock_count = 0
        
        self.accel_rms_g = 0.04
        self.gyro_rms_dps = 0.52
        self.jerk_rms = 0.08
        self.motion_level = 0.58
        
        self.health_score = 99.8
        self.remaining_safe_time_hours = 990.82
        self.risk_level = "LOW"
        self.mode = "DEMO"
        self.data_source = "synthetic"
        
        self.history = deque(maxlen=60)

    def to_summary(self) -> BagSummary:
        return BagSummary(
            bag_id=self.bag_id,
            blood_product=self.blood_product,
            registered_at=self.registered_at,
            current_temperature_C=round(self.current_temperature_C, 2),
            health_score=round(self.health_score, 1),
            risk_level=self.risk_level,
            remaining_safe_time_hours=round(self.remaining_safe_time_hours, 2),
            last_update=self.last_update,
            mode=self.mode
        )

    def to_twin_response(self) -> DigitalTwinResponse:
        dev = round(self.current_temperature_C - self.target_temperature_C, 2)
        twin_score = round(self.health_score / 100.0, 2)
        return DigitalTwinResponse(
            bag_id=self.bag_id,
            blood_product=self.blood_product,
            current_temperature_C=round(self.current_temperature_C, 2),
            target_temperature_C=self.target_temperature_C,
            temperature_deviation_C=dev,
            motion_level=round(self.motion_level, 4),
            accel_rms_g=round(self.accel_rms_g, 4),
            gyro_rms_dps=round(self.gyro_rms_dps, 4),
            jerk_rms=round(self.jerk_rms, 4),
            shock_count=self.shock_count,
            storage_hours=round(self.storage_hours, 2),
            thermal_exposure=round(self.thermal_exposure, 2),
            motion_exposure=round(self.motion_exposure, 2),
            shock_damage=round(self.shock_damage, 2),
            health_score=round(self.health_score, 1),
            remaining_safe_time_hours=round(self.remaining_safe_time_hours, 2),
            risk_level=self.risk_level,
            digital_twin_score=twin_score,
            model_type="physics-informed-surrogate",
            data_source=self.data_source,
            disclaimer=SCIENTIFIC_DISCLAIMER
        )

class DigitalTwinManager:
    def __init__(self):
        self.bags: Dict[str, ManagedBag] = {}
        # Pre-register default demo bag HT-001
        self.register_bag("HT-001", "PRBC", initial_hours=12.0)

    def register_bag(self, bag_id: str, blood_product: str, initial_hours: float = 0.0, donor_id: Optional[str] = None) -> ManagedBag:
        bag = ManagedBag(bag_id, blood_product, initial_hours, donor_id)
        # initial prediction
        rst, health, risk = predictor_instance.predict({
            "blood_product": bag.blood_product,
            "temperature_C": bag.current_temperature_C,
            "storage_hours": bag.storage_hours,
            "accel_rms_g": bag.accel_rms_g,
            "shock_count": bag.shock_count
        })
        bag.remaining_safe_time_hours = rst
        bag.health_score = health
        bag.risk_level = risk
        self.bags[bag_id] = bag
        return bag

    def get_bag(self, bag_id: str) -> Optional[ManagedBag]:
        return self.bags.get(bag_id)

    def list_bags(self) -> List[BagSummary]:
        return [b.to_summary() for b in self.bags.values()]

    def delete_bag(self, bag_id: str) -> bool:
        if bag_id in self.bags:
            del self.bags[bag_id]
            return True
        return False

    def ingest_telemetry(self, bag_id: str, telemetry: Dict[str, Any], data_source: str = "synthetic") -> DigitalTwinResponse:
        bag = self.get_bag(bag_id)
        if not bag:
            bag = self.register_bag(bag_id, telemetry.get("blood_product", "PRBC"))
        
        bag.data_source = data_source
        bag.last_update = datetime.now().isoformat()
        
        # update temperature
        temp = float(telemetry.get("temperature_C", bag.current_temperature_C))
        bag.current_temperature_C = temp
        bag.core_temperature_C = estimate_core_temperature(bag.core_temperature_C, temp)
        
        # update kinematics
        ax = float(telemetry.get("accel_x_g", 0.01))
        ay = float(telemetry.get("accel_y_g", 0.02))
        az = float(telemetry.get("accel_z_g", 1.00))
        gx = float(telemetry.get("gyro_x_dps", 0.1))
        gy = float(telemetry.get("gyro_y_dps", 0.1))
        gz = float(telemetry.get("gyro_z_dps", 0.1))
        
        kin = compute_kinematics(ax, ay, az, gx, gy, gz)
        bag.accel_rms_g = kin["accel_rms_g"]
        bag.gyro_rms_dps = kin["gyro_rms_dps"]
        bag.jerk_rms = kin["jerk_rms"]
        bag.motion_level = round(kin["accel_rms_g"] * 10.0 + kin["gyro_rms_dps"] * 0.2, 4)
        
        # shock
        shock_evt = int(telemetry.get("shock_event", 0))
        if shock_evt > 0:
            bag.shock_count += shock_evt
            mag = float(telemetry.get("shock_magnitude", 2.5))
            bag.shock_damage += mag * 0.8
        
        # storage hours & dosage integration (assume ~0.083h = 5 min timestep)
        dt = float(telemetry.get("dt_hours", 0.0833))
        bag.storage_hours += dt
        
        # thermal stress integral
        t_stress = calculate_thermal_stress(bag.current_temperature_C, bag.target_temperature_C, bag.blood_product)
        bag.thermal_exposure += t_stress * dt
        
        # motion exposure integral
        bag.motion_exposure += bag.accel_rms_g * dt * 2.0
        
        # update prediction
        rst, health, risk = predictor_instance.predict({
            "blood_product": bag.blood_product,
            "temperature_C": bag.current_temperature_C,
            "storage_hours": bag.storage_hours,
            "accel_rms_g": bag.accel_rms_g,
            "shock_count": bag.shock_count,
            "cumulative_thermal_exposure": bag.thermal_exposure,
            "cumulative_motion_exposure": bag.motion_exposure,
            "cumulative_shock_damage": bag.shock_damage
        })
        bag.remaining_safe_time_hours = rst
        bag.health_score = health
        bag.risk_level = risk
        
        # append history
        twin = bag.to_twin_response()
        bag.history.append(twin.model_dump())
        return twin

    def generate_demo_packet(self, scenario: str, product: str, bag_id: str = "HT-001") -> DigitalTwinResponse:
        bag = self.get_bag(bag_id)
        if not bag:
            bag = self.register_bag(bag_id, product)
            
        target = PRODUCT_TARGET_TEMPS.get(bag.blood_product, 4.0)
        
        if scenario == "normal":
            # slight realistic noise around target ±0.3°C
            temp = target + random.uniform(-0.3, 0.4)
            ax = random.uniform(-0.02, 0.02)
            ay = random.uniform(-0.02, 0.02)
            az = 1.0 + random.uniform(-0.03, 0.03)
            gx = random.uniform(-0.5, 0.5)
            gy = random.uniform(-0.5, 0.5)
            gz = random.uniform(-0.5, 0.5)
            shock = 0
            mag = 0.0
        elif scenario == "temperature_excursion":
            # excursion up to 8.5°C
            temp = target + random.uniform(3.5, 6.2)
            ax = random.uniform(-0.04, 0.04)
            ay = random.uniform(-0.04, 0.04)
            az = 1.0 + random.uniform(-0.05, 0.05)
            gx = random.uniform(-1.0, 1.0)
            gy = random.uniform(-1.0, 1.0)
            gz = random.uniform(-1.0, 1.0)
            shock = 0
            mag = 0.0
        elif scenario == "high_motion":
            # rough transport / handling
            temp = target + random.uniform(0.5, 1.5)
            ax = random.uniform(-0.4, 0.4)
            ay = random.uniform(-0.4, 0.4)
            az = 1.0 + random.uniform(-0.6, 0.6)
            gx = random.uniform(-15.0, 15.0)
            gy = random.uniform(-15.0, 15.0)
            gz = random.uniform(-15.0, 15.0)
            shock = 0
            mag = 0.0
        elif scenario == "shock_event":
            # sudden drop / impact
            temp = target + random.uniform(0.2, 1.2)
            ax = random.uniform(-1.8, 1.8)
            ay = random.uniform(-1.5, 1.5)
            az = 2.8 + random.uniform(-0.8, 1.5)
            gx = random.uniform(-35.0, 35.0)
            gy = random.uniform(-35.0, 35.0)
            gz = random.uniform(-35.0, 35.0)
            shock = 1
            mag = random.uniform(3.5, 5.5)
        else:
            temp = target
            ax, ay, az = 0.0, 0.0, 1.0
            gx, gy, gz = 0.0, 0.0, 0.0
            shock = 0
            mag = 0.0

        telemetry = {
            "blood_product": bag.blood_product,
            "temperature_C": round(temp, 2),
            "accel_x_g": round(ax, 3),
            "accel_y_g": round(ay, 3),
            "accel_z_g": round(az, 3),
            "gyro_x_dps": round(gx, 2),
            "gyro_y_dps": round(gy, 2),
            "gyro_z_dps": round(gz, 2),
            "shock_event": shock,
            "shock_magnitude": round(mag, 2),
            "dt_hours": 0.0833
        }
        return self.ingest_telemetry(bag_id, telemetry, data_source="synthetic")

twin_manager = DigitalTwinManager()
