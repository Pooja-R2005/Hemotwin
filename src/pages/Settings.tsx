import React, { useState } from 'react';
import { useHemoTwin } from '../context/HemoTwinContext';
import { api } from '../services/api';
import { Settings as SettingsIcon, Server, Sliders, Info, Check, RefreshCw, Radio, Cpu } from 'lucide-react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

export const Settings: React.FC = () => {
  const {
    pollingInterval,
    setPollingInterval,
    mode,
    setMode,
    demoScenario,
    setDemoScenario,
    backendConnected,
    triggerManualSync,
  } = useHemoTwin();

  const [backendUrl, setBackendUrl] = useState<string>(api.getBaseUrl());
  const [urlSaved, setUrlSaved] = useState<boolean>(false);
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    api.setBaseUrl(backendUrl);
    setUrlSaved(true);
    setTimeout(() => setUrlSaved(false), 2500);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await api.getHealth();
      setTestResult(`Success: Connected to HemoTwin API (Status: ${res.status}, Bags: ${res.active_bags_count})`);
      await triggerManualSync();
    } catch (err: any) {
      setTestResult(`Failed: ${err.message}`);
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-wide">System Parameters & Settings</h2>
            <p className="text-xs text-slate-500">
              Configure inference API endpoints, polling cadence, and demo generator defaults
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: SYSTEM & BACKEND CONFIGURATION */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 backdrop-blur-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <span>Inference Backend Service</span>
        </h3>

        <form onSubmit={handleSaveUrl} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">FastAPI Backend Endpoint</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{urlSaved ? 'Saved!' : 'Save'}</span>
              </button>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-700 text-slate-600 font-semibold border border-slate-200 transition flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>
            </div>
            {testResult && (
              <p
                className={`mt-2 font-mono text-xs ${
                  testResult.startsWith('Success') ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {testResult}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <div>
              <span className="text-slate-600 font-semibold block">Active Operational Mode</span>
              <span className="text-slate-500 text-[11px]">
                Toggle between synthetic scenario generator and physical ESP32 telemetry
              </span>
            </div>
            <div className="flex items-center rounded-xl bg-slate-50 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setMode('DEMO')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  mode === 'DEMO' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                DEMO
              </button>
              <button
                type="button"
                onClick={() => setMode('LIVE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  mode === 'LIVE' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                LIVE
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* SECTION 2: TELEMETRY & POLLING INTERVALS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 backdrop-blur-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span>Telemetry Refresh & Display Parameters</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Polling & Refresh Interval: <strong className="text-cyan-400 font-mono">{pollingInterval}ms</strong>
            </label>
            <div className="flex gap-2 mt-2">
              {[2000, 3000, 5000].map((ms) => (
                <button
                  key={ms}
                  type="button"
                  onClick={() => setPollingInterval(ms)}
                  className={`px-3 py-1.5 rounded-lg font-mono font-semibold transition ${
                    pollingInterval === ms
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-50 text-slate-500 border border-slate-200 hover:text-slate-900'
                  }`}
                >
                  {ms / 1000}s ({ms}ms)
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Rate at which frontend queries backend for telemetry updates.
            </p>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Temperature Unit</label>
            <input
              type="text"
              readOnly
              value="Celsius (°C) — Medical Cold-Chain Standard"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-2">
              Strictly fixed to Celsius aligned with WHO cold-chain specifications.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: ABOUT PROJECT & CREDITS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 backdrop-blur-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-400" />
          <span>Project Identity & Scientific Protocol</span>
        </h3>

        <div className="text-xs text-slate-500 space-y-2 leading-relaxed">
          <p>
            <strong className="text-slate-900">Project:</strong> HemoTwin: Multi-Physics Digital Surrogate for Hematic Kinetic Stability Forecasting
          </p>
          <p>
            <strong className="text-slate-900">Version:</strong> 0.2.0 (Engineering & Research Prototype)
          </p>
          <p>
            <strong className="text-slate-900">Core Modules:</strong> React 18, TypeScript, Vite, FastAPI 0.128, Scikit-Learn 1.9, Joblib.
          </p>
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
};
