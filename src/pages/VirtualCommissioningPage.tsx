import React from 'react';
import { ConveyorSimulator } from '../components/conveyor/ConveyorSimulator';
import { RotateCw, CheckCircle2, ShieldCheck, Box, Workflow, Layers } from 'lucide-react';

export const VirtualCommissioningPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Virtual Commissioning & Mechatronic Simulation
            </h2>
            <span className="text-xs font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
              Local PLC Behavior Simulator
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            No physical PLC or live S7-PLCSIM instance is connected in this deployment. Demonstrates simulated ladder logic, conveyor kinematics, and safety interlocking.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px]">Execution Mode</span>
            <span className="font-bold text-teal-600 dark:text-teal-400">Local Simulation Engine</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Conveyor Simulator */}
      <ConveyorSimulator />

      {/* Educational Engineering Context: The 3 Digital Twin Dimensions */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-white text-base">
          The Three Dimensions of Industrial Digital Twins
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-teal-600" />
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                1. Digital Twin of Product
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Product CAD/CAE modeling. Models the mechanical geometry, material stress FEA, thermal dissipation, and electrical magnetic flux of the motor before manufacturing begins.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-teal-600" />
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                2. Digital Twin of Production
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Virtual commissioning of automation logic. Simulates manufacturing kinematics, conveyor robotics, cycle times, and PLC safety logic to validate controls without risking physical machine collisions.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                3. Digital Twin of Performance
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Operational condition monitoring concept. In production plants, ingests operational telemetry from field sensors (modeled synthetically in this prototype) to calculate degradation, anomalies, and RUL, closing the loop back to product design engineers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
