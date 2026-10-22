import React from 'react';
import { Info } from 'lucide-react';

export const DisclaimerBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 py-1.5 px-3 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="truncate">
          <strong className="text-slate-600">Research Prototype:</strong> Physics-informed surrogate estimates based on synthetic simulation telemetry. Zero clinical claims.
        </span>
      </div>
    );
  }

  return (
    <footer className="mt-8 border-t border-slate-200 pt-4 pb-6 px-4 text-center">
      <div className="max-w-4xl mx-auto flex items-start justify-center gap-2.5 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">
        <Info className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-800">Scientific & Engineering Disclaimer:</strong> HemoTwin is a research prototype digital surrogate model trained and benchmarked on synthetic kinetic/thermal datasets. Outputs represent physics-based mathematical estimates for software and telemetry pipeline benchmarking, not clinical diagnostics, biological viability, or medical triage.
        </span>
      </div>
    </footer>
  );
};
