import React, { useState } from 'react';
import { TelemetryPoint, DemoScenario, BloodProduct } from '../types/hemotwin';
import { Thermometer, Play, Pause, RotateCcw, AlertTriangle, ShieldCheck, Flame, Zap } from 'lucide-react';

interface TemperatureChartProps {
  history: TelemetryPoint[];
  targetTemp: number;
  product: BloodProduct;
  scenario: DemoScenario;
  onScenarioChange: (s: DemoScenario) => void;
  isRunning: boolean;
  onToggleRunning: () => void;
  onReset: () => void;
  isLiveMode?: boolean;
}

const SAFE_RANGE_MAP: Record<BloodProduct, [number, number]> = {
  PRBC: [2.0, 6.0],
  Whole_Blood: [2.0, 6.0],
  Platelets: [20.0, 24.0],
  FFP: [-30.0, -18.0],
};

export const TemperatureChart: React.FC<TemperatureChartProps> = ({
  history,
  targetTemp,
  product,
  scenario,
  onScenarioChange,
  isRunning,
  onToggleRunning,
  onReset,
  isLiveMode = false,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<TelemetryPoint | null>(null);

  const [safeMin, safeMax] = SAFE_RANGE_MAP[product] || [2.0, 6.0];

  // Chart dimensions & scaling
  const width = 720;
  const height = 240;
  const padding = { top: 25, right: 30, bottom: 35, left: 50 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Determine Y range dynamically
  const temps = history.map((p) => p.temperature_C);
  const minTemp = Math.min(safeMin - 1.5, ...(temps.length > 0 ? temps : [targetTemp - 2]));
  const maxTemp = Math.max(safeMax + 1.5, ...(temps.length > 0 ? temps : [targetTemp + 2]));
  const yDomain = Math.max(3, maxTemp - minTemp);

  const getY = (temp: number) => {
    return padding.top + plotHeight - ((temp - minTemp) / yDomain) * plotHeight;
  };

  const getX = (index: number, total: number) => {
    if (total <= 1) return padding.left + plotWidth / 2;
    return padding.left + (index / (total - 1)) * plotWidth;
  };

  // Generate SVG path for history
  const points = history.map((pt, i) => ({
    x: getX(i, history.length),
    y: getY(pt.temperature_C),
    data: pt,
  }));

  const linePath =
    points.length > 0
      ? `M ${points[0].x} ${points[0].y} ` +
        points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
      : '';

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${padding.top + plotHeight} L ${points[0].x} ${
          padding.top + plotHeight
        } Z`
      : '';

  const safeMinY = getY(safeMin);
  const safeMaxY = getY(safeMax);
  const targetY = getY(targetTemp);

  const latestTemp = history.length > 0 ? history[history.length - 1].temperature_C : targetTemp;
  const latestDev = latestTemp - targetTemp;

  return (
    <div className="rounded-2xl bg-white p-6 border border-slate-200 backdrop-blur-sm">
      {/* Header with Title and Current Temp Metric */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm tracking-wide">Temperature Monitoring</h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-50 text-cyan-300 border border-slate-200">
                Safe Band: {safeMin}°C to {safeMax}°C
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Target: <strong className="text-slate-200">{targetTemp.toFixed(1)}°C</strong> | Current:{' '}
              <strong className="text-slate-900 font-mono">{latestTemp.toFixed(2)}°C</strong> ({latestDev >= 0 ? `+${latestDev.toFixed(2)}` : latestDev.toFixed(2)}°C)
            </p>
          </div>
        </div>

        {/* Live / Demo Controls */}
        {!isLiveMode ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleRunning}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isRunning
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isRunning ? 'Pause Demo' : 'Resume Demo'}
            </button>
            <button
              onClick={onReset}
              className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-700 transition"
              title="Reset History"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-xs text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Hardware Telemetry Stream</span>
          </div>
        )}
      </div>

      {/* SVG Chart Area */}
      <div className="relative mt-4 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[550px] overflow-visible"
        >
          <defs>
            <linearGradient id="tempAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Safe Storage Range Band (Shaded) */}
          <rect
            x={padding.left}
            y={safeMaxY}
            width={plotWidth}
            height={Math.max(2, safeMinY - safeMaxY)}
            fill="#10b981"
            fillOpacity="0.08"
            stroke="#10b981"
            strokeOpacity="0.25"
            strokeDasharray="4 4"
          />
          <text
            x={width - padding.right - 8}
            y={safeMaxY + 12}
            textAnchor="end"
            fontSize="9"
            fill="#10b981"
            fontFamily="monospace"
          >
            Safe Zone (Nominal)
          </text>

          {/* Target Temperature Line */}
          <line
            x1={padding.left}
            y1={targetY}
            x2={width - padding.right}
            y2={targetY}
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="6 3"
          />
          <text
            x={padding.left + 8}
            y={targetY - 5}
            fontSize="10"
            fill="#38bdf8"
            fontFamily="monospace"
            fontWeight="bold"
          >
            Target: {targetTemp}°C
          </text>

          {/* Area under temperature line */}
          {areaPath && <path d={areaPath} fill="url(#tempAreaGrad)" />}

          {/* Main Temperature Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          )}

          {/* Data Points */}
          {points.map((pt, i) => {
            const isHovered = hoveredPoint === pt.data;
            const isLatest = i === points.length - 1;
            const isExcursion = pt.data.temperature_C < safeMin || pt.data.temperature_C > safeMax;

            return (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 6 : isLatest ? 5 : 3.5}
                fill={isExcursion ? '#ef4444' : '#06b6d4'}
                stroke="#0f172a"
                strokeWidth={2}
                className="cursor-pointer transition-all hover:scale-150"
                onMouseEnter={() => setHoveredPoint(pt.data)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

          {/* Y Axis Guide ticks */}
          <text x={padding.left - 8} y={getY(minTemp)} fontSize="9" fill="#64748b" textAnchor="end" fontFamily="monospace">
            {minTemp.toFixed(1)}°C
          </text>
          <text x={padding.left - 8} y={getY(targetTemp)} fontSize="9" fill="#38bdf8" textAnchor="end" fontFamily="monospace">
            {targetTemp.toFixed(1)}°C
          </text>
          <text x={padding.left - 8} y={getY(maxTemp)} fontSize="9" fill="#64748b" textAnchor="end" fontFamily="monospace">
            {maxTemp.toFixed(1)}°C
          </text>
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-2 right-4 p-3 rounded-xl bg-slate-950/95 border border-cyan-500/40 text-xs shadow-2xl backdrop-blur-md z-10 font-mono">
            <div className="text-cyan-400 font-bold">Telemetry Sample: {hoveredPoint.timestamp}</div>
            <div className="text-slate-900 mt-1">Temperature: <strong className="text-cyan-300">{hoveredPoint.temperature_C.toFixed(2)}°C</strong></div>
            <div className="text-slate-500">Deviation: {hoveredPoint.deviation_C > 0 ? `+${hoveredPoint.deviation_C.toFixed(2)}` : hoveredPoint.deviation_C.toFixed(2)}°C</div>
            <div className="text-slate-500">RMS Accel: {hoveredPoint.accel_rms_g.toFixed(3)}g</div>
            <div className="text-slate-500">Remaining Safe Time: {hoveredPoint.remaining_safe_time_hours.toFixed(1)}h</div>
          </div>
        )}
      </div>

      {/* Demo Scenario Selector Pill Buttons */}
      {!isLiveMode && (
        <div className="mt-5 pt-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Demo Simulation Scenario:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onScenarioChange('normal')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  scenario === 'normal'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Normal Cold-Chain
              </button>

              <button
                onClick={() => onScenarioChange('temperature_excursion')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  scenario === 'temperature_excursion'
                    ? 'bg-rose-500 text-slate-900 shadow-md font-bold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-700'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                Temp Excursion
              </button>

              <button
                onClick={() => onScenarioChange('high_motion')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  scenario === 'high_motion'
                    ? 'bg-indigo-500 text-slate-900 shadow-md font-bold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                High Motion
              </button>

              <button
                onClick={() => onScenarioChange('shock_event')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  scenario === 'shock_event'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-700'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Shock Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
