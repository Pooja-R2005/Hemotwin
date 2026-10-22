import React from 'react';
import { useHemoTwin } from '../context/HemoTwinContext';
import { StatCard } from '../components/StatCard';
import { RiskBadge } from '../components/RiskBadge';
import { BarChart3, Thermometer, Activity, Clock, ShieldCheck, Zap, Info } from 'lucide-react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

export const Analytics: React.FC = () => {
  const { currentTwin, telemetryHistory, selectedProduct } = useHemoTwin();

  // Compute temperature statistics from session history
  const temps = telemetryHistory.map((p) => p.temperature_C);
  const currentTemp = currentTwin?.current_temperature_C ?? 4.0;
  const avgTemp = temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : currentTemp;
  const minTemp = temps.length > 0 ? Math.min(...temps) : currentTemp;
  const maxTemp = temps.length > 0 ? Math.max(...temps) : currentTemp;

  // Compute motion statistics
  const accels = telemetryHistory.map((p) => p.accel_rms_g);
  const avgAccel = accels.length > 0 ? accels.reduce((a, b) => a + b, 0) / accels.length : 0.04;
  const maxAccel = accels.length > 0 ? Math.max(...accels) : 0.04;

  const gyros = telemetryHistory.map((p) => p.gyro_rms_dps);
  const avgGyro = gyros.length > 0 ? gyros.reduce((a, b) => a + b, 0) / gyros.length : 0.52;

  const totalShocks = currentTwin?.shock_count ?? 0;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-wide">
              Telemetry Analytics & Distribution
            </h2>
            <p className="text-xs text-slate-500">
              Sensor distribution statistics, environmental extremes, and kinetic stability metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 font-mono">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Session Samples: {telemetryHistory.length}</span>
        </div>
      </div>

      {/* Prototype Analytics Note */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong>Note:</strong> Analytics shown here are based on prototype telemetry and surrogate-model outputs.
        </span>
      </div>

      {/* SECTION 1: TEMPERATURE STATISTICS */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-cyan-400" />
          Thermal Environmental Extremes (°C)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Current Temperature"
            value={currentTemp.toFixed(2)}
            unit="°C"
            subtitle="Most recent sensor telemetry"
            icon={Thermometer}
            accentColor="cyan"
          />
          <StatCard
            title="Session Average"
            value={avgTemp.toFixed(2)}
            unit="°C"
            subtitle="Mean of session buffer"
            icon={Thermometer}
            accentColor="emerald"
          />
          <StatCard
            title="Minimum Recorded"
            value={minTemp.toFixed(2)}
            unit="°C"
            subtitle="Lowest recorded thermal point"
            icon={Thermometer}
            accentColor="indigo"
          />
          <StatCard
            title="Maximum Recorded"
            value={maxTemp.toFixed(2)}
            unit="°C"
            subtitle="Highest recorded thermal point"
            icon={Thermometer}
            accentColor={maxTemp > 6.0 ? 'rose' : 'amber'}
          />
        </div>
      </div>

      {/* SECTION 2: MOTION STATISTICS */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          Kinematic Agitation & Handling Extremes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Avg Accel RMS"
            value={avgAccel.toFixed(3)}
            unit="g"
            subtitle="Mean gravitational variance"
            icon={Activity}
            accentColor="indigo"
          />
          <StatCard
            title="Peak Accel"
            value={maxAccel.toFixed(3)}
            unit="g"
            subtitle="Peak transient acceleration"
            icon={Activity}
            accentColor={maxAccel > 0.4 ? 'rose' : 'amber'}
          />
          <StatCard
            title="Avg Gyro RMS"
            value={avgGyro.toFixed(2)}
            unit="°/s"
            subtitle="Angular velocity mean"
            icon={Activity}
            accentColor="cyan"
          />
          <StatCard
            title="Total Shock Events"
            value={totalShocks}
            unit="events"
            subtitle="Cumulative high-impact jolts"
            icon={Zap}
            accentColor={totalShocks > 0 ? 'rose' : 'emerald'}
          />
        </div>
      </div>

      {/* SECTION 3: STABILITY SUMMARY */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 backdrop-blur-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Surrogate Stability Forecast Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-center">
          <div className="p-4 rounded-xl bg-slate-50/40 border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1 font-sans">Remaining Safe Time</span>
            <span className="text-3xl font-extrabold text-slate-900">
              {currentTwin?.remaining_safe_time_hours.toFixed(1) ?? '990.8'}h
            </span>
            <span className="block text-xs text-cyan-300 mt-1">
              ≈ {((currentTwin?.remaining_safe_time_hours ?? 990.8) / 24).toFixed(1)} days
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/40 border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1 font-sans">Surrogate Health Score</span>
            <span className="text-3xl font-extrabold text-emerald-400">
              {currentTwin?.health_score.toFixed(1) ?? '99.8'}
            </span>
            <span className="block text-xs text-slate-500 mt-1">Scale: 0 – 100</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/40 border border-slate-200 flex flex-col items-center justify-center">
            <span className="text-xs text-slate-500 block mb-2 font-sans">Active Risk Tier</span>
            <RiskBadge level={currentTwin?.risk_level} size="lg" />
          </div>
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
};
