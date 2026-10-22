import React from 'react';
import { useHemoTwin } from '../context/HemoTwinContext';
import { Radio, Cpu, RefreshCw, AlertCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    mode,
    setMode,
    selectedBagId,
    setSelectedBagId,
    selectedProduct,
    setSelectedProduct,
    bags,
    backendConnected,
    currentTwin,
    triggerManualSync,
    isLoading,
  } = useHemoTwin();

  const handleBagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedBagId(id);
    const found = bags.find((b) => b.bag_id === id);
    if (found) {
      setSelectedProduct(found.blood_product);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-slate-950/80 px-6 backdrop-blur-md">
      {/* Left: Project title & selected bag badge */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-bold tracking-wider uppercase text-slate-900 flex items-center gap-2">
            <span>HemoTwin Digital Twin</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              v0.2.0
            </span>
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            {/* Bag Selector Dropdown */}
            <label className="text-xs text-slate-500">Selected Bag:</label>
            <select
              value={selectedBagId}
              onChange={handleBagChange}
              className="bg-white border border-slate-200 text-cyan-300 font-mono text-xs rounded px-2 py-0.5 focus:outline-none focus:border-cyan-400"
            >
              {bags.length > 0 ? (
                bags.map((b) => (
                  <option key={b.bag_id} value={b.bag_id}>
                    {b.bag_id} ({b.blood_product})
                  </option>
                ))
              ) : (
                <option value="HT-001">HT-001 (PRBC)</option>
              )}
            </select>

            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200">
              {selectedProduct}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Data Source Transparency Indicator */}
      <div className="hidden md:flex items-center gap-2">
        {mode === 'DEMO' ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/80 text-xs font-mono text-cyan-400 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-semibold tracking-wide">● DEMO TELEMETRY</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/80 text-xs font-mono text-emerald-400 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold tracking-wide">
              {currentTwin?.data_source === 'live' ? '● LIVE SENSOR TELEMETRY' : '● AWAITING HARDWARE TELEMETRY'}
            </span>
          </div>
        )}
      </div>

      {/* Right: Backend connectivity & Mode Switcher */}
      <div className="flex items-center gap-3">
        {/* Backend status indicator */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${
            backendConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
            }`}
          />
          <span>{backendConnected ? 'Backend Connected' : 'Disconnected'}</span>
        </div>

        {/* Sync button */}
        <button
          onClick={triggerManualSync}
          disabled={isLoading}
          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-600 transition"
          title="Manual Polling Sync"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        {/* Mode Toggle [ DEMO ] [ LIVE ] */}
        <div className="flex items-center rounded-xl bg-white p-1 border border-slate-200">
          <button
            onClick={() => setMode('DEMO')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              mode === 'DEMO'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-mono'
                : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            DEMO
          </button>
          <button
            onClick={() => setMode('LIVE')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              mode === 'LIVE'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-mono'
                : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            LIVE
          </button>
        </div>
      </div>
    </header>
  );
};
