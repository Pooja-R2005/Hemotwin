import React, { useState } from 'react';
import {
  LayoutDashboard,
  Boxes,
  Layers,
  BarChart3,
  FileText,
  Settings,
  Activity,
  HeartPulse,
  Radio,
  Cpu,
  Menu,
  ChevronLeft,
  Users
} from 'lucide-react';
import { useHemoTwin } from '../context/HemoTwinContext';

export type NavPage = 'dashboard' | 'bags' | 'digital-twin' | 'analytics' | 'reports' | 'donors' | 'settings';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { mode, backendConnected } = useHemoTwin();
  const [isOpen, setIsOpen] = useState(false);

  const navItems: { id: NavPage; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bags', label: 'Blood Bags', icon: Boxes },
    { id: 'digital-twin', label: 'Digital Twin', icon: Layers },
    { id: 'donors', label: 'Donors', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`shrink-0 flex flex-col justify-between border-r border-slate-200 bg-white p-4 min-h-screen transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      {/* Branding and Toggle */}
      <div>
        <div className="flex items-center justify-between px-2 py-3">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 shadow-lg shadow-cyan-900/10 text-slate-900">
              <HeartPulse className="h-6 w-6" />
            </div>
            {isOpen && (
              <div>
                <h1 className="text-base font-extrabold tracking-wide text-slate-800">HemoTwin</h1>
                <p className="text-[11px] font-medium uppercase tracking-wider text-cyan-600">
                  Digital Surrogate
                </p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors shrink-0 absolute left-20"
            style={{ left: isOpen ? '15rem' : '4rem', zIndex: 50 }}
          >
            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation links */}
        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex w-full items-center ${isOpen ? 'justify-start px-3' : 'justify-center px-0'} gap-3 rounded-xl py-3 text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-cyan-50 text-cyan-700 shadow-sm font-bold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
                title={!isOpen ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-cyan-600' : 'text-slate-500'}`} />
                {isOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom System Status Box */}
      {isOpen && (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3 text-xs shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-bold text-[11px] uppercase tracking-wider">System Status</span>
            <Activity className="w-4 h-4 text-slate-500" />
          </div>

          {/* Connection pill */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                backendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="text-slate-700 font-mono text-[11px] font-semibold">
              {backendConnected ? 'Backend Connected' : 'Offline / Error'}
            </span>
          </div>

          {/* Mode indicator */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-[11px]">
            <span className="text-slate-500 font-medium">Active Mode:</span>
            <span
              className={`inline-flex items-center gap-1 font-bold font-mono px-2 py-0.5 rounded text-[10px] ${
                mode === 'DEMO'
                  ? 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}
            >
              {mode === 'DEMO' ? <Radio className="w-3 h-3" /> : <Cpu className="w-3 h-3" />}
              {mode}
            </span>
          </div>

          <div className="text-[10px] text-slate-500 text-center pt-2 font-mono">
            Research Prototype v0.2.0
          </div>
        </div>
      )}
    </aside>
  );
};
