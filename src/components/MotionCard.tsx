import React from 'react';
import { Activity, Zap, Compass, AlertCircle } from 'lucide-react';

interface MotionCardProps {
  accelRms: number;
  gyroRms: number;
  jerkRms: number;
  shockCount: number;
}

export const MotionCard: React.FC<MotionCardProps> = ({
  accelRms,
  gyroRms,
  jerkRms,
  shockCount,
}) => {
  // Normalized visual bars
  const accelPct = Math.min(100, Math.round((accelRms / 0.5) * 100));
  const gyroPct = Math.min(100, Math.round((gyroRms / 25.0) * 100));
  const jerkPct = Math.min(100, Math.round((jerkRms / 1.0) * 100));

  return (
    <div className="rounded-2xl bg-white p-6 border border-slate-200 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Motion & Handling Telemetry
          </span>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
          6-DOF Kinematics
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        {/* Accel RMS */}
        <div className="p-3 rounded-xl bg-slate-50/40 border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Acceleration RMS</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1 font-mono font-bold text-lg text-slate-900">
            <span>{accelRms.toFixed(3)}</span>
            <span className="text-xs font-normal text-slate-500">g</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                accelPct > 70 ? 'bg-rose-500' : accelPct > 35 ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.max(5, accelPct)}%` }}
            />
          </div>
        </div>

        {/* Gyro RMS */}
        <div className="p-3 rounded-xl bg-slate-50/40 border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Gyroscope RMS</span>
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1 font-mono font-bold text-lg text-slate-900">
            <span>{gyroRms.toFixed(2)}</span>
            <span className="text-xs font-normal text-slate-500">°/s</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                gyroPct > 70 ? 'bg-rose-500' : gyroPct > 35 ? 'bg-amber-400' : 'bg-indigo-400'
              }`}
              style={{ width: `${Math.max(5, gyroPct)}%` }}
            />
          </div>
        </div>

        {/* Jerk RMS */}
        <div className="p-3 rounded-xl bg-slate-50/40 border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Jerk Dynamics</span>
            <Activity className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1 font-mono font-bold text-lg text-slate-900">
            <span>{jerkRms.toFixed(3)}</span>
            <span className="text-xs font-normal text-slate-500">g/s</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                jerkPct > 70 ? 'bg-rose-500' : jerkPct > 35 ? 'bg-amber-400' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.max(5, jerkPct)}%` }}
            />
          </div>
        </div>

        {/* Shock Events */}
        <div className="p-3 rounded-xl bg-slate-50/40 border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Shock Events</span>
            <AlertCircle
              className={`w-3.5 h-3.5 ${shockCount > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-500'}`}
            />
          </div>
          <div className="mt-1 flex items-baseline gap-1 font-mono font-bold text-lg text-slate-900">
            <span className={shockCount > 0 ? 'text-rose-400' : 'text-slate-900'}>{shockCount}</span>
            <span className="text-xs font-normal text-slate-500">events</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                shockCount === 0 ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'
              }`}
            />
            <span>{shockCount === 0 ? 'Zero impacts recorded' : 'Impulse detected'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
