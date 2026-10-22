import React from 'react';
import { ThermometerSnowflake, Waves, Zap } from 'lucide-react';

interface ExposurePanelProps {
  thermalExposure: number;
  motionExposure: number;
  shockDamage: number;
}

export const ExposurePanel: React.FC<ExposurePanelProps> = ({
  thermalExposure,
  motionExposure,
  shockDamage,
}) => {
  // Normalize exposures to a 0-100 scale for intuitive engineering visualization
  const thermalPct = Math.min(100, Math.round((thermalExposure / 15.0) * 100));
  const motionPct = Math.min(100, Math.round((motionExposure / 20.0) * 100));
  const shockPct = Math.min(100, Math.round((shockDamage / 10.0) * 100));

  return (
    <div className="rounded-2xl bg-white p-6 border border-slate-200 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Cumulative Exposure Integrals
        </span>
        <span className="text-[11px] font-mono text-slate-500">Multi-Physics Dosage</span>
      </div>

      <div className="mt-5 space-y-4">
        {/* Thermal Exposure */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-400" />
              Thermal Stress Dosage (∫ΔT dt)
            </span>
            <span className="font-mono text-cyan-300 font-semibold">{thermalExposure.toFixed(2)} units</span>
          </div>
          <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                thermalPct > 70 ? 'bg-rose-500' : thermalPct > 35 ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.max(3, thermalPct)}%` }}
            />
          </div>
        </div>

        {/* Motion Exposure */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Waves className="w-3.5 h-3.5 text-indigo-400" />
              Kinetic Energy Absorption (∫RMS dt)
            </span>
            <span className="font-mono text-indigo-300 font-semibold">{motionExposure.toFixed(2)} units</span>
          </div>
          <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                motionPct > 70 ? 'bg-rose-500' : motionPct > 35 ? 'bg-amber-400' : 'bg-indigo-400'
              }`}
              style={{ width: `${Math.max(3, motionPct)}%` }}
            />
          </div>
        </div>

        {/* Shock Damage */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Impulse Shock Accumulation (ΣJerk)
            </span>
            <span className="font-mono text-amber-300 font-semibold">{shockDamage.toFixed(2)} units</span>
          </div>
          <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                shockPct > 70 ? 'bg-rose-500' : shockPct > 35 ? 'bg-amber-400' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.max(3, shockPct)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Continuous Riemann integration</span>
        <span className="font-mono">dt = 0.0833h</span>
      </div>
    </div>
  );
};
