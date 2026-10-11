import React from 'react';
import { ArchitectureFlow } from '../components/architecture/ArchitectureFlow';

export const ArchitecturePage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Title & Status */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Industrial Automation & Digital Twin Architecture
            </h2>
            <span className="text-xs font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
              Purdue Model / ISA-95 Mapping
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            End-to-end industrial data architecture from transducer physics through PROFINET, PLC control, Industrial Edge, and Cloud IoT analytics.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-600 dark:text-slate-300">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px]">Cybersecurity</span>
            <span className="font-bold text-slate-900 dark:text-white">IEC 62443 Security-Level 3 Reference Architecture</span>
          </div>
        </div>
      </div>

      {/* Main Architecture Diagram Component */}
      <ArchitectureFlow />
    </div>
  );
};
