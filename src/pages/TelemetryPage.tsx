import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { TelemetryCharts } from '../components/telemetry/TelemetryCharts';
import { SimulationControls } from '../components/telemetry/SimulationControls';
import {
  scaleSiemensAnalogRaw,
  unscaleSiemensAnalog,
  calculateTorque,
} from '../utils/engineeringCalculations';
import { Calculator, Gauge, Cpu, Sliders, ArrowRight } from 'lucide-react';

export const TelemetryPage: React.FC = () => {
  const { currentTelemetry, telemetryHistory, assetMetadata, settings, isConnected } = useSimulation();

  // Interactive Analog Scaling Playground
  const [sliderRawAdc, setSliderRawAdc] = useState<number>(currentTelemetry.rawTempAdc || 9580);
  const scaledTemp = scaleSiemensAnalogRaw(sliderRawAdc, 0, 150);

  // Interactive Torque Calculation Playground (Defaulting to nominal 76% operating condition: 34.2 kW @ 1480 RPM)
  const [calcPower, setCalcPower] = useState<number>(34.2);
  const [calcSpeed, setCalcSpeed] = useState<number>(1480);
  const calculatedTorque = calculateTorque(calcPower, calcSpeed);

  const latestBuffer = telemetryHistory.slice(-10).reverse();

  return (
    <div className="space-y-6">
      {/* Stale Connection Warning Alert Banner if comms interrupted */}
      {(!isConnected || currentTelemetry.isStale) && (
        <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl p-4 flex items-center justify-between gap-4 text-rose-800 dark:text-rose-200 text-xs">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold uppercase tracking-wider">
                Telemetry Link Offline · Preserving Last Received Timestamp
              </span>
              <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                Communication interruption simulated. Read values are marked stale and buffered values are frozen.
              </p>
            </div>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 rounded font-semibold shrink-0">
            READINGS STALE
          </span>
        </div>
      )}

      {/* Page Title & Status */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Motor Telemetry & Signal Acquisition
            </h2>
            <span className="text-xs font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
              SIMULATION ENGINE · {settings.samplingIntervalMs}ms CYCLIC
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Deterministic sensor sampling, analog-to-digital conversion, and engineering unit scaling.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px]">Gateway Interface</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">OPC UA (Prepared)</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px]">Buffer Length</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {telemetryHistory.length} / {settings.historyBufferSize} Samples
            </span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px]">PLC ADC Resolution</span>
            <span className="font-bold text-teal-600 dark:text-teal-400">16-bit (0 - 27648)</span>
          </div>
        </div>
      </div>

      {/* Primary Simulation Controls */}
      <SimulationControls />

      {/* Main Charts */}
      <TelemetryCharts />

      {/* Engineering Tools & Mathematical Calculations Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analog Scaling Panel: PLC RTD Raw to Scaled */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-teal-600" />
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                PLC Analog Input Scaling Reference (SCALE_X)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              Standard: 16-Bit AI Word (0–27648)
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            In industrial PLCs such as SIMATIC S7 controllers, nominal analog inputs convert physical voltages or RTD resistances into a 16-bit signed integer word with standard nominal range <strong className="font-mono text-slate-800 dark:text-slate-200">0 to 27648</strong>. Overrange reaches up to 32511 before wire-break/overflow faults trigger.
          </p>

          <div className="p-3 bg-slate-900 text-teal-300 rounded-lg font-mono text-xs">
            Temp (°C) = (Raw_Word / 27648) × Span_Range (150°C)
          </div>

          {/* Interactive Slider */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Raw Input Word (%IW12):</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {sliderRawAdc} <span className="text-slate-400 text-xs">/ 27648</span>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="27648"
              step="32"
              value={sliderRawAdc}
              onChange={(e) => setSliderRawAdc(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0 (0.0°C)</span>
              <span>13824 (75.0°C)</span>
              <span>27648 (150.0°C)</span>
            </div>
          </div>

          {/* Result Output */}
          <div className="p-3 bg-teal-50 dark:bg-teal-950/60 rounded-lg border border-teal-200 dark:border-teal-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-teal-900 dark:text-teal-200">
              Scaled Engineering Temperature:
            </span>
            <span className="font-mono text-lg font-bold text-teal-800 dark:text-teal-300">
              {scaledTemp.toFixed(1)} °C
            </span>
          </div>
        </div>

        {/* Motor Shaft Torque & Mechanical Power Calculation */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-teal-600" />
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                Mechanical Shaft Torque Calculation
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              ISO / DIN 748
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Mechanical shaft torque represents the rotational shear force transmitted to the pump impeller through the flexible coupling.
          </p>

          <div className="p-3 bg-slate-900 text-teal-300 rounded-lg font-mono text-xs">
            Torque (Nm) = 9550 × P_actual (kW) / N_shaft (RPM)
          </div>

          {/* Quick Engineering Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 font-medium">Presets:</span>
            <button
              type="button"
              onClick={() => { setCalcPower(34.2); setCalcSpeed(1480); }}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100"
            >
              76% Nominal (34.2 kW @ 1480 RPM → 220.7 Nm)
            </button>
            <button
              type="button"
              onClick={() => { setCalcPower(45.0); setCalcSpeed(1475); }}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200"
            >
              100% Rated (45.0 kW @ 1475 RPM → 291.4 Nm)
            </button>
            <button
              type="button"
              onClick={() => { setCalcPower(11.2); setCalcSpeed(1495); }}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200"
            >
              25% Idle (11.2 kW @ 1495 RPM → 71.5 Nm)
            </button>
            <button
              type="button"
              onClick={() => { setCalcPower(48.2); setCalcSpeed(1435); }}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100"
            >
              Overload Fault (48.2 kW @ 1435 RPM → 320.8 Nm)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">
                Actual Mechanical Power (kW):
              </label>
              <input
                type="number"
                min="5"
                max="90"
                step="0.5"
                value={calcPower}
                onChange={(e) => setCalcPower(Number(e.target.value))}
                className="w-full text-xs font-mono p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Rated nameplate: 45.0 kW</span>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">
                Shaft Speed (RPM):
              </label>
              <input
                type="number"
                min="500"
                max="3000"
                step="10"
                value={calcSpeed}
                onChange={(e) => setCalcSpeed(Number(e.target.value))}
                className="w-full text-xs font-mono p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Synchronous: 1500 RPM</span>
            </div>
          </div>

          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Derived Mechanical Shaft Torque:
            </span>
            <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">
              {calculatedTorque} Nm
            </span>
          </div>
        </div>
      </div>

      {/* Live Tabular Rolling Stream Buffer */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
              Simulated Telemetry Ring Buffer (Latest 10 Samples)
            </h3>
            <p className="text-[11px] text-slate-500">
              Simulated sensor measurements and derived mechanical metrics (Torque = 9550 × P_act / N).
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            Node: ns=3;s="DB_Telemetry"
          </span>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3 text-right">Speed (RPM)</th>
                <th className="py-2 px-3 text-right">Actual Power (kW)</th>
                <th className="py-2 px-3 text-right">Torque (Nm)</th>
                <th className="py-2 px-3 text-right">Winding Temp (°C)</th>
                <th className="py-2 px-3 text-right">Vib RMS (mm/s)</th>
                <th className="py-2 px-3 text-right">Current (A)</th>
                <th className="py-2 px-3 text-right">Anomaly</th>
                <th className="py-2 px-3 text-right">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-slate-700 dark:text-slate-300">
              {latestBuffer.map((row, idx) => (
                <tr
                  key={row.epoch + '-' + idx}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                    idx === 0 ? 'bg-teal-50/30 dark:bg-teal-950/20 font-semibold' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 text-slate-500 flex items-center gap-1.5">
                    <span>{row.timestamp}</span>
                    {row.isStale && (
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                        STALE
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{row.speedRpm.toFixed(1)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-teal-700 dark:text-teal-300">
                    {row.powerKw.toFixed(1)} <span className="text-[10px] text-slate-400">({row.loadFactorPct.toFixed(0)}%)</span>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{row.torqueNm.toFixed(1)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-rose-600 dark:text-rose-400">
                    {row.statorTempC.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-teal-600 dark:text-teal-400">
                    {row.bearingVibrationRms.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-amber-600 dark:text-amber-400">
                    {row.phaseCurrentA.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{row.anomalyScore.toFixed(3)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold">
                    {row.assetHealthPct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
