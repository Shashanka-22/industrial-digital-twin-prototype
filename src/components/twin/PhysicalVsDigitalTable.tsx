import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

interface ComparisonRow {
  parameter: string;
  tag: string;
  unit: string;
  physical: number;
  digital: number;
  absDelta: number;
  relDeltaPct: number;
  status: 'Synchronized' | 'Minor deviation' | 'Calibration required' | 'Data unavailable';
  precision: number;
}

export const PhysicalVsDigitalTable: React.FC = () => {
  const { currentTelemetry, digitalModelRef, isConnected } = useSimulation();

  const getStatus = (
    relDeltaPct: number
  ): 'Synchronized' | 'Minor deviation' | 'Calibration required' | 'Data unavailable' => {
    if (!isConnected || currentTelemetry.isStale) return 'Data unavailable';
    if (relDeltaPct <= 3.0) return 'Synchronized';
    if (relDeltaPct <= 10.0) return 'Minor deviation';
    return 'Calibration required';
  };

  const rows: ComparisonRow[] = [
    {
      parameter: 'Rotational Shaft Speed',
      tag: 'SPEED_RPM',
      unit: 'RPM',
      physical: currentTelemetry.speedRpm,
      digital: digitalModelRef.speedRpm,
      absDelta: Math.abs(currentTelemetry.speedRpm - digitalModelRef.speedRpm),
      relDeltaPct: (Math.abs(currentTelemetry.speedRpm - digitalModelRef.speedRpm) / digitalModelRef.speedRpm) * 100,
      status: 'Synchronized',
      precision: 1,
    },
    {
      parameter: 'Stator Winding Temperature',
      tag: 'STATOR_TEMP_C',
      unit: '°C',
      physical: currentTelemetry.statorTempC,
      digital: digitalModelRef.statorTempC,
      absDelta: Math.abs(currentTelemetry.statorTempC - digitalModelRef.statorTempC),
      relDeltaPct: (Math.abs(currentTelemetry.statorTempC - digitalModelRef.statorTempC) / digitalModelRef.statorTempC) * 100,
      status: 'Synchronized',
      precision: 1,
    },
    {
      parameter: 'Drive-End Bearing Vibration',
      tag: 'DE_VIB_RMS',
      unit: 'mm/s RMS',
      physical: currentTelemetry.bearingVibrationRms,
      digital: digitalModelRef.bearingVibrationRms,
      absDelta: Math.abs(currentTelemetry.bearingVibrationRms - digitalModelRef.bearingVibrationRms),
      relDeltaPct: (Math.abs(currentTelemetry.bearingVibrationRms - digitalModelRef.bearingVibrationRms) / digitalModelRef.bearingVibrationRms) * 100,
      status: 'Synchronized',
      precision: 2,
    },
    {
      parameter: 'Phase U RMS Current',
      tag: 'PHASE_CURRENT_A',
      unit: 'A',
      physical: currentTelemetry.phaseCurrentA,
      digital: digitalModelRef.phaseCurrentA,
      absDelta: Math.abs(currentTelemetry.phaseCurrentA - digitalModelRef.phaseCurrentA),
      relDeltaPct: (Math.abs(currentTelemetry.phaseCurrentA - digitalModelRef.phaseCurrentA) / digitalModelRef.phaseCurrentA) * 100,
      status: 'Synchronized',
      precision: 1,
    },
    {
      parameter: 'Mechanical Shaft Torque',
      tag: 'TORQUE_NM',
      unit: 'Nm',
      physical: currentTelemetry.torqueNm,
      digital: digitalModelRef.torqueNm,
      absDelta: Math.abs(currentTelemetry.torqueNm - digitalModelRef.torqueNm),
      relDeltaPct: (Math.abs(currentTelemetry.torqueNm - digitalModelRef.torqueNm) / digitalModelRef.torqueNm) * 100,
      status: 'Synchronized',
      precision: 1,
    },
    {
      parameter: 'Operating Mechanical Power',
      tag: 'POWER_MECH_KW',
      unit: 'kW',
      physical: currentTelemetry.powerKw,
      digital: digitalModelRef.actualPowerKw,
      absDelta: Math.abs(currentTelemetry.powerKw - digitalModelRef.actualPowerKw),
      relDeltaPct: (Math.abs(currentTelemetry.powerKw - digitalModelRef.actualPowerKw) / digitalModelRef.actualPowerKw) * 100,
      status: 'Synchronized',
      precision: 1,
    },
  ].map((item) => ({
    ...item,
    status: getStatus(item.relDeltaPct),
  }));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-base">
            Simulated Sensor Telemetry vs. Calibrated Digital Model
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Internal model-consistency check comparing simulated field sensor values against the ideal physics reference model. (Both generated in local simulation engine).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded">
            SIMULATION MODE — NO LIVE HARDWARE DATA · Model Consistency Check
          </span>
        </div>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-3">Parameter & Tag</th>
              <th className="py-2.5 px-3 text-right">Simulated Sensor</th>
              <th className="py-2.5 px-3 text-right">Digital Model Ref</th>
              <th className="py-2.5 px-3 text-right">Abs Deviation</th>
              <th className="py-2.5 px-3 text-right">Rel Deviation (%)</th>
              <th className="py-2.5 px-3 text-center">Consistency Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
            {rows.map((row) => (
              <tr
                key={row.tag}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-3 px-3 font-sans">
                  <div className="font-medium text-slate-900 dark:text-white">{row.parameter}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{row.tag}</div>
                </td>

                <td className="py-3 px-3 text-right tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                  {row.physical.toFixed(row.precision)} {row.unit}
                </td>

                <td className="py-3 px-3 text-right tabular-nums text-slate-500 dark:text-slate-400">
                  {row.digital.toFixed(row.precision)} {row.unit}
                </td>

                <td className="py-3 px-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                  {row.absDelta > 0.01 ? (
                    <span>+{row.absDelta.toFixed(row.precision)}</span>
                  ) : (
                    <span className="text-slate-400">0.0</span>
                  )}{' '}
                  {row.unit}
                </td>

                <td className="py-3 px-3 text-right tabular-nums">
                  <span
                    className={
                      row.relDeltaPct > 15
                        ? 'text-rose-600 dark:text-rose-400 font-bold'
                        : row.relDeltaPct > 5
                        ? 'text-amber-600 dark:text-amber-400 font-semibold'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }
                  >
                    {row.relDeltaPct.toFixed(1)}%
                  </span>
                </td>

                <td className="py-3 px-3 text-center font-sans">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium">
                    {row.status === 'Synchronized' && (
                      <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Synchronized
                      </span>
                    )}
                    {row.status === 'Minor deviation' && (
                      <span className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                        <AlertTriangle className="w-3 h-3 text-amber-500" /> Minor Deviation
                      </span>
                    )}
                    {row.status === 'Calibration required' && (
                      <span className="text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full flex items-center gap-1 border border-rose-200 dark:border-rose-800">
                        <AlertOctagon className="w-3 h-3 text-rose-500" /> Anomaly Alert
                      </span>
                    )}
                    {row.status === 'Data unavailable' && (
                      <span className="text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-slate-400" /> Stale / Offline
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Industrial pipeline flow banner */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700 dark:text-slate-300">Synchronization Pipeline:</span>
          <span className="font-mono text-[11px] text-teal-700 dark:text-teal-400">
            Simulated Transducers → S7-1500 (ET 200SP) → Virtual OPC UA Interface → Edge Analytics Container → Cloud Twin
          </span>
        </div>
        <span className="text-[11px] italic">
          *Residual threshold for model re-calibration: Δ &gt; 12.0%
        </span>
      </div>
    </div>
  );
};
