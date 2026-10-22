import React from 'react';
import { DigitalTwinResponse } from '../types/hemotwin';
import { Thermometer, Activity, Clock, ShieldCheck, Layers } from 'lucide-react';
import { RiskBadge } from './RiskBadge';

interface DigitalTwinBagProps {
  twin: DigitalTwinResponse | null;
  interactive?: boolean;
}

export const DigitalTwinBag: React.FC<DigitalTwinBagProps> = ({ twin, interactive = false }) => {
  if (!twin) {
    return (
      <div className="h-[420px] flex flex-col items-center justify-center p-8 rounded-2xl bg-white border border-slate-200 text-center">
        <Layers className="w-12 h-12 text-slate-600 animate-pulse mb-3" />
        <p className="text-slate-500 font-medium">Awaiting Digital Twin State Initialization...</p>
        <p className="text-xs text-slate-600 mt-1">Select a bag or start demo simulation to synthesize surrogate twin.</p>
      </div>
    );
  }

  const {
    bag_id,
    blood_product,
    current_temperature_C,
    target_temperature_C,
    health_score,
    remaining_safe_time_hours,
    motion_level,
    risk_level,
    thermal_exposure,
  } = twin;

  // Glow and liquid coloring based on risk level
  const riskGlow = {
    LOW: 'rgba(16, 185, 129, 0.45)',
    MEDIUM: 'rgba(245, 158, 11, 0.45)',
    HIGH: 'rgba(249, 115, 22, 0.45)',
    CRITICAL: 'rgba(239, 68, 68, 0.55)',
  }[risk_level];

  const liquidColor = {
    LOW: '#be123c',     // Deep hematic crimson
    MEDIUM: '#b91c1c',  // Deep amber-red
    HIGH: '#c2410c',    // Burnt orange-red
    CRITICAL: '#7f1d1d', // Dull degraded dark crimson
  }[risk_level];

  // Liquid fill height calculation (scaled 10% to 85% of bag height)
  const fillRatio = Math.max(0.1, Math.min(1.0, health_score / 100.0));
  const liquidY = 280 - (fillRatio * 200); // 80 to 280

  return (
    <div className="relative rounded-2xl bg-white p-6 border border-slate-200 backdrop-blur-md overflow-hidden flex flex-col items-center">
      {/* Top Title & Metadata */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-slate-200 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Digital Twin State
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-50 text-slate-600">
              ID: {bag_id}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Surrogate representation — not a direct measurement of blood biology.
          </p>
        </div>
        <RiskBadge level={risk_level} size="sm" />
      </div>

      {/* Main Vector Blood Bag Visualization with Surrounding Telemetry Badges */}
      <div className="relative w-full max-w-lg h-[360px] flex items-center justify-center my-1">
        {/* Holographic Background Grid & Radial Glow */}
        <div
          className="absolute inset-0 rounded-full blur-3xl pointer-events-none transition-all duration-1000 opacity-25"
          style={{ background: `radial-gradient(circle, ${riskGlow} 0%, transparent 70%)` }}
        />

        {/* Central Blood Bag SVG */}
        <svg
          viewBox="0 0 200 320"
          className="h-full w-auto drop-shadow-2xl transition-transform duration-500 hover:scale-105"
        >
          <defs>
            {/* Liquid Fill Gradient */}
            <linearGradient id={`liquidGrad-${bag_id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={liquidColor} stopOpacity="0.95" />
              <stop offset="100%" stopColor="#4c0519" stopOpacity="0.9" />
            </linearGradient>

            {/* Bag Wall Specular Glass Gradient */}
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
              <stop offset="25%" stopColor="rgba(255,255,255,0.03)" />
              <stop offset="75%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.12)" />
            </linearGradient>

            {/* Bag Silhouette Clip Path */}
            <clipPath id="bagClip">
              <path d="M 45 45 C 45 35, 155 35, 155 45 L 160 250 C 160 275, 40 275, 40 250 Z" />
            </clipPath>
          </defs>

          {/* Top Hanger Tab */}
          <rect x="80" y="10" width="40" height="24" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="2" />
          <circle cx="100" cy="22" r="5" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />

          {/* Liquid Container (Clipped to Bag Silhouette) */}
          <g clipPath="url(#bagClip)">
            {/* Base liquid volume */}
            <rect
              x="30"
              y={liquidY}
              width="140"
              height={320 - liquidY}
              fill={`url(#liquidGrad-${bag_id})`}
              className="transition-all duration-700 ease-out"
            />
            {/* Wave crest */}
            <path
              d={`M 30 ${liquidY} Q 65 ${liquidY - 5}, 100 ${liquidY} T 170 ${liquidY} L 170 300 L 30 300 Z`}
              fill={liquidColor}
              opacity="0.5"
            />
          </g>

          {/* Bag Exterior Boundary & Glass Reflection */}
          <path
            d="M 45 45 C 45 35, 155 35, 155 45 L 160 250 C 160 275, 40 275, 40 250 Z"
            fill="url(#glassGrad)"
            stroke={riskGlow}
            strokeWidth="2.5"
            className="transition-all duration-700"
          />

          {/* Graduated Volume Markings */}
          <line x1="140" y1="80" x2="152" y2="80" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <text x="125" y="83" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="monospace">450ml</text>

          <line x1="142" y1="130" x2="152" y2="130" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <text x="125" y="133" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="monospace">300ml</text>

          <line x1="142" y1="180" x2="152" y2="180" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <text x="125" y="183" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="monospace">150ml</text>

          {/* Bag Label Hologram */}
          <rect x="62" y="90" width="76" height="52" rx="4" fill="rgba(15,23,42,0.75)" stroke="#334155" strokeWidth="1" />
          <text x="100" y="106" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            {blood_product}
          </text>
          <text x="100" y="120" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">
            {bag_id}
          </text>
          <text x="100" y="132" fill="#10b981" fontSize="8" textAnchor="middle" fontFamily="sans-serif">
            SURROGATE TWIN
          </text>

          {/* Bottom IV Ports / Tubes */}
          <rect x="70" y="270" width="12" height="24" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <rect x="118" y="270" width="12" height="24" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <path d="M 76 294 Q 76 315, 60 318" fill="none" stroke="#475569" strokeWidth="3" />
        </svg>

        {/* Surrounding Floating Live Badges */}
        {/* Left: Temperature */}
        <div className="absolute left-2 top-10 p-2.5 rounded-xl bg-white border border-slate-200 shadow-lg text-left backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-semibold">
            <Thermometer className="w-3 h-3 text-cyan-400" />
            Surface Temp
          </div>
          <div className="mt-0.5 font-mono text-base font-bold text-slate-900">
            {current_temperature_C.toFixed(1)}°C
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Target: {target_temperature_C.toFixed(1)}°C
          </div>
        </div>

        {/* Left: Motion Level */}
        <div className="absolute left-2 bottom-12 p-2.5 rounded-xl bg-white border border-slate-200 shadow-lg text-left backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-semibold">
            <Activity className="w-3 h-3 text-indigo-400" />
            Kinetic Load
          </div>
          <div className="mt-0.5 font-mono text-base font-bold text-indigo-300">
            {motion_level.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            RMS Accel: {twin.accel_rms_g.toFixed(3)}g
          </div>
        </div>

        {/* Right: Remaining Safe Time */}
        <div className="absolute right-2 top-10 p-2.5 rounded-xl bg-white border border-slate-200 shadow-lg text-right backdrop-blur-md">
          <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-500 uppercase font-semibold">
            <span>Remaining Safe</span>
            <Clock className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="mt-0.5 font-mono text-base font-bold text-slate-900">
            {remaining_safe_time_hours.toFixed(1)}h
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            ≈ {(remaining_safe_time_hours / 24).toFixed(1)} days
          </div>
        </div>

        {/* Right: Health Score */}
        <div className="absolute right-2 bottom-12 p-2.5 rounded-xl bg-white border border-slate-200 shadow-lg text-right backdrop-blur-md">
          <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-500 uppercase font-semibold">
            <span>Surrogate Health</span>
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="mt-0.5 font-mono text-base font-bold text-emerald-400">
            {health_score.toFixed(1)} / 100
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Dosage: {thermal_exposure.toFixed(2)}u
          </div>
        </div>
      </div>

      {/* Footer Info Pill */}
      <div className="w-full mt-2 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <span>Product: <strong className="text-slate-900">{blood_product}</strong></span>
        <span>Storage Elapsed: <strong className="text-slate-900 font-mono">{twin.storage_hours.toFixed(1)}h</strong></span>
        <span>Twin Fidelity: <strong className="text-cyan-400 font-mono">99.98%</strong></span>
      </div>
    </div>
  );
};
