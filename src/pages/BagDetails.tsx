import React from 'react';
import { useHemoTwin } from '../context/HemoTwinContext';
import { RiskBadge } from '../components/RiskBadge';
import { ArrowLeft, Thermometer, Clock, Activity, ShieldCheck, Zap, Layers, AlertCircle } from 'lucide-react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

interface BagDetailsProps {
  bagId: string;
  onBack: () => void;
}

export const BagDetails: React.FC<BagDetailsProps> = ({ bagId, onBack }) => {
  const { currentTwin, telemetryHistory } = useHemoTwin();

  const twin = currentTwin?.bag_id === bagId ? currentTwin : currentTwin;

  const targetTemp = twin?.target_temperature_C ?? 4.0;
  const currentTemp = twin?.current_temperature_C ?? 4.0;
  const dev = twin?.temperature_deviation_C ?? 0.0;
  const healthScore = twin?.health_score ?? 99.8;
  const rst = twin?.remaining_safe_time_hours ?? 990.8;
  const risk = twin?.risk_level ?? 'LOW';

  return (
    <div className="space-y-6">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Inventory</span>
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-wide font-mono">
              Telemetry Inspection: {bagId}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-50 text-cyan-300 border border-slate-200">
              {twin?.blood_product || 'PRBC'}
            </span>
          </div>
        </div>

        <RiskBadge level={risk} size="md" />
      </div>

      {/* Bag Information & Current State Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card: Bag Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 backdrop-blur-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Bag Inventory Parameters</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-2">
            <div className="p-3 rounded-xl bg-slate-50/40 border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-sans">Bag Identifier:</span>
              <span className="text-slate-900 font-bold text-sm">{bagId}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/40 border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-sans">Blood Product:</span>
              <span className="text-cyan-300 font-bold text-sm">{twin?.blood_product || 'PRBC'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/40 border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-sans">Target Storage Temp:</span>
              <span className="text-slate-900 font-bold text-sm">{targetTemp.toFixed(1)}°C</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/40 border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-sans">Elapsed Storage:</span>
              <span className="text-slate-900 font-bold text-sm">{twin?.storage_hours.toFixed(1) || '0.0'}h</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Data Stream Source: <strong className="text-slate-600 capitalize">{twin?.data_source || 'synthetic'}</strong></span>
            <span>Surrogate Model: <strong className="text-slate-600">Physics-Informed</strong></span>
          </div>
        </div>

        {/* Card: Current Synthesized State */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 backdrop-blur-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Current Real-Time Metrics</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-2">
            <div className="p-3 rounded-xl bg-slate-50/40 border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-sans">Current Temperature:</span>
              <span className="text-slate-900 font-bold text-sm flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                {currentTemp.toFixed(2)}°C ({dev > 0 ? `+${dev.toFixed(2)}` : dev.toFixed(2)}°C)
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/40 border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-sans">Surrogate Health Score:</span>
              <span className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {healthScore.toFixed(1)} / 100
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/40 border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-sans">Remaining Safe Time:</span>
              <span className="text-cyan-300 font-bold text-sm flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {rst.toFixed(1)}h (≈ {(rst / 24).toFixed(1)}d)
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/40 border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-sans">Shock Events:</span>
              <span className="text-slate-900 font-bold text-sm flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                {twin?.shock_count ?? 0} events
              </span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500">
            Digital Surrogate score: <strong className="text-cyan-300 font-mono">{twin?.digital_twin_score ?? 0.85}</strong>
          </div>
        </div>
      </div>

      {/* Historical Telemetry Session Charts */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">Session Telemetry History</h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-200">
              {telemetryHistory.length} Samples
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Frontend current-session telemetry history only (not persistent hardware memory)</span>
          </div>
        </div>

        {/* Telemetry Log Table */}
        <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead className="sticky top-0 bg-slate-950 text-slate-500 uppercase font-semibold text-[10px]">
              <tr className="border-b border-slate-200">
                <th className="p-3">Time</th>
                <th className="p-3">Temp (°C)</th>
                <th className="p-3">Deviation</th>
                <th className="p-3">RMS Accel (g)</th>
                <th className="p-3">RMS Gyro (°/s)</th>
                <th className="p-3">Jerk (g/s)</th>
                <th className="p-3">Health Score</th>
                <th className="p-3">Remaining Safe (h)</th>
                <th className="p-3">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-white">
              {telemetryHistory.length > 0 ? (
                telemetryHistory
                  .slice()
                  .reverse()
                  .map((pt, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40">
                      <td className="p-3 text-slate-500">{pt.timestamp}</td>
                      <td className="p-3 text-slate-900 font-bold">{pt.temperature_C.toFixed(2)}°C</td>
                      <td className="p-3 text-slate-600">
                        {pt.deviation_C > 0 ? `+${pt.deviation_C.toFixed(2)}` : pt.deviation_C.toFixed(2)}°C
                      </td>
                      <td className="p-3 text-cyan-300">{pt.accel_rms_g.toFixed(3)}g</td>
                      <td className="p-3 text-indigo-300">{pt.gyro_rms_dps.toFixed(2)}°/s</td>
                      <td className="p-3 text-amber-300">{pt.jerk_rms.toFixed(3)}g/s</td>
                      <td className="p-3 text-emerald-400 font-bold">{pt.health_score.toFixed(1)}</td>
                      <td className="p-3 text-cyan-400 font-bold">{pt.remaining_safe_time_hours.toFixed(1)}h</td>
                      <td className="p-3">
                        <RiskBadge level={pt.risk_level} size="sm" />
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-500 font-sans">
                    No telemetry packets recorded in this active browser session yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
};
