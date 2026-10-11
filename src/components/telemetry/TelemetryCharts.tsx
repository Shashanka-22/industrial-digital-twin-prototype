import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useSimulation } from '../../context/SimulationContext';
import { Layers, Activity, Thermometer, Zap, RotateCw, BarChart2 } from 'lucide-react';

type ChannelOption = 'vibration' | 'temperature' | 'current' | 'speed' | 'torque' | 'anomaly';
type ViewMode = 'single_channel' | 'quad_scope' | 'normalized_compare';

export const TelemetryCharts: React.FC = () => {
  const { telemetryHistory, settings, currentTelemetry } = useSimulation();
  const [selectedChannel, setSelectedChannel] = useState<ChannelOption>('vibration');
  const [viewMode, setViewMode] = useState<ViewMode>('single_channel');

  // Format data for physical charts
  const data = telemetryHistory.map((point) => ({
    time: point.timestamp,
    vibration: point.bearingVibrationRms,
    temp: point.statorTempC,
    current: point.phaseCurrentA,
    speed: point.speedRpm,
    torque: point.torqueNm,
    anomaly: Number((point.anomalyScore * 100).toFixed(1)),
    // Normalized to nominal baseline (100% = normal operating point)
    normVibration: Number(((point.bearingVibrationRms / 1.10) * 100).toFixed(1)),
    normTemp: Number(((point.statorTempC / 52.0) * 100).toFixed(1)),
    normCurrent: Number(((point.phaseCurrentA / 62.0) * 100).toFixed(1)),
    normSpeed: Number(((point.speedRpm / 1480.0) * 100).toFixed(1)),
  }));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
      {/* Header and View Mode Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              Multi-Channel Telemetry Oscilloscope
            </h3>
            <span className="text-[11px] font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
              SIMULATION ENGINE · {settings.samplingIntervalMs}ms
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dedicated physical engineering scales with calibrated ISO warning and trip thresholds.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('single_channel')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                viewMode === 'single_channel'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Single Channel Scale
            </button>
            <button
              onClick={() => setViewMode('quad_scope')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                viewMode === 'quad_scope'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              4-Channel Scope Grid
            </button>
            <button
              onClick={() => setViewMode('normalized_compare')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                viewMode === 'normalized_compare'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Normalized Overlay (%)
            </button>
          </div>
        </div>
      </div>

      {/* Mode A: Single Channel High-Resolution View */}
      {viewMode === 'single_channel' && (
        <div className="space-y-3">
          {/* Channel Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'vibration', label: 'Vibration RMS (mm/s)', unit: 'mm/s', val: currentTelemetry.bearingVibrationRms.toFixed(2) },
              { id: 'temperature', label: 'Stator Temp (°C)', unit: '°C', val: currentTelemetry.statorTempC.toFixed(1) },
              { id: 'current', label: 'Phase Current (A)', unit: 'A', val: currentTelemetry.phaseCurrentA.toFixed(1) },
              { id: 'speed', label: 'Shaft Speed (RPM)', unit: 'RPM', val: currentTelemetry.speedRpm.toFixed(0) },
              { id: 'torque', label: 'Shaft Torque (Nm)', unit: 'Nm', val: currentTelemetry.torqueNm.toFixed(1) },
              { id: 'anomaly', label: 'Anomaly Index (%)', unit: '%', val: (currentTelemetry.anomalyScore * 100).toFixed(1) },
            ].map((ch) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id as ChannelOption)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors border ${
                  selectedChannel === ch.id
                    ? 'bg-teal-700 text-white border-teal-700 font-semibold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{ch.label}</span>
                <span className="font-mono text-[10px] opacity-80">({ch.val})</span>
              </button>
            ))}
          </div>

          {/* Single Channel Chart Canvas */}
          <div className="w-full h-80 select-none">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.2} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  stroke="#94A3B8"
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  stroke="#94A3B8"
                  domain={
                    selectedChannel === 'vibration'
                      ? [0, 8]
                      : selectedChannel === 'temperature'
                      ? [30, 110]
                      : selectedChannel === 'current'
                      ? [0, 120]
                      : selectedChannel === 'speed'
                      ? [1300, 1550]
                      : selectedChannel === 'torque'
                      ? [0, 360]
                      : [0, 100]
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

                {/* Specific Reference Lines */}
                {selectedChannel === 'vibration' && (
                  <>
                    <ReferenceLine
                      y={settings.thresholds.vibrationWarning}
                      stroke="#F59E0B"
                      strokeDasharray="4 4"
                      label={{ value: `ISO Zone C Warning (${settings.thresholds.vibrationWarning} mm/s)`, fill: '#F59E0B', fontSize: 10, position: 'insideTopRight' }}
                    />
                    <ReferenceLine
                      y={settings.thresholds.vibrationCritical}
                      stroke="#EF4444"
                      strokeDasharray="4 4"
                      label={{ value: `ISO Zone D Trip (${settings.thresholds.vibrationCritical} mm/s)`, fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="vibration"
                      name="Drive-End Vibration (mm/s RMS)"
                      stroke="#0D9488"
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </>
                )}

                {selectedChannel === 'temperature' && (
                  <>
                    <ReferenceLine
                      y={settings.thresholds.tempWarning}
                      stroke="#F59E0B"
                      strokeDasharray="4 4"
                      label={{ value: `Class F Warning (${settings.thresholds.tempWarning}°C)`, fill: '#F59E0B', fontSize: 10, position: 'insideTopRight' }}
                    />
                    <ReferenceLine
                      y={settings.thresholds.tempCritical}
                      stroke="#EF4444"
                      strokeDasharray="4 4"
                      label={{ value: `Thermal Trip (${settings.thresholds.tempCritical}°C)`, fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="temp"
                      name="Stator Winding Temperature (°C)"
                      stroke="#E11D48"
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </>
                )}

                {selectedChannel === 'current' && (
                  <>
                    <ReferenceLine
                      y={81.5}
                      stroke="#0284C7"
                      strokeDasharray="4 4"
                      label={{ value: 'Rated Full Load (81.5 A FLA)', fill: '#0284C7', fontSize: 10, position: 'insideTopRight' }}
                    />
                    <ReferenceLine
                      y={settings.thresholds.currentCritical}
                      stroke="#EF4444"
                      strokeDasharray="4 4"
                      label={{ value: `Overload Trip (${settings.thresholds.currentCritical} A)`, fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="current"
                      name="Phase U Operating Current (A)"
                      stroke="#F59E0B"
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </>
                )}

                {selectedChannel === 'speed' && (
                  <>
                    <ReferenceLine
                      y={1500}
                      stroke="#94A3B8"
                      strokeDasharray="4 4"
                      label={{ value: 'Synchronous 50Hz (1500 RPM)', fill: '#94A3B8', fontSize: 10, position: 'insideTopRight' }}
                    />
                    <ReferenceLine
                      y={1480}
                      stroke="#0D9488"
                      strokeDasharray="4 4"
                      label={{ value: 'Nominal Operating Speed (1480 RPM)', fill: '#0D9488', fontSize: 10, position: 'insideTopRight' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="speed"
                      name="Rotor Shaft Speed (RPM)"
                      stroke="#0284C7"
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </>
                )}

                {selectedChannel === 'torque' && (
                  <>
                    <ReferenceLine
                      y={220.7}
                      stroke="#0D9488"
                      strokeDasharray="4 4"
                      label={{ value: 'Nominal 76% Load Torque (~221 Nm)', fill: '#0D9488', fontSize: 10, position: 'insideTopRight' }}
                    />
                    <ReferenceLine
                      y={291.4}
                      stroke="#94A3B8"
                      strokeDasharray="4 4"
                      label={{ value: 'Rated 45kW Torque (291 Nm)', fill: '#94A3B8', fontSize: 10, position: 'insideTopRight' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="torque"
                      name="Calculated Shaft Torque (Nm = 9550 * P / N)"
                      stroke="#8B5CF6"
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </>
                )}

                {selectedChannel === 'anomaly' && (
                  <>
                    <ReferenceLine
                      y={35}
                      stroke="#F59E0B"
                      strokeDasharray="4 4"
                      label={{ value: 'Warning Anomaly (0.35)', fill: '#F59E0B', fontSize: 10, position: 'insideTopRight' }}
                    />
                    <ReferenceLine
                      y={65}
                      stroke="#EF4444"
                      strokeDasharray="4 4"
                      label={{ value: 'Critical Anomaly (0.65)', fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="anomaly"
                      name="Normalized Anomaly Index (%)"
                      stroke="#EC4899"
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Mode B: Quad 4-Channel Synchronized Engineering Scope Grid */}
      {viewMode === 'quad_scope' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
          {/* Subplot 1: Vibration RMS */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-800 dark:text-slate-200">
              <span>Drive-End Vibration (mm/s RMS)</span>
              <span className="font-mono text-teal-600">{currentTelemetry.bearingVibrationRms.toFixed(2)} mm/s</span>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.2} />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#94A3B8' }} interval="preserveStartEnd" />
                  <YAxis domain={[0, 8]} tick={{ fontSize: 9, fill: '#94A3B8' }} />
                  <ReferenceLine y={settings.thresholds.vibrationWarning} stroke="#F59E0B" strokeDasharray="3 3" />
                  <ReferenceLine y={settings.thresholds.vibrationCritical} stroke="#EF4444" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="vibration" stroke="#0D9488" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subplot 2: Stator Winding Temp */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-800 dark:text-slate-200">
              <span>Stator Winding Temp (°C)</span>
              <span className="font-mono text-rose-600">{currentTelemetry.statorTempC.toFixed(1)} °C</span>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.2} />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#94A3B8' }} interval="preserveStartEnd" />
                  <YAxis domain={[30, 110]} tick={{ fontSize: 9, fill: '#94A3B8' }} />
                  <ReferenceLine y={settings.thresholds.tempWarning} stroke="#F59E0B" strokeDasharray="3 3" />
                  <ReferenceLine y={settings.thresholds.tempCritical} stroke="#EF4444" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="temp" stroke="#E11D48" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subplot 3: Phase Current */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-800 dark:text-slate-200">
              <span>Phase Current (A)</span>
              <span className="font-mono text-amber-600">{currentTelemetry.phaseCurrentA.toFixed(1)} A</span>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.2} />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#94A3B8' }} interval="preserveStartEnd" />
                  <YAxis domain={[0, 120]} tick={{ fontSize: 9, fill: '#94A3B8' }} />
                  <ReferenceLine y={81.5} stroke="#0284C7" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="current" stroke="#F59E0B" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subplot 4: Shaft Speed */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-800 dark:text-slate-200">
              <span>Shaft Speed (RPM)</span>
              <span className="font-mono text-sky-600">{currentTelemetry.speedRpm.toFixed(0)} RPM</span>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.2} />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#94A3B8' }} interval="preserveStartEnd" />
                  <YAxis domain={[1350, 1550]} tick={{ fontSize: 9, fill: '#94A3B8' }} />
                  <ReferenceLine y={1480} stroke="#0D9488" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="speed" stroke="#0284C7" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Mode C: Normalized Comparison Overlay (% of Nominal Operating Point) */}
      {viewMode === 'normalized_compare' && (
        <div className="space-y-2 select-none">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            All channels indexed against nominal 76% operating baseline (100% = 1.1 mm/s Vib, 52°C Temp, 62A Current, 1480 RPM Speed).
          </p>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.2} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94A3B8' }} stroke="#94A3B8" interval="preserveStartEnd" />
                <YAxis domain={[50, 300]} tick={{ fontSize: 10, fill: '#94A3B8' }} stroke="#94A3B8" />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Relative Deviation']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <ReferenceLine y={100} stroke="#94A3B8" strokeWidth={1.5} label={{ value: '100% Nominal Baseline', fill: '#94A3B8', fontSize: 10, position: 'insideBottomRight' }} />

                <Line type="monotone" dataKey="normVibration" name="Vibration (% of 1.1 mm/s)" stroke="#0D9488" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="normTemp" name="Temp (% of 52°C)" stroke="#E11D48" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="normCurrent" name="Current (% of 62A)" stroke="#F59E0B" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="normSpeed" name="Speed (% of 1480 RPM)" stroke="#0284C7" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
