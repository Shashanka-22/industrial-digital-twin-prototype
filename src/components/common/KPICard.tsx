import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  subValue?: string;
  icon: LucideIcon;
  status: 'nominal' | 'warning' | 'critical' | 'neutral';
  thresholdNote?: string;
  delta?: {
    value: string;
    isPositiveGood: boolean;
    isIncrease: boolean;
  };
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  subValue,
  icon: Icon,
  status,
  thresholdNote,
  delta,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'critical':
        return 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400';
      case 'warning':
        return 'border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400';
      case 'nominal':
        return 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400';
      default:
        return 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400';
    }
  };

  const getIconBg = () => {
    switch (status) {
      case 'critical':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300';
      case 'warning':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
      case 'nominal':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 shadow-xs flex flex-col justify-between ${getStatusColor()}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-tight">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${getIconBg()}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="my-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight tabular-nums text-slate-900 dark:text-white">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {unit}
            </span>
          )}
        </div>
        {subValue && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            {subValue}
          </p>
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
        {thresholdNote ? (
          <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
            {thresholdNote}
          </span>
        ) : (
          <span className="text-slate-400">Target Nominal</span>
        )}

        {delta && (
          <span
            className={`font-mono font-medium ${
              (delta.isIncrease && delta.isPositiveGood) || (!delta.isIncrease && !delta.isPositiveGood)
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {delta.isIncrease ? '↑' : '↓'} {delta.value}
          </span>
        )}
      </div>
    </div>
  );
};
