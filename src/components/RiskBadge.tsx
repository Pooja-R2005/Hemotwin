import React from 'react';
import { RiskLevel } from '../types/hemotwin';
import { ShieldCheck, AlertTriangle, AlertOctagon, Flame } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel | null | undefined;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level = 'LOW', size = 'md' }) => {
  const currentLevel = level || 'LOW';

  const config = {
    LOW: {
      label: 'LOW RISK',
      sub: 'Nominal Kinetics',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.25)]',
      icon: ShieldCheck,
    },
    MEDIUM: {
      label: 'MEDIUM RISK',
      sub: 'Thermal/Motion Shift',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]',
      icon: AlertTriangle,
    },
    HIGH: {
      label: 'HIGH RISK',
      sub: 'Accelerated Drift',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/30',
      glow: 'shadow-[0_0_12px_rgba(249,115,22,0.25)]',
      icon: Flame,
    },
    CRITICAL: {
      label: 'CRITICAL RISK',
      sub: 'Stability Threshold Exceeded',
      color: 'text-rose-400',
      bg: 'bg-rose-500/15 border-rose-500/40',
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.35)]',
      icon: AlertOctagon,
    },
  }[currentLevel];

  const Icon = config.icon;

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.color}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
        {config.label}
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${config.bg} ${config.color} ${config.glow}`}>
        <Icon className="w-6 h-6 animate-pulse" />
        <div>
          <div className="font-bold text-sm tracking-wider">{config.label}</div>
          <div className="text-[11px] opacity-80">{config.sub}</div>
        </div>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold border ${config.bg} ${config.color} ${config.glow}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
};
