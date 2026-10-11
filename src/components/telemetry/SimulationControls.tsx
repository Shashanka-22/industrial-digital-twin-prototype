import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { OperatingCondition } from '../../types/telemetry';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Download,
  Gauge,
  Activity,
  Zap,
} from 'lucide-react';
import { exportTelemetryToCsv } from '../../utils/engineeringCalculations';

export const SimulationControls: React.FC = () => {
  const {
    isRunning,
    setIsRunning,
    simulationSpeed,
    setSimulationSpeed,
    operatingCondition,
    setOperatingCondition,
    sensorNoiseEnabled,
    setSensorNoiseEnabled,
    resetSimulation,
    telemetryHistory,
    settings,
    updateSettings,
  } = useSimulation();

  const handleExportCsv = () => {
    const exportData = telemetryHistory.map((t) => ({
      Timestamp: t.timestamp,
      Shaft_Speed_RPM: t.speedRpm,
      Operating_Mechanical_Power_kW: t.powerKw,
      Rated_Motor_Power_kW: 45.0,
      Load_Factor_Pct: t.loadFactorPct,
      Calculated_Shaft_Torque_Nm: t.torqueNm,
      Stator_Temp_C: t.statorTempC,
      Bearing_Vib_RMS_mms: t.bearingVibrationRms,
      Phase_Current_A: t.phaseCurrentA,
      Rated_Current_A: 81.5,
      Pump_Flow_m3h: t.pumpFlowM3h,
      Pump_Pressure_bar: t.pumpPressureBar,
      Raw_ADC_Temp_IW12: t.rawTempAdc,
      Anomaly_Score: t.anomalyScore,
      Asset_Health_Pct: t.assetHealthPct,
      Estimated_RUL_Hours: t.estimatedRulHours,
    }));
    exportTelemetryToCsv(exportData, `motor_telemetry_${Date.now()}.csv`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Play/Pause, Reset, Speed */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Engine</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Engine</span>
              </>
            )}
          </button>

          {/* Reset */}
          <button
            onClick={resetSimulation}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Reset telemetry buffer and state"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 px-2">
              Rate:
            </span>
            {([1, 2, 5] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setSimulationSpeed(spd)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                  simulationSpeed === spd
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Center: Operating Load Condition */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
            Load Duty:
          </span>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            {(
              [
                { id: 'medium_load', label: '76% Nominal (34 kW · 221 Nm)' },
                { id: 'full_load', label: '100% Rated (45 kW · 291 Nm)' },
                { id: 'idle', label: '25% Low Load (11 kW · 71 Nm)' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setOperatingCondition(opt.id as OperatingCondition)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  operatingCondition === opt.id
                    ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Noise toggle & Export CSV */}
        <div className="flex items-center gap-3">
          {/* Noise toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={sensorNoiseEnabled}
              onChange={(e) => setSensorNoiseEnabled(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 dark:border-slate-700 focus:ring-teal-500"
            />
            <span>Analog Sensor Noise</span>
          </label>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV ({telemetryHistory.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
