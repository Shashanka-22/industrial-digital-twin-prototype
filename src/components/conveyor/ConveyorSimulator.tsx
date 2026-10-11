import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  AlertOctagon,
  RotateCcw,
  Package,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

type ConveyorState = 'Stopped' | 'Starting' | 'Running' | 'Paused' | 'Fault' | 'Emergency Stop';

interface ConveyorPackage {
  id: number;
  xPercent: number; // 0 to 100 along belt
  weightKg: number;
  type: 'standard' | 'priority';
  diverted: boolean;
}

interface ConveyorEventLog {
  timestamp: string;
  level: 'info' | 'warning' | 'fault';
  message: string;
}

export const ConveyorSimulator: React.FC = () => {
  const [state, setState] = useState<ConveyorState>('Stopped');
  const [packages, setPackages] = useState<ConveyorPackage[]>([
    { id: 1, xPercent: 18, weightKg: 12.4, type: 'standard', diverted: false },
    { id: 2, xPercent: 55, weightKg: 8.1, type: 'priority', diverted: false },
  ]);
  const [nextPackageId, setNextPackageId] = useState<number>(3);
  const [conveyorSpeed, setConveyorSpeed] = useState<number>(1); // 1 = 1x
  const [totalProcessed, setTotalProcessed] = useState<number>(24);
  const [totalDiverted, setTotalDiverted] = useState<number>(6);

  // PLC Digital I/O Bits
  const [i0_0_partPresent, setI0_0_partPresent] = useState<boolean>(false);
  const [i0_1_estop, setI0_1_estop] = useState<boolean>(true); // NC healthy = TRUE
  const [i0_2_start, setI0_2_start] = useState<boolean>(false);
  const [i0_3_stop, setI0_3_stop] = useState<boolean>(true); // NC normal = TRUE
  const [q0_0_motorRun, setQ0_0_motorRun] = useState<boolean>(false);
  const [q0_1_diverter, setQ0_1_diverter] = useState<boolean>(false);

  const [eventLogs, setEventLogs] = useState<ConveyorEventLog[]>([
    {
      timestamp: '09:14:02',
      level: 'info',
      message: '[INFO] Local PLC behavior simulator synchronized with conveyor kinematics model.',
    },
    {
      timestamp: '09:14:05',
      level: 'info',
      message: 'Simulated safety circuit armed: %I0.1 E-Stop healthy (24V DC True).',
    },
  ]);

  const addLog = (level: 'info' | 'warning' | 'fault', message: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setEventLogs((prev) => [{ timestamp: time, level, message }, ...prev.slice(0, 39)]);
  };

  // Motor running control based on state
  useEffect(() => {
    if (state === 'Running') {
      setQ0_0_motorRun(true);
    } else {
      setQ0_0_motorRun(false);
    }
  }, [state]);

  // Main conveyor kinematic step loop
  useEffect(() => {
    if (state !== 'Running') return;

    const interval = setInterval(() => {
      setPackages((prevList) => {
        let isSensorTripped = false;
        let shouldDivert = false;

        const updated = prevList
          .map((pkg) => {
            const nextX = pkg.xPercent + 1.2 * conveyorSpeed;

            // Optical sensor beam at x = 50%
            if (nextX >= 47 && nextX <= 53) {
              isSensorTripped = true;
              if (pkg.type === 'priority') {
                shouldDivert = true;
              }
            }

            return {
              ...pkg,
              xPercent: nextX,
            };
          })
          .filter((pkg) => {
            if (pkg.xPercent >= 100) {
              setTotalProcessed((c) => c + 1);
              return false;
            }
            return true;
          });

        setI0_0_partPresent(isSensorTripped);
        setQ0_1_diverter(shouldDivert);

        // Spawn new package periodically if list is small
        if (updated.length < 3 && Math.random() < 0.25) {
          const isPri = Math.random() > 0.65;
          setNextPackageId((id) => {
            updated.push({
              id,
              xPercent: 0,
              weightKg: Number((5 + Math.random() * 20).toFixed(1)),
              type: isPri ? 'priority' : 'standard',
              diverted: false,
            });
            return id + 1;
          });
        }

        return updated;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [state, conveyorSpeed]);

  // Virtual PLC State Actions
  const handleStart = () => {
    if (!i0_1_estop) {
      addLog('fault', 'PLC Interlock: Cannot start conveyor while E-Stop circuit is open!');
      return;
    }
    setI0_2_start(true);
    setTimeout(() => setI0_2_start(false), 300);

    setState('Starting');
    addLog('info', 'PLC Command: Q0.0 (Conveyor_Run) energized. Soft-start ramping motor.');
    setTimeout(() => {
      setState('Running');
      addLog('info', 'Motor reached synchronous speed (1480 RPM). Conveyor running.');
    }, 600);
  };

  const handleStop = () => {
    setI0_3_stop(false);
    setTimeout(() => setI0_3_stop(true), 300);
    setState('Stopped');
    setQ0_0_motorRun(false);
    setQ0_1_diverter(false);
    addLog('info', 'Normal stop executed. Motor coasting down.');
  };

  const handleEmergencyStop = () => {
    setI0_1_estop(false);
    setState('Emergency Stop');
    setQ0_0_motorRun(false);
    setQ0_1_diverter(false);
    addLog('fault', 'EMERGENCY STOP TRIPPED (I0.1 Opened). Safe Torque Off (STO) engaged.');
  };

  const handleResetEstop = () => {
    setI0_1_estop(true);
    setState('Stopped');
    addLog('info', 'E-Stop pushbutton released. Safety circuit armed. Ready to restart.');
  };

  const handleInjectJamFault = () => {
    setState('Fault');
    setQ0_0_motorRun(false);
    addLog('fault', 'Mechanical Jam detected: Motor thermal overload protection tripped (F0001).');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-5">
      {/* Header & State Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              Virtual Commissioning Conveyor Simulator
            </h3>
            <span className="text-[11px] font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
              Local PLC Behavior Simulator
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            SIMULATION MODE: Local PLC behavior simulator linking kinematic conveyor physics to emulated logic. No physical PLC or live S7-PLCSIM instance is connected in this deployment.
          </p>
        </div>

        {/* State Machine Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">PLC State:</span>
          <span
            className={`text-xs font-bold font-mono px-3 py-1 rounded-md border ${
              state === 'Running'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                : state === 'Starting'
                ? 'bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300'
                : state === 'Emergency Stop' || state === 'Fault'
                ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse'
                : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {state.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Main Visual Conveyor Graphic Canvas */}
      <div className="relative w-full h-48 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 p-4 flex flex-col justify-between">
        {/* Top Info Strip */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 z-10">
          <div className="flex items-center gap-3">
            <span>MOTOR: {q0_0_motorRun ? 'RUNNING (45 kW)' : 'STANDSTILL'}</span>
            <span>SPEED: {q0_0_motorRun ? `${(conveyorSpeed * 0.45).toFixed(2)} m/s` : '0.00 m/s'}</span>
          </div>
          <div>PROCESSED: {totalProcessed} UNITS</div>
        </div>

        {/* Conveyor Belt & Rollers */}
        <div className="relative h-24 my-auto flex items-center">
          {/* Conveyor Bed */}
          <div className="absolute inset-x-8 h-10 bg-slate-800 rounded-md border border-slate-700 overflow-hidden shadow-inner">
            {/* Animated belt stripes if running */}
            <div
              className={`w-[200%] h-full flex ${
                q0_0_motorRun ? 'animate-slide' : ''
              }`}
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, #1E293B 0px, #1E293B 20px, #334155 20px, #334155 40px)',
              }}
            />
          </div>

          {/* Left Driving Pulley */}
          <div className="absolute left-4 w-12 h-12 rounded-full bg-slate-700 border-2 border-slate-500 flex items-center justify-center shadow-md">
            <div
              className={`w-4 h-4 rounded-full border border-slate-400 ${
                q0_0_motorRun ? 'animate-spin' : ''
              }`}
            />
          </div>

          {/* Right Tension Pulley */}
          <div className="absolute right-4 w-12 h-12 rounded-full bg-slate-700 border-2 border-slate-500 flex items-center justify-center shadow-md">
            <div
              className={`w-4 h-4 rounded-full border border-slate-400 ${
                q0_0_motorRun ? 'animate-spin' : ''
              }`}
            />
          </div>

          {/* Optical Photocell Beam Sensor at 50% (x = 50%) */}
          <div className="absolute left-1/2 -top-3 bottom-0 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10">
            <div className="w-3 h-4 bg-amber-500 rounded-xs border border-amber-300 shadow-xs" />
            <div
              className={`w-0.5 h-full transition-colors ${
                i0_0_partPresent ? 'bg-rose-500 shadow-md shadow-rose-500' : 'bg-red-400/40'
              }`}
            />
            <span className="text-[9px] font-mono text-amber-400 mt-1 whitespace-nowrap">
              PE_01 (I0.0)
            </span>
          </div>

          {/* Sorter Diverter Gate at 75% */}
          <div
            className={`absolute left-3/4 -top-2 w-2 h-14 rounded-xs transition-transform duration-200 z-10 ${
              q0_1_diverter ? 'bg-teal-400 shadow-md rotate-45' : 'bg-slate-600'
            }`}
          />

          {/* Moving Packages */}
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="absolute -top-1 transition-all duration-100 flex flex-col items-center z-20"
              style={{ left: `calc(32px + (100% - 96px) * ${pkg.xPercent / 100})` }}
            >
              <div
                className={`w-9 h-9 rounded-md border flex flex-col items-center justify-center shadow-lg text-[10px] font-bold ${
                  pkg.type === 'priority'
                    ? 'bg-amber-600 border-amber-300 text-white'
                    : 'bg-teal-700 border-teal-400 text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                <span className="text-[8px] font-mono leading-none">{pkg.weightKg}k</span>
              </div>
            </div>
          ))}
        </div>

        {/* Legend strip */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 z-10">
          <span>ZONE 1: INFEED</span>
          <span className="text-amber-400">ZONE 2: INSPECTION (I0.0)</span>
          <span className="text-teal-400">ZONE 3: SORT / DIVERTER (Q0.1)</span>
          <span>ZONE 4: DISCHARGE</span>
        </div>
      </div>

      {/* Operator Control Panel & Emergency Stop Pushbuttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pushbuttons */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            Operator Pushbutton Station
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Start Button */}
            <button
              onClick={handleStart}
              disabled={state === 'Running' || !i0_1_estop}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-xs transition-colors"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START (I0.2)</span>
            </button>

            {/* Stop Button */}
            <button
              onClick={handleStop}
              disabled={state === 'Stopped' || state === 'Emergency Stop'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 text-white transition-colors"
            >
              <Square className="w-4 h-4" />
              <span>STOP (I0.3)</span>
            </button>

            {/* Emergency Stop Industrial E-Stop Button */}
            {i0_1_estop ? (
              <button
                onClick={handleEmergencyStop}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md ring-2 ring-rose-500/30 transition-transform active:scale-95"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>E-STOP (I0.1)</span>
              </button>
            ) : (
              <button
                onClick={handleResetEstop}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESET E-STOP</span>
              </button>
            )}

            {/* Jam Fault Button */}
            <button
              onClick={handleInjectJamFault}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
            >
              <span>Simulate Jam</span>
            </button>
          </div>
        </div>

        {/* Live PLC Digital I/O Status Table */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            SIMATIC S7-1500 Digital Tags (TIA Portal)
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {/* Inputs */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-slate-400 uppercase font-sans font-medium">Digital Inputs (%I)</div>
              
              <div className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                <span>%I0.0 Part_Present</span>
                <span className={`w-2.5 h-2.5 rounded-full ${i0_0_partPresent ? 'bg-emerald-500 shadow-xs' : 'bg-slate-300 dark:bg-slate-700'}`} />
              </div>

              <div className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                <span>%I0.1 E_Stop_OK</span>
                <span className={`w-2.5 h-2.5 rounded-full ${i0_1_estop ? 'bg-emerald-500 shadow-xs' : 'bg-rose-500'}`} />
              </div>

              <div className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                <span>%I0.2 Start_PB</span>
                <span className={`w-2.5 h-2.5 rounded-full ${i0_2_start ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
              </div>
            </div>

            {/* Outputs */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-slate-400 uppercase font-sans font-medium">Digital Outputs (%Q)</div>

              <div className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                <span>%Q0.0 Motor_Run</span>
                <span className={`w-2.5 h-2.5 rounded-full ${q0_0_motorRun ? 'bg-emerald-500 shadow-xs' : 'bg-slate-300 dark:bg-slate-700'}`} />
              </div>

              <div className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                <span>%Q0.1 Diverter_Act</span>
                <span className={`w-2.5 h-2.5 rounded-full ${q0_1_diverter ? 'bg-teal-400 shadow-xs' : 'bg-slate-300 dark:bg-slate-700'}`} />
              </div>

              <div className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                <span>%Q0.2 Stack_Light_Grn</span>
                <span className={`w-2.5 h-2.5 rounded-full ${state === 'Running' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Virtual PLC Event Log */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-xs font-mono space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
          <span>LOCAL PLC BEHAVIOR SIMULATOR LOGS (EMULATED S7-1500 TAGS)</span>
          <span className="text-teal-400">CYCLIC TIME: 100ms</span>
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
          {eventLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 text-[11px]">
              <span className="text-slate-500">{log.timestamp}</span>
              <span
                className={`font-semibold ${
                  log.level === 'fault'
                    ? 'text-rose-400'
                    : log.level === 'warning'
                    ? 'text-amber-400'
                    : 'text-teal-400'
                }`}
              >
                [{log.level.toUpperCase()}]
              </span>
              <span className="text-slate-300">{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Engineering Safety Boundary:</span> This virtual commissioning environment simulates S7-1500 tag behavior for design verification. In physical machinery, ISO 13849-1 / IEC 62061 functional safety regulations mandate TÜV-certified safety controllers (S7-1500F) and hardwired emergency-stop circuits.
        </div>
      </div>
    </div>
  );
};
