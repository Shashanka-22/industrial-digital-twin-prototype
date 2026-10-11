import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { FaultScenario } from '../../types/telemetry';
import {
  ShieldCheck,
  AlertTriangle,
  Flame,
  Zap,
  Activity,
  Radio,
  WifiOff,
  Skull,
  RotateCcw,
  Info,
} from 'lucide-react';

interface ScenarioConfig {
  id: FaultScenario;
  title: string;
  description: string;
  severity: 'nominal' | 'warning' | 'critical';
  icon: React.ElementType;
  expectedSymptom: string;
}

export const FaultInjectionPanel: React.FC = () => {
  const { faultScenario, setFaultScenario, resetSimulation } = useSimulation();

  const scenarios: ScenarioConfig[] = [
    {
      id: 'normal',
      title: 'Nominal Baseline',
      description: 'Ideal steady-state operation within standard engineering tolerances.',
      severity: 'nominal',
      icon: ShieldCheck,
      expectedSymptom: '1480 RPM · 52°C · 1.1 mm/s · 62A · Anomaly < 0.05',
    },
    {
      id: 'bearing_degradation',
      title: 'Bearing Outer Race Wear',
      description: 'Progressive rolling-element fatigue (BPFO harmonics) on Drive-End bearing.',
      severity: 'warning',
      icon: AlertTriangle,
      expectedSymptom: 'Vibration spikes > 4.5 mm/s RMS (ISO Zone D), localized heat rise.',
    },
    {
      id: 'motor_overheating',
      title: 'Thermal Insulation Runaway',
      description: 'Air cowl blockage or high ambient temperature elevating stator thermals.',
      severity: 'critical',
      icon: Flame,
      expectedSymptom: 'Stator temperature rises toward 95°C-105°C (Class F limit).',
    },
    {
      id: 'excessive_current',
      title: 'Hydraulic Overload & Clog',
      description: 'Pump impeller resistance or high fluid viscosity driving motor into overload.',
      severity: 'critical',
      icon: Zap,
      expectedSymptom: 'Phase current surges to 95A+ (FLA: 81.5A), torque surges to 500+ Nm.',
    },
    {
      id: 'speed_deviation',
      title: 'VFD Slip Instability',
      description: 'Rotor bar resistance anomaly or inverter hunting causing slip deviation.',
      severity: 'warning',
      icon: Activity,
      expectedSymptom: 'Shaft speed drops or oscillates between 1350 - 1420 RPM.',
    },
    {
      id: 'sensor_noise',
      title: 'Sensor EMI Noise',
      description: 'Loose shielding or 50Hz ground loop noise on 4-20mA transducer loops.',
      severity: 'warning',
      icon: Radio,
      expectedSymptom: 'Erratic signal spikes without genuine mechanical distress.',
    },
    {
      id: 'comm_interruption',
      title: 'OPC UA Network Loss',
      description: 'Fieldbus packet drop / gateway disconnection freezing live telemetry.',
      severity: 'critical',
      icon: WifiOff,
      expectedSymptom: 'Data marked STALE, timestamp frozen, stale age timer ticks up.',
    },
    {
      id: 'combined_fault',
      title: 'Compound Cascading Failure',
      description: 'Severe bearing seizure propagating into thermal runaway and motor stall.',
      severity: 'critical',
      icon: Skull,
      expectedSymptom: 'Vibration > 7.0 mm/s, Temp > 100°C, Overcurrent > 105A, Trip alarm.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              Fault Injection & Anomaly Testing Engine
            </h3>
            <span className="text-[11px] font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
              Interactive Test Bench
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Inject realistic industrial degradation vectors to validate edge detection, ISO alarms, and RUL curves.
          </p>
        </div>

        <button
          onClick={resetSimulation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
          Reset to Nominal Baseline
        </button>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isActive = faultScenario === sc.id;

          let badgeBorder = 'border-slate-200 dark:border-slate-800';
          let badgeBg = 'bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700';

          if (isActive) {
            if (sc.severity === 'critical') {
              badgeBorder = 'border-rose-500 ring-2 ring-rose-500/20';
              badgeBg = 'bg-rose-50/50 dark:bg-rose-950/30';
            } else if (sc.severity === 'warning') {
              badgeBorder = 'border-amber-500 ring-2 ring-amber-500/20';
              badgeBg = 'bg-amber-50/50 dark:bg-amber-950/30';
            } else {
              badgeBorder = 'border-teal-600 ring-2 ring-teal-600/20';
              badgeBg = 'bg-teal-50/50 dark:bg-teal-950/30';
            }
          }

          return (
            <button
              key={sc.id}
              onClick={() => setFaultScenario(sc.id)}
              className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between gap-2 ${badgeBorder} ${badgeBg}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded ${
                        sc.severity === 'critical'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400'
                          : sc.severity === 'warning'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400'
                          : 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      {sc.title}
                    </span>
                  </div>

                  {isActive && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                      ACTIVE
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                  {sc.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                {sc.expectedSymptom}
              </div>
            </button>
          );
        })}
      </div>

      {/* Safety Notice */}
      <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Engineering Simulation Boundary:
          </span>{' '}
          Faults are generated through continuous mathematical state models inside the telemetry loop.
          No destructive physical signals are dispatched to live field equipment or real PLC hardware.
        </div>
      </div>
    </div>
  );
};
