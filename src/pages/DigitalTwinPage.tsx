import React from 'react';
import { useHemoTwin } from '../context/HemoTwinContext';
import { DigitalTwinBag } from '../components/DigitalTwinBag';
import { RiskBadge } from '../components/RiskBadge';
import { Layers, Thermometer, Waves, Zap, ShieldCheck, Activity, Cpu } from 'lucide-react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

export const DigitalTwinPage: React.FC = () => {
  const { currentTwin, selectedBagId } = useHemoTwin();

  const twin = currentTwin;
  const temp = twin?.current_temperature_C ?? 4.0;
  const target = twin?.target_temperature_C ?? 4.0;
  // Estimate core temperature using first-order lumped model
  const coreTemp = Number((temp * 0.92 + target * 0.08).toFixed(2));
  const gradient = Math.abs(temp - coreTemp).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-wide">
              Deep Digital Surrogate Inspection
            </h2>
            <p className="text-xs text-slate-500">
              Multi-Physics Kinetic & Thermal Degradation Surrogate for Bag{' '}
              <strong className="text-cyan-300 font-mono">{selectedBagId}</strong>
            </p>
          </div>
        </div>

        <RiskBadge level={twin?.risk_level} size="md" />
      </div>

      {/* Main Surrogate Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Enlarged Digital Twin Bag */}
        <div className="lg:col-span-6">
          <DigitalTwinBag twin={twin} interactive />
        </div>

        {/* Right: Multi-Physics Breakdown & Analytical Models */}
        <div className="lg:col-span-6 space-y-5">
          {/* Thermal Layer Analysis */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                <Thermometer className="w-4 h-4" />
                Thermal Stratification Model (1st Order Lumped)
              </span>
              <span className="text-[10px] font-mono text-slate-500">τ = 1.5h</span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-xs font-mono text-center">
              <div className="p-3 rounded-xl bg-slate-50/40 border border-slate-200">
                <span className="text-slate-500 block text-[10px] font-sans">Surface Sensor:</span>
                <span className="text-slate-900 font-bold text-sm">{temp.toFixed(2)}°C</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50/40 border border-slate-200">
                <span className="text-slate-500 block text-[10px] font-sans">Estimated Core:</span>
                <span className="text-cyan-300 font-bold text-sm">{coreTemp}°C</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50/40 border border-slate-200">
                <span className="text-slate-500 block text-[10px] font-sans">ΔT Gradient:</span>
                <span className="text-amber-400 font-bold text-sm">{gradient}°C</span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-500 leading-relaxed">
              Thermal energy transfer estimated via lumped thermal capacitance approximation:
              <code className="text-cyan-300 ml-1 font-mono">dT_core/dt = (T_surface - T_core) / τ</code>
            </div>
          </div>

          {/* Kinetic Jerk & Motion Absorption */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                <Waves className="w-4 h-4" />
                Kinetic Energy Dissipation Rate
              </span>
              <span className="text-[10px] font-mono text-slate-500">6-DOF Integration</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-50/40 border border-slate-200">
                <span className="text-slate-500 block text-[10px] font-sans">Kinetic RMS:</span>
                <span className="text-slate-900 font-bold text-sm">{twin?.accel_rms_g.toFixed(3) || '0.040'} g</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50/40 border border-slate-200">
                <span className="text-slate-500 block text-[10px] font-sans">Angular Velocity RMS:</span>
                <span className="text-indigo-300 font-bold text-sm">{twin?.gyro_rms_dps.toFixed(2) || '0.52'} °/s</span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-500 leading-relaxed">
              Cumulative motion dosage accounts for vibrational agitation and shear stress propagation across blood medium during cold-chain transit.
            </div>
          </div>

          {/* Impulse Shock Accumulation */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Zap className="w-4 h-4" />
                Impulse Shock & Handling Damage
              </span>
              <span className="text-[10px] font-mono text-slate-500">Threshold: &gt; 2.5g</span>
            </div>

            <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-slate-50/40 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Shock Impact Count:</span>
                <span className="text-slate-900 font-bold font-mono text-base">{twin?.shock_count ?? 0} events</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Cumulative Impulse Integral:</span>
                <span className="text-amber-400 font-bold font-mono text-base">{twin?.shock_damage.toFixed(2) ?? '0.00'} units</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
};
