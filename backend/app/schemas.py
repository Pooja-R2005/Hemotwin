"""
Pydantic Schemas for HemoTwin API
"""
from typing import Optional, List, Literal
from pydantic import BaseModel, Field

BloodProduct = Literal['PRBC', 'Whole_Blood', 'Platelets', 'FFP']
RiskLevel = Literal['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
DashboardMode = Literal['DEMO', 'LIVE']
DemoScenario = Literal['normal', 'temperature_excursion', 'high_motion', 'shock_event']

class TelemetryInput(BaseModel):
    blood_product: Optional[str] = "PRBC"
    temperature_C: float = Field(..., description="Measured surface temperature in Celsius")
    target_temp_C: Optional[float] = Field(None, description="Target storage temperature in Celsius")
    accel_x_g: float = 0.01
    accel_y_g: float = 0.02
    accel_z_g: float = 1.00
    gyro_x_dps: float = 0.1
    gyro_y_dps: float = 0.1
    gyro_z_dps: float = 0.1
    accel_rms_g: Optional[float] = None
    gyro_rms_dps: Optional[float] = None
    jerk_rms: Optional[float] = None
    shock_event: int = 0
    shock_magnitude: float = 0.0
    shock_count_1h: int = 0
    storage_hours: float = 0.0
    timestamp: Optional[str] = None

class BagRegistration(BaseModel):
    bag_id: str
    blood_product: str = "PRBC"
    initial_storage_hours: float = 0.0
    donor_id: Optional[str] = None
    notes: Optional[str] = None

class BagSummary(BaseModel):
    bag_id: str
    blood_product: str
    registered_at: str
    current_temperature_C: Optional[float] = None
    health_score: Optional[float] = None
    risk_level: Optional[str] = None
    remaining_safe_time_hours: Optional[float] = None
    last_update: Optional[str] = None
    mode: str = "DEMO"

class DigitalTwinResponse(BaseModel):
    bag_id: str
    blood_product: str
    current_temperature_C: float
    target_temperature_C: float
    temperature_deviation_C: float
    motion_level: float
    accel_rms_g: float
    gyro_rms_dps: float
    jerk_rms: float
    shock_count: int
    storage_hours: float
    thermal_exposure: float
    motion_exposure: float
    shock_damage: float
    health_score: float
    remaining_safe_time_hours: float
    risk_level: RiskLevel
    digital_twin_score: float
    model_type: str = "physics-informed-surrogate"
    data_source: str = "synthetic"
    disclaimer: str

class StatelessPredictResponse(BaseModel):
    remaining_safe_time_hours: float
    health_score: float
    risk_level: RiskLevel
    model_type: str = "physics-informed-surrogate"
    disclaimer: str

class DemoScenarioRequest(BaseModel):
    scenario: DemoScenario = "normal"
    blood_product: str = "PRBC"
    storage_hours: float = 12.0
    bag_id: Optional[str] = "HT-001"

class ModelInfoResponse(BaseModel):
    model_name: str
    model_type: str
    feature_count: int
    features: List[str]
    training_dataset_size: int
    simulated_bags_count: int
    benchmarks: dict
    limitations: str
    disclaimer: str
