import React from 'react';
import { Clock, ShieldAlert } from 'lucide-react';
import { BloodProduct } from '../types/hemotwin';

interface RemainingSafeTimeCardProps {
  hours: number;
  product: BloodProduct;
}

const MAX_HOURS_MAP: Record<BloodProduct, number> = {
  PRBC: 1008,       // 42 days
  Whole_Blood: 840, // 35 days
  Platelets: 120,   // 5 days
  FFP: 8760,        // 365 days
};

export const RemainingSafeTimeCard: React.FC<RemainingSafeTimeCardProps> = ({ hours, product }) => {
  const maxHours = MAX_HOURS_MAP[product] || 1008;
  const ratio = Math.max(0, Math.min(1, hours / maxHours));
  const percentage = Math.round(ratio * 100);
  const days = (hours / 24).toFixed(1);

  // SVG circle calculations
  const size = 110;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ratio * circumference;

  let gaugeColor = '#10b981'; // emerald
  if (ratio < 0.25) gaugeColor = '#ef4444'; // red
  else if (ratio < 0.5) gaugeColor = '#f97316'; // orange
  else if (ratio < 0.75) gaugeColor = '#f59e0b'; // amber

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 border border-slate-200 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Estimated Remaining Safe Time
          </span>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
          Max: {maxHours}h
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-6">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900 font-mono">
              {hours.toFixed(1)}
            </span>
            <span className="text-lg font-semibold text-slate-500 font-mono">h</span>
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm text-cyan-300 font-medium font-mono">
            <span>≈ {days} days</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500 text-xs">Lifespan buffer</span>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
            <span>Physics-informed surrogate estimate</span>
          </div>
        </div>

        {/* Circular Progress Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width={size} height={size} className="rotate-[-90deg]">
            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-800"
              fill="transparent"
            />
            {/* Value Arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={gaugeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.8s ease' }}
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-base font-bold font-mono text-slate-900">{percentage}%</span>
            <span className="text-[10px] uppercase text-slate-500 font-medium">Safe</span>
          </div>
        </div>
      </div>
    </div>
  );
};
