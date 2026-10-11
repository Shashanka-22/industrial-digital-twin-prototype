import React from 'react';
import { ShieldCheck, ShieldAlert, AlertOctagon } from 'lucide-react';

interface HealthGaugeProps {
  healthPct: number;
  anomalyScore: number;
  rulHours: number;
  vibrationRms: number;
}

export const HealthGauge: React.FC<HealthGaugeProps> = ({
  healthPct,
  anomalyScore,
  rulHours,
  vibrationRms,
}) => {
  // ISO 10816-3 Zone Determination for 45kW rigid foundation motor
  const getIsoZone = () => {
    if (vibrationRms < 1.4) return { zone: 'Zone A', label: 'Good (New Equipment)', color: 'text-emerald-600' };
    if (vibrationRms < 2.8) return { zone: 'Zone B', label: 'Unrestricted Operation', color: 'text-teal-600' };
    if (vibrationRms < 4.5) return { zone: 'Zone C', label: 'Restricted Long-Term', color: 'text-amber-600' };
    return { zone: 'Zone D', label: 'Critical Damage Risk', color: 'text-rose-600' };
  };

  const iso = getIsoZone();

  // SVG Gauge calculations (semi-circle arc)
  const radius = 70;
  const circumference = Math.PI * radius; // 180 degrees
  const strokeDashoffset = circumference - (healthPct / 100) * circumference;

  const getGaugeColor = () => {
    if (healthPct >= 80) return '#10B981'; // emerald
    if (healthPct >= 60) return '#F59E0B'; // amber
    return '#EF4444'; // rose
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            Asset Health & Degradation Index
          </h4>
          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            Vibration Reference: ISO 10816-3
          </span>
        </div>

        {/* Gauge Arc Center */}
        <div className="relative flex flex-col items-center justify-center my-4">
          <svg width="180" height="105" viewBox="0 0 180 105" className="overflow-visible">
            {/* Background Track Arc */}
            <path
              d="M 20 95 A 70 70 0 0 1 160 95"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="14"
              strokeLinecap="round"
              className="dark:stroke-slate-800"
            />
            {/* Active Health Arc */}
            <path
              d="M 20 95 A 70 70 0 0 1 160 95"
              fill="none"
              stroke={getGaugeColor()}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Centered Readout */}
          <div className="absolute bottom-1 flex flex-col items-center">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
              {healthPct}%
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Composite Health
            </span>
          </div>
        </div>

        {/* ISO Classification Badge */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <div className="text-xs font-semibold">
            <span className={iso.color}>{iso.zone}</span> ·{' '}
            <span className="text-slate-700 dark:text-slate-300">{iso.label}</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            Vibration Severity RMS: {vibrationRms.toFixed(2)} mm/s
          </p>
        </div>
      </div>

      {/* RUL & Anomaly Score footer metrics */}
      <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-medium">Anomaly Score</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            {anomalyScore.toFixed(3)}{' '}
            <span className="text-[10px] font-normal text-slate-500">/ 1.0</span>
          </span>
        </div>

        <div className="text-right">
          <span className="text-slate-400 block text-[10px] uppercase font-medium">Estimated RUL</span>
          <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
            {rulHours.toLocaleString()}{' '}
            <span className="text-[10px] font-normal text-slate-500">hours</span>
          </span>
        </div>
      </div>

      {/* Illustrative Simulation Estimates Explanation */}
      <div className="mt-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
        <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
          Illustrative Simulation Estimates
        </span>
        Health, anomaly, and Remaining Useful Life values are generated from the prototype&apos;s simulation logic. They are not validated predictions of actual industrial motor life.
      </div>
    </div>
  );
};
