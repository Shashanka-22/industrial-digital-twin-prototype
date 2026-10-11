import React from 'react';
import {
  LayoutDashboard,
  Box,
  Gauge,
  Cpu,
  AlertOctagon,
  Network,
  RotateCw,
  LineChart,
  Settings,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export type PageId =
  | 'overview'
  | 'digital_twin'
  | 'telemetry'
  | 'predictive_maint'
  | 'alarms'
  | 'architecture'
  | 'virtual_commissioning'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeType?: 'warning' | 'critical' | 'info';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { unacknowledgedAlarmCount, criticalAlarmCount, currentTelemetry, isConnected } = useSimulation();

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'digital_twin', label: 'Live Digital Twin', icon: Box },
    { id: 'telemetry', label: 'Motor Telemetry', icon: Gauge },
    { id: 'predictive_maint', label: 'Predictive Maintenance', icon: Cpu },
    {
      id: 'alarms',
      label: 'Alarm Center',
      icon: AlertOctagon,
      badge: unacknowledgedAlarmCount > 0 ? unacknowledgedAlarmCount : undefined,
      badgeType: criticalAlarmCount > 0 ? 'critical' : 'warning',
    },
    { id: 'architecture', label: 'Industrial Architecture', icon: Network },
    { id: 'virtual_commissioning', label: 'Virtual Commissioning', icon: RotateCw },
    { id: 'analytics', label: 'Historical Analytics', icon: LineChart },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 z-40 h-full lg:h-[calc(100vh-4rem)] w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 transition-transform duration-200 border-r border-slate-800 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation items list */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 tracking-wider">
            INDUSTRIAL WORKSPACES
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectPage(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-700 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-teal-200' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.badgeType === 'critical'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-amber-500 text-slate-900'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Asset Health Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Asset Health</span>
              <span
                className={`font-mono font-bold ${
                  currentTelemetry.assetHealthPct < 60
                    ? 'text-rose-400'
                    : currentTelemetry.assetHealthPct < 85
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {currentTelemetry.assetHealthPct}%
              </span>
            </div>

            {/* Health Bar */}
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  currentTelemetry.assetHealthPct < 60
                    ? 'bg-rose-500'
                    : currentTelemetry.assetHealthPct < 85
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${currentTelemetry.assetHealthPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                {currentTelemetry.assetHealthPct >= 80 ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>RUL:</span>
              </span>
              <span className="font-mono text-slate-200">
                {currentTelemetry.estimatedRulHours.toLocaleString()} hrs
              </span>
            </div>

            <div className="pt-1.5 text-[10px] border-t border-slate-800 space-y-0.5">
              <div className="flex items-center justify-between text-slate-400">
                <span>Conceptual PLC Reference</span>
                <span className="font-mono text-[9px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  Not Connected
                </span>
              </div>
              <div className="text-[9px] text-slate-500 font-mono">
                Target: S7-1516-3 (Local Simulator)
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
