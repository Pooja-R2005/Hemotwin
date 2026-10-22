import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: LucideIcon;
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'orange' | 'rose' | 'indigo';
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  children?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  accentColor = 'cyan',
  trend,
  children,
}) => {
  const colorMap = {
    cyan: {
      border: 'hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      glow: 'group-hover:shadow-[0_0_20px_rgba(6,182,212,0.12)]',
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]',
    },
    amber: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.12)]',
    },
    orange: {
      border: 'hover:border-orange-500/40',
      iconBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      glow: 'group-hover:shadow-[0_0_20px_rgba(249,115,22,0.12)]',
    },
    rose: {
      border: 'hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      glow: 'group-hover:shadow-[0_0_20px_rgba(244,63,94,0.12)]',
    },
    indigo: {
      border: 'hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      glow: 'group-hover:shadow-[0_0_20px_rgba(99,102,241,0.12)]',
    },
  }[accentColor];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200 transition-all duration-300 ${colorMap.border} ${colorMap.glow} backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${colorMap.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono">{value}</span>
        {unit && <span className="text-sm font-medium text-slate-500">{unit}</span>}
      </div>

      {trend && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span className={trend.isPositive ? 'text-emerald-400' : 'text-amber-400'}>
            {trend.value}
          </span>
          <span className="text-slate-500">vs nominal</span>
        </div>
      )}

      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}

      {children && <div className="mt-3 pt-3 border-t border-slate-200">{children}</div>}
    </div>
  );
};
