import React from 'react';
import { InteractiveMotorTwin } from '../components/twin/InteractiveMotorTwin';
import { PhysicalVsDigitalTable } from '../components/twin/PhysicalVsDigitalTable';
import { FaultInjectionPanel } from '../components/telemetry/FaultInjectionPanel';
import { useSimulation } from '../context/SimulationContext';
import { Activity, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';

export const DigitalTwinPage: React.FC = () => {
  const { currentTelemetry, digitalModelRef, assetMetadata } = useSimulation();

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Live Digital Twin Workspace
            </h2>
            <span className="text-xs font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
              SIMULATION MODE — NO LIVE HARDWARE DATA
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulated sensor telemetry mapped onto geometric CAD schematic and thermodynamic twin model for residual verification.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px]">Model Execution</span>
            <span className="font-bold text-slate-900 dark:text-white">Runge-Kutta 4 (RK4)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px]">Residual Threshold</span>
            <span className="font-bold text-teal-600 dark:text-teal-400">&lt; 5.0% Normal</span>
          </div>
        </div>
      </div>

      {/* Main Interactive CAD / Motor Twin Schematic */}
      <InteractiveMotorTwin />

      {/* Side-by-side Synchronization Table */}
      <PhysicalVsDigitalTable />

      {/* Quick Fault Injection Bar */}
      <FaultInjectionPanel />
    </div>
  );
};
