/**
 * HemoTwin Digital Surrogate - TypeScript Definitions
 * Aligned with FastAPI Pydantic Models & Research Protocol
 */

export type BloodProduct = 'PRBC' | 'Whole_Blood' | 'Platelets' | 'FFP';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type DashboardMode = 'DEMO' | 'LIVE';

export type DemoScenario = 'normal' | 'temperature_excursion' | 'high_motion' | 'shock_event';

export interface TelemetryPoint {
  timestamp: string;
  temperature_C: number;
  target_temp_C: number;
  deviation_C: number;
  accel_rms_g: number;
  gyro_rms_dps: number;
  jerk_rms: number;
  shock_count: number;
  health_score: number;
  remaining_safe_time_hours: number;
  risk_level: RiskLevel;
}

export interface DigitalTwinResponse {
  bag_id: string;
  blood_product: BloodProduct;
  current_temperature_C: number;
  target_temperature_C: number;
  temperature_deviation_C: number;
  motion_level: number;
  accel_rms_g: number;
  gyro_rms_dps: number;
  jerk_rms: number;
  shock_count: number;
  storage_hours: number;
  thermal_exposure: number;
  motion_exposure: number;
  shock_damage: number;
  health_score: number;
  remaining_safe_time_hours: number;
  risk_level: RiskLevel;
  digital_twin_score: number;
  model_type: string;
  data_source: 'synthetic' | 'live' | 'demo';
  disclaimer: string;
}

export interface RegisteredBagSummary {
  bag_id: string;
  blood_product: BloodProduct;
  registered_at: string;
  current_temperature_C: number | null;
  health_score: number | null;
  risk_level: RiskLevel | null;
  remaining_safe_time_hours: number | null;
  last_update: string | null;
  mode: string;
}

export interface BagRegistrationPayload {
  bag_id: string;
  blood_product: BloodProduct;
  initial_storage_hours?: number;
  donor_id?: string;
  notes?: string;
}

export interface StatelessPredictPayload {
  blood_product?: string;
  temperature_C: number;
  target_temp_C?: number;
  accel_x_g?: number;
  accel_y_g?: number;
  accel_z_g?: number;
  gyro_x_dps?: number;
  gyro_y_dps?: number;
  gyro_z_dps?: number;
  accel_rms_g?: number;
  gyro_rms_dps?: number;
  jerk_rms?: number;
  shock_event?: number;
  shock_magnitude?: number;
  shock_count_1h?: number;
  storage_hours?: number;
}

export interface StatelessPredictResponse {
  remaining_safe_time_hours: number;
  health_score: number;
  risk_level: RiskLevel;
  model_type: string;
  disclaimer: string;
}

export interface ModelBenchmarks {
  test_mae_hours: number;
  test_r2: number;
  validation_split: string;
  benchmark_category: string;
}

export interface ModelInfo {
  model_name: string;
  model_type: string;
  feature_count: number;
  features: string[];
  training_dataset_size: number;
  simulated_bags_count: number;
  benchmarks: ModelBenchmarks;
  limitations: string;
  disclaimer: string;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  active_bags_count: number;
  disclaimer: string;
}
