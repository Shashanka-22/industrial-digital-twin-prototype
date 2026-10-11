import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { exportTelemetryToCsv } from '../utils/engineeringCalculations';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Download,
  Calendar,
  Clock,
  TrendingUp,
  Activity,
  Layers,
  BarChart2,
  PieChart as PieIcon,
} from 'lucide-react';

type TimeRange = '1h' | '8h' | '24h' | '7d' | '30d';

export const AnalyticsPage: React.FC = () => {
  const { sessionHistorian, currentTelemetry, settings, isRunning, alarms, assetMetadata } = useSimulation();
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [selectedMetric, setSelectedMetric] = useState<
    'vibration' | 'temperature' | 'current' | 'torque' | 'power' | 'health'
  >('vibration');

  // Unified Historical Trend combining long-term historian archive with live session telemetry
  const historicalData = React.useMemo(() => {
    const pointsCount = timeRange === '1h' ? 24 : timeRange === '8h' ? 32 : timeRange === '24h' ? 24 : timeRange === '7d' ? 28 : 30;
    const now = Date.now();
    const intervalMs =
      timeRange === '1h'
        ? 60 * 1000 * 2.5
        : timeRange === '8h'
        ? 15 * 60 * 1000
        : timeRange === '24h'
        ? 60 * 60 * 1000
        : timeRange === '7d'
        ? 6 * 60 * 60 * 1000
        : 24 * 60 * 60 * 1000;

    // Build historical baseline points
    const basePoints = Array.from({ length: pointsCount }, (_, i) => {
      const t = now - (pointsCount - 1 - i) * intervalMs;
      const date = new Date(t);
      const label =
        timeRange === '1h' || timeRange === '8h'
          ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
          : timeRange === '24h'
          ? `${date.getHours()}:00`
          : `${date.getMonth() + 1}/${date.getDate()}`;

      const power = Number((34.2 + Math.sin(i * 0.2) * 0.4).toFixed(1));
      const speed = Number((1480 + Math.cos(i * 0.3) * 1.5).toFixed(0));
      const torque = Number(((9550 * power) / speed).toFixed(1));

      return {
        timestamp: label,
        vibration: Number((1.1 + Math.sin(i * 0.4) * 0.08).toFixed(2)),
        temperature: Number((52.0 + Math.cos(i * 0.3) * 1.2).toFixed(1)),
        current: Number((62.0 + Math.sin(i * 0.5) * 1.5).toFixed(1)),
        power,
        speed,
        torque,
        health: 96,
        anomaly: 2.1,
      };
    });

    // Splice live session telemetry points at the end of the history array
    if (sessionHistorian && sessionHistorian.length > 0) {
      const recentLive = sessionHistorian.slice(-Math.min(sessionHistorian.length, Math.floor(pointsCount / 2)));
      const startSplice = pointsCount - recentLive.length;

      recentLive.forEach((livePoint, idx) => {
        const destIdx = startSplice + idx;
        if (destIdx < basePoints.length) {
          basePoints[destIdx] = {
            timestamp: timeRange === '1h' ? livePoint.timestamp : basePoints[destIdx].timestamp,
            vibration: livePoint.bearingVibrationRms,
            temperature: livePoint.statorTempC,
            current: livePoint.phaseCurrentA,
            power: livePoint.powerKw,
            speed: livePoint.speedRpm,
            torque: livePoint.torqueNm,
            health: livePoint.assetHealthPct,
            anomaly: Number((livePoint.anomalyScore * 100).toFixed(1)),
          };
        }
      });
    }

    // Always anchor the final point to the current live active telemetry point
    basePoints[basePoints.length - 1] = {
      timestamp: timeRange === '1h' ? currentTelemetry.timestamp : 'Now (Live)',
      vibration: currentTelemetry.bearingVibrationRms,
      temperature: currentTelemetry.statorTempC,
      current: currentTelemetry.phaseCurrentA,
      power: currentTelemetry.powerKw,
      speed: currentTelemetry.speedRpm,
      torque: currentTelemetry.torqueNm,
      health: currentTelemetry.assetHealthPct,
      anomaly: Number((currentTelemetry.anomalyScore * 100).toFixed(1)),
    };

    return basePoints;
  }, [timeRange, sessionHistorian, currentTelemetry]);

  // Statistical aggregates calculation
  const stats = React.useMemo(() => {
    const vibs = historicalData.map((d) => d.vibration);
    const temps = historicalData.map((d) => d.temperature);
    const currents = historicalData.map((d) => d.current);
    const torques = historicalData.map((d) => d.torque);
    const powers = historicalData.map((d) => d.power);

    const calcStat = (arr: number[]) => {
      const min = Math.min(...arr);
      const max = Math.max(...arr);
      const sum = arr.reduce((a, b) => a + b, 0);
      const mean = Number((sum / arr.length).toFixed(2));
      const variance = arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / arr.length;
      const stdDev = Number(Math.sqrt(variance).toFixed(2));
      return { min, max, mean, stdDev };
    };

    return {
      vibration: calcStat(vibs),
      temperature: calcStat(temps),
      current: calcStat(currents),
      torque: calcStat(torques),
      power: calcStat(powers),
    };
  }, [historicalData]);

  // Operating condition distribution pie data
  const stateDistribution = [
    { name: 'Full Load (100%)', value: 68, color: '#0D9488' },
    { name: 'Medium Load (75%)', value: 24, color: '#38BDF8' },
    { name: 'Idle / Standby (25%)', value: 8, color: '#94A3B8' },
  ];

  // Alarm Counts by Severity
  const alarmCounts = [
    { name: 'Critical (Trip)', count: alarms.filter((a) => a.severity === 'critical').length || 2, color: '#EF4444' },
    { name: 'Warning (Alert)', count: alarms.filter((a) => a.severity === 'warning').length || 5, color: '#F59E0B' },
    { name: 'Information', count: alarms.filter((a) => a.severity === 'info').length || 8, color: '#0D9488' },
  ];

  const handleExportCsv = () => {
    exportTelemetryToCsv(historicalData, `motor_twin_analytics_${timeRange}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Historical Telemetry Analytics & Trends
            </h2>
            <span className="text-xs font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
              Simulated Historian Buffer
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Aggregated time-series trend analysis, operating condition distributions, and statistical variance.
          </p>
        </div>

        {/* Time Range Selector & Export */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            {(
              [
                { id: '1h', label: '1 Hour' },
                { id: '8h', label: '8 Hours' },
                { id: '24h', label: '24 Hours' },
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
              ] as const
            ).map((rng) => (
              <button
                key={rng.id}
                onClick={() => setTimeRange(rng.id)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  timeRange === rng.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {rng.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Status banner for Simulation Mode & Synthetic Data */}
      <div className="bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="font-bold text-slate-800 dark:text-slate-200">
            SIMULATION MODE · HISTORICAL DATA IS SYNTHETIC
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600 dark:text-slate-400">
            Internal Engine: {isRunning ? 'Active' : 'Paused'} ({settings.samplingIntervalMs}ms cyclic)
          </span>
        </div>
        <div className="font-mono text-slate-500 text-[11px] flex items-center gap-3">
          <span>Gateway: OPC UA (Prepared)</span>
          <span>Last Sample: {currentTelemetry.timestamp}</span>
        </div>
      </div>

      {/* Main Historical Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              Time-Series Historical Trend ({timeRange.toUpperCase()} Window)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deterministic multi-channel trend data. Torque derived via standard 9550 × P_act / N.
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            {(
              [
                { id: 'vibration', label: 'Vibration' },
                { id: 'temperature', label: 'Temp' },
                { id: 'current', label: 'Current' },
                { id: 'torque', label: 'Torque (Nm)' },
                { id: 'power', label: 'Power (kW)' },
                { id: 'health', label: 'Health' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMetric(m.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedMetric === m.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="w-full h-72 select-none">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.2} />
              <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: '#94A3B8' }} stroke="#94A3B8" />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} stroke="#94A3B8" domain={['auto', 'auto']} />
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

              {selectedMetric === 'vibration' && (
                <Line
                  type="monotone"
                  dataKey="vibration"
                  name="Vibration (mm/s RMS)"
                  stroke="#0D9488"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                />
              )}

              {selectedMetric === 'temperature' && (
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Stator Winding Temp (°C)"
                  stroke="#E11D48"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                />
              )}

              {selectedMetric === 'current' && (
                <Line
                  type="monotone"
                  dataKey="current"
                  name="Phase Current (A)"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                />
              )}

              {selectedMetric === 'torque' && (
                <Line
                  type="monotone"
                  dataKey="torque"
                  name="Shaft Torque (Nm = 9550 * P / N)"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                />
              )}

              {selectedMetric === 'power' && (
                <Line
                  type="monotone"
                  dataKey="power"
                  name="Operating Mechanical Power (kW)"
                  stroke="#0284C7"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                />
              )}

              {selectedMetric === 'health' && (
                <Line
                  type="monotone"
                  dataKey="health"
                  name="Composite Health (%)"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Middle Row: Statistical Variance Table + Operating Distribution Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistical Summary Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white text-base">
            Statistical Telemetry Analysis ({timeRange.toUpperCase()})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Measurement Channel</th>
                  <th className="py-2.5 px-3 text-right">Min</th>
                  <th className="py-2.5 px-3 text-right">Mean</th>
                  <th className="py-2.5 px-3 text-right">Max</th>
                  <th className="py-2.5 px-3 text-right">Std Dev (σ)</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                <tr>
                  <td className="py-3 px-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                    Drive-End Vibration (mm/s RMS)
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">{stats.vibration.min}</td>
                  <td className="py-3 px-3 text-right tabular-nums font-bold text-teal-600">
                    {stats.vibration.mean}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">{stats.vibration.max}</td>
                  <td className="py-3 px-3 text-right tabular-nums">{stats.vibration.stdDev}</td>
                  <td className="py-3 px-3 text-right tabular-nums text-emerald-600 font-semibold">ISO Zone B</td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                    Stator Winding Temp (°C)
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">{stats.temperature.min}</td>
                  <td className="py-3 px-3 text-right tabular-nums font-bold text-rose-600">
                    {stats.temperature.mean}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">{stats.temperature.max}</td>
                  <td className="py-3 px-3 text-right tabular-nums">{stats.temperature.stdDev}</td>
                  <td className="py-3 px-3 text-right tabular-nums text-emerald-600 font-semibold">Class F Normal</td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                    Phase Current (A)
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">{stats.current.min}</td>
                  <td className="py-3 px-3 text-right tabular-nums font-bold text-amber-600">
                    {stats.current.mean}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">{stats.current.max}</td>
                  <td className="py-3 px-3 text-right tabular-nums">{stats.current.stdDev}</td>
                  <td className="py-3 px-3 text-right tabular-nums text-emerald-600 font-semibold">&lt; 81.5 A FLA</td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                    Shaft Torque (Nm)
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">{stats.torque.min}</td>
                  <td className="py-3 px-3 text-right tabular-nums font-bold text-purple-600 dark:text-purple-400">
                    {stats.torque.mean}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">{stats.torque.max}</td>
                  <td className="py-3 px-3 text-right tabular-nums">{stats.torque.stdDev}</td>
                  <td className="py-3 px-3 text-right tabular-nums text-teal-600 font-semibold">~221 Nm (Nominal)</td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                    Actual Mech Power (kW)
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">{stats.power.min}</td>
                  <td className="py-3 px-3 text-right tabular-nums font-bold text-sky-600 dark:text-sky-400">
                    {stats.power.mean}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">{stats.power.max}</td>
                  <td className="py-3 px-3 text-right tabular-nums">{stats.power.stdDev}</td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-500 font-semibold">76% of 45kW</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Operating Load Condition Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white text-base">
            Operating Duty Profile
          </h3>

          <div className="h-44 flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stateDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                >
                  {stateDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Operating Time']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {stateDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-300 text-[11px]">{item.name}</span>
                </div>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alarm Frequency by Severity & Engineering Historian Disclaimer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alarmCounts.map((alm) => (
          <div
            key={alm.name}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between"
          >
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{alm.name}</span>
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
                {alm.count}
              </span>
            </div>
            <div
              className="w-3.5 h-10 rounded-full"
              style={{ backgroundColor: alm.color }}
            />
          </div>
        ))}
      </div>

      {/* Industrial Data Transparency Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          Simulated Data & Historian Traceability:
        </span>{' '}
        Historical and live telemetry streams are generated by the prototype&apos;s internal simulation engine. Sensor values, trends, and operating metrics are illustrative calculations and do not represent verified compliance or direct connections to physical plant hardware.
      </div>
    </div>
  );
};
