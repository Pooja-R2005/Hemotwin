import React, { useState } from 'react';
import { useHemoTwin } from '../context/HemoTwinContext';
import { StatCard } from '../components/StatCard';
import { RemainingSafeTimeCard } from '../components/RemainingSafeTimeCard';
import { RiskBadge } from '../components/RiskBadge';
import { DigitalTwinBag } from '../components/DigitalTwinBag';
import { TemperatureChart } from '../components/TemperatureChart';
import { MotionCard } from '../components/MotionCard';
import { ExposurePanel } from '../components/ExposurePanel';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { DonorQRModal } from '../components/DonorQRModal';
import {
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  WifiOff,
  Radio,
  UserPlus
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [isDonorModalOpen, setIsDonorModalOpen] = useState(false);
  const {
    mode,
    demoScenario,
    setDemoScenario,
    isDemoRunning,
    setIsDemoRunning,
    selectedProduct,
    currentTwin,
    telemetryHistory,
    backendConnected,
    resetDemo,
  } = useHemoTwin();

  // If backend is disconnected
  if (!backendConnected) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center shadow-sm">
          <WifiOff className="mx-auto h-12 w-12 text-rose-500" />
          <h3 className="mt-3 text-lg font-bold text-rose-700">Backend Offline / Connection Failed</h3>
          <p className="mt-1 text-sm text-slate-600">
            Cannot connect to HemoTwin FastAPI backend at{' '}
            <code className="rounded bg-white border border-rose-100 px-2 py-0.5 font-mono text-rose-600">
              http://localhost:8000
            </code>
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Please ensure the backend is started: <code className="text-slate-700 font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded">python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000</code>
          </p>
        </div>
        <DisclaimerBanner />
      </div>
    );
  }

  // If in LIVE mode without active hardware packets
  const isAwaitingLiveTelemetry = mode === 'LIVE' && currentTwin?.data_source !== 'live';

  const temp = currentTwin?.current_temperature_C ?? 4.0;
  const targetTemp = currentTwin?.target_temperature_C ?? 4.0;
  const tempDev = currentTwin?.temperature_deviation_C ?? 0.0;
  const healthScore = currentTwin?.health_score ?? 99.8;
  const riskLevel = currentTwin?.risk_level ?? 'LOW';
  const rstHours = currentTwin?.remaining_safe_time_hours ?? 990.8;

  return (
    <div className="space-y-6">
      {isDonorModalOpen && <DonorQRModal onClose={() => setIsDonorModalOpen(false)} />}
      
      {/* Top Action Bar */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsDonorModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-slate-900 font-bold rounded-xl shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 hover:-translate-y-0.5 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Register New Donor
        </button>
      </div>
      {/* Live Mode Notice Banner when waiting for ESP32 */}
      {isAwaitingLiveTelemetry && (
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/40 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm tracking-wide flex items-center gap-2">
                  <span>LIVE HARDWARE MODE ACTIVE</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                    Listening for ESP32 Packets
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Awaiting hardware telemetry packet ingestion on <code className="text-cyan-300 font-mono">POST /bags/{'{bag_id}'}/telemetry</code>. Synthetic simulation paused.
                </p>
              </div>
            </div>

            {/* Hardware sensor status indicators */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-slate-600">Temp DS18B20: Waiting</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-slate-600">IMU MPU6050: Waiting</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOP 4 PRIMARY KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Estimated Remaining Safe Time */}
        <RemainingSafeTimeCard hours={rstHours} product={selectedProduct} />

        {/* Card 2: Surrogate Health Score */}
        <StatCard
          title="Surrogate Health Score"
          value={healthScore.toFixed(1)}
          unit="/100"
          subtitle="Physics-informed kinetic surrogate estimate"
          icon={ShieldCheck}
          accentColor={healthScore >= 80 ? 'emerald' : healthScore >= 60 ? 'amber' : 'rose'}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Synthetic Model Benchmark</span>
            <span className="font-mono text-cyan-400 font-semibold">R² = 0.99986</span>
          </div>
        </StatCard>

        {/* Card 3: Prototype Risk Visualization */}
        <div className="rounded-3xl bg-white/60 p-6 border border-slate-200/60 shadow-lg shadow-slate-200/40 backdrop-blur-md flex flex-col justify-between hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-700 transition-colors">
              Risk Level
            </span>
            <div className="p-2 bg-amber-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center py-2">
            <RiskBadge level={riskLevel} size="lg" />
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 text-xs font-medium text-slate-500">
            Source: <strong className="text-slate-600">FastAPI ML Inference</strong>
          </div>
        </div>

        {/* Card 4: Current Temperature & Target */}
        <StatCard
          title="Current Temperature"
          value={temp.toFixed(1)}
          unit="°C"
          subtitle={`Target: ${targetTemp.toFixed(1)}°C | Deviation: ${tempDev > 0 ? `+${tempDev.toFixed(1)}` : tempDev.toFixed(1)}°C`}
          icon={Thermometer}
          accentColor={Math.abs(tempDev) > 2.0 ? 'rose' : Math.abs(tempDev) > 1.0 ? 'amber' : 'cyan'}
          trend={{
            value: `${tempDev > 0 ? `+${tempDev.toFixed(1)}` : tempDev.toFixed(1)}°C`,
            isPositive: Math.abs(tempDev) <= 1.0,
          }}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Thermal Band:</span>
            <span className="text-emerald-400">2.0°C - 6.0°C</span>
          </div>
        </StatCard>
      </div>

      {/* MIDDLE SECTION: DIGITAL TWIN BLOOD BAG & MOTION MONITORING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Central Digital Twin Blood Bag */}
        <div className="lg:col-span-7">
          <DigitalTwinBag twin={currentTwin} />
        </div>

        {/* Right: Motion & Cumulative Exposure Panels */}
        <div className="lg:col-span-5 space-y-6">
          <MotionCard
            accelRms={currentTwin?.accel_rms_g ?? 0.04}
            gyroRms={currentTwin?.gyro_rms_dps ?? 0.52}
            jerkRms={currentTwin?.jerk_rms ?? 0.08}
            shockCount={currentTwin?.shock_count ?? 0}
          />
          <ExposurePanel
            thermalExposure={currentTwin?.thermal_exposure ?? 0.0}
            motionExposure={currentTwin?.motion_exposure ?? 0.0}
            shockDamage={currentTwin?.shock_damage ?? 0.0}
          />
        </div>
      </div>

      {/* BOTTOM SECTION: RESPONSIVE TEMPERATURE MONITORING CHART */}
      <div>
        <TemperatureChart
          history={telemetryHistory}
          targetTemp={targetTemp}
          product={selectedProduct}
          scenario={demoScenario}
          onScenarioChange={setDemoScenario}
          isRunning={isDemoRunning}
          onToggleRunning={() => setIsDemoRunning(!isDemoRunning)}
          onReset={resetDemo}
          isLiveMode={mode === 'LIVE'}
        />
      </div>

      {/* Permanent Scientific Disclaimer */}
      <DisclaimerBanner />
    </div>
  );
};
