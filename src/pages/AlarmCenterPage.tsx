import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { AlarmItem, AlarmSeverity } from '../types/alarms';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Search,
  Filter,
  CheckCheck,
  Trash2,
  BellRing,
  ShieldAlert,
} from 'lucide-react';

export const AlarmCenterPage: React.FC = () => {
  const {
    alarms,
    acknowledgeAlarm,
    resolveAlarm,
    acknowledgeAllAlarms,
    clearResolvedAlarms,
    unacknowledgedAlarmCount,
    criticalAlarmCount,
  } = useSimulation();

  const [severityFilter, setSeverityFilter] = useState<'all' | AlarmSeverity>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unacknowledged' | 'acknowledged' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlarm, setSelectedAlarm] = useState<AlarmItem | null>(null);

  // Filtered alarms
  const filteredAlarms = alarms.filter((alm) => {
    if (severityFilter !== 'all' && alm.severity !== severityFilter) return false;
    if (statusFilter === 'unacknowledged' && (alm.acknowledged || alm.resolved)) return false;
    if (statusFilter === 'acknowledged' && (!alm.acknowledged || alm.resolved)) return false;
    if (statusFilter === 'resolved' && !alm.resolved) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        alm.id.toLowerCase().includes(q) ||
        alm.sensor.toLowerCase().includes(q) ||
        alm.description.toLowerCase().includes(q) ||
        alm.subsystem.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Alarm Management & Event Console
            </h2>
            <span className="text-xs font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
              Alarm Management Concepts — IEC 62682 / ISA-18.2 References
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Educational exploration of alarm-management concepts; formal compliance and certification are not claimed. Demonstrates simulated prioritization, acknowledgement, event history, debounce, and hysteresis.
          </p>
        </div>

        {/* Alarm Summary Badges */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <div className="text-xs">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Critical</span>
              <span className="font-mono font-bold text-rose-700 dark:text-rose-400">
                {criticalAlarmCount} Active
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <div className="text-xs">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Unacknowledged</span>
              <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                {unacknowledgedAlarmCount} Total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search alarms by sensor, ID, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 text-slate-900 dark:text-white"
          />
        </div>

        {/* Severity filter tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
          {(['all', 'critical', 'warning', 'info'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-md font-medium capitalize transition-colors ${
                severityFilter === sev
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Status filter dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-600 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="unacknowledged">Unacknowledged</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={acknowledgeAllAlarms}
            disabled={unacknowledgedAlarmCount === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Acknowledge All</span>
          </button>

          <button
            onClick={clearResolvedAlarms}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Resolved</span>
          </button>
        </div>
      </div>

      {/* Alarms Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-3">Alarm ID</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Sensor / Subsystem</th>
                <th className="py-3 px-3 text-right">Reading vs Limit</th>
                <th className="py-3 px-4">Description & Suggested Action</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {filteredAlarms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                    No active alarms matching current filters. All systems nominal.
                  </td>
                </tr>
              ) : (
                filteredAlarms.map((alm) => {
                  const isCrit = alm.severity === 'critical';
                  const isWarn = alm.severity === 'warning';

                  return (
                    <tr
                      key={alm.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                        !alm.acknowledged
                          ? isCrit
                            ? 'bg-rose-50/20 dark:bg-rose-950/20'
                            : 'bg-amber-50/20 dark:bg-amber-950/20'
                          : ''
                      }`}
                    >
                      {/* Severity Badge */}
                      <td className="py-3 px-4 font-sans">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isCrit
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : isWarn
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                          }`}
                        >
                          {isCrit && <AlertOctagon className="w-3 h-3" />}
                          {isWarn && <AlertTriangle className="w-3 h-3" />}
                          {alm.severity}
                        </span>
                      </td>

                      {/* Alarm ID */}
                      <td className="py-3 px-3 text-slate-500 font-medium">{alm.id}</td>

                      {/* Timestamp */}
                      <td className="py-3 px-3 text-slate-500">{alm.timestamp}</td>

                      {/* Sensor / Subsystem */}
                      <td className="py-3 px-3 font-sans">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {alm.sensor}
                        </div>
                        <div className="text-[10px] text-slate-400">{alm.subsystem}</div>
                      </td>

                      {/* Reading vs Limit */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-bold text-slate-900 dark:text-white tabular-nums">
                          {alm.measuredValue} {alm.unit}
                        </div>
                        <div className="text-[10px] text-slate-400">Limit: {alm.threshold}</div>
                      </td>

                      {/* Description & Action */}
                      <td className="py-3 px-4 font-sans max-w-xs">
                        <div className="text-slate-800 dark:text-slate-200 text-xs">
                          {alm.description}
                        </div>
                        <div className="text-[11px] text-teal-700 dark:text-teal-400 mt-0.5 line-clamp-1">
                          ↳ {alm.suggestedAction}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center font-sans">
                        {alm.resolved ? (
                          <span className="text-slate-400 text-[11px]">Resolved</span>
                        ) : alm.acknowledged ? (
                          <span className="text-teal-700 dark:text-teal-400 text-[11px] font-medium">
                            Acknowledged
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 text-[11px] font-bold animate-pulse">
                            ACTIVE UNACK
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          {!alm.acknowledged && (
                            <button
                              onClick={() => acknowledgeAlarm(alm.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded transition-colors"
                            >
                              Acknowledge
                            </button>
                          )}
                          {alm.acknowledged && !alm.resolved && (
                            <button
                              onClick={() => resolveAlarm(alm.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ISA 18.2 Rationalization & Debouncing Note */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Alarm Management Concepts — IEC 62682 / ISA-18.2 References:
          </span>{' '}
          Educational exploration of alarm-management concepts; formal compliance and certification are not claimed. Alarms employ simulated 15-second deadband hysteresis and de-duplication to illustrate industrial alarm ergonomics and nuisance alarm suppression.
        </div>
      </div>
    </div>
  );
};
