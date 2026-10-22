import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ModelInfo } from '../types/hemotwin';
import { FileText, Cpu, Database, Award, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

export const Reports: React.FC = () => {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api
      .getModelInfo()
      .then((info) => {
        setModelInfo(info);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Could not fetch model info, using research fallback benchmark:', err);
        setLoading(false);
      });
  }, []);

  const featureList = modelInfo?.features || [
    'temperature_C',
    'target_temp_C',
    'temperature_deviation_C',
    'accel_x_g',
    'accel_y_g',
    'accel_z_g',
    'gyro_x_dps',
    'gyro_y_dps',
    'gyro_z_dps',
    'accel_rms_g',
    'gyro_rms_dps',
    'jerk_rms',
    'shock_event',
    'shock_magnitude',
    'shock_count_1h',
    'storage_hours',
    'thermal_stress',
    'cumulative_thermal_exposure',
    'core_temperature_est_C',
    'cumulative_motion_exposure',
    'cumulative_shock_damage',
    'blood_product',
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-wide">
              Research Benchmark & Model Report
            </h2>
            <p className="text-xs text-slate-500">
              Physics-Informed Digital Surrogate for Hematic Kinetic Stability Validation
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          Synthetic-Data Benchmark
        </span>
      </div>

      {/* BENCHMARK CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 backdrop-blur-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1 flex items-center justify-between">
            <span>Test MAE</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900">
            {modelInfo?.benchmarks.test_mae_hours ?? 7.24} <span className="text-sm font-normal text-slate-500">hours</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Mean Absolute Error across 120 held-out test bags
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 backdrop-blur-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1 flex items-center justify-between">
            <span>Test R² Score</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            {modelInfo?.benchmarks.test_r2 ?? 0.99986}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Coefficient of Determination on synthetic test set
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 backdrop-blur-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1 flex items-center justify-between">
            <span>Synthetic Records</span>
            <Database className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900">
            {(modelInfo?.training_dataset_size ?? 172800).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Simulated multi-physics telemetry steps
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 backdrop-blur-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1 flex items-center justify-between">
            <span>Simulated Bags</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900">
            {modelInfo?.simulated_bags_count ?? 600}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Bag-level grouped split (GroupKFold, 5 splits)
          </p>
        </div>
      </div>

      {/* CRITICAL LIMITATION CALLOUT */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 backdrop-blur-sm text-xs text-amber-200">
        <div className="flex items-center gap-2 font-bold text-amber-300 text-sm mb-2">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>Crucial Synthetic Boundary & Limitation Notice</span>
        </div>
        <p className="leading-relaxed">
          The model was trained strictly on synthetic numerical data derived from thermodynamic and kinematic equations (Arrhenius kinetic degradation, lumped heat capacitance, 6-DOF shock impulses). The high R² (0.99986) indicates surrogate fidelity to the synthetic simulator equations, <strong>NOT clinical diagnostic precision or real blood biological viability</strong>. Under no circumstances should this model be used for hospital patient transfusion safety decisions.
        </p>
      </div>

      {/* MODEL ARCHITECTURE & FEATURE PIPELINE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model Architecture Overview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Model Specifications (Experiment B)</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-200">
              <span className="text-slate-500">Primary Algorithm:</span>
              <strong className="text-slate-900 font-mono">HistGradientBoostingRegressor</strong>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-200">
              <span className="text-slate-500">Target Feature:</span>
              <strong className="text-cyan-300 font-mono">remaining_safe_time_hours</strong>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-200">
              <span className="text-slate-500">Validation Split Strategy:</span>
              <strong className="text-slate-900">Bag-Level GroupKFold (Zero leakage)</strong>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-200">
              <span className="text-slate-500">Preprocessing Pipeline:</span>
              <strong className="text-slate-900">StandardScaler (21 num) + OneHot (blood_product)</strong>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500">Total Features:</span>
              <strong className="text-cyan-400 font-mono">{featureList.length} inputs</strong>
            </div>
          </div>
        </div>

        {/* Feature Alignment Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Exact 22-Feature Alignment Sequence</span>
          </h3>

          <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-slate-950/60 p-3 font-mono text-[11px] text-slate-600 space-y-1">
            {featureList.map((feat, idx) => (
              <div key={feat} className="flex items-center justify-between py-0.5 px-2 hover:bg-slate-50/60 rounded">
                <span className="text-slate-500">{String(idx + 1).padStart(2, '0')}.</span>
                <span className="text-cyan-300 font-semibold">{feat}</span>
                <span className="text-[10px] text-slate-500">
                  {feat === 'blood_product' ? 'categorical' : 'numerical'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
};
