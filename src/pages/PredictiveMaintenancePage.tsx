import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { HealthGauge } from '../components/common/HealthGauge';
import {
  calculateAnomalyScore,
  calculateStatisticalBounds,
} from '../utils/engineeringCalculations';
import {
  Cpu,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Wrench,
  HelpCircle,
  TrendingDown,
  Layers,
  ArrowRight,
  Info,
  Activity,
  Zap,
  Gauge,
  Thermometer,
} from 'lucide-react';

export const PredictiveMaintenancePage: React.FC = () => {
  const { currentTelemetry, telemetryHistory, digitalModelRef, maintenanceActions, settings } = useSimulation();
  const [dispatchedTaskIds, setDispatchedTaskIds] = React.useState<Record<string, boolean>>({});

  const handleDispatchWorkOrder = (actionId: string) => {
    setDispatchedTaskIds((prev) => ({ ...prev, [actionId]: true }));
    setTimeout(() => {
      setDispatchedTaskIds((prev) => ({ ...prev, [actionId]: false }));
    }, 4000);
  };

  // Anomaly score evaluated against calibrated baseline of active operating point
  const { score, contributions } = calculateAnomalyScore(
    currentTelemetry.speedRpm,
    currentTelemetry.statorTempC,
    currentTelemetry.bearingVibrationRms,
    currentTelemetry.phaseCurrentA,
    {
      speed: digitalModelRef.speedRpm,
      temp: digitalModelRef.statorTempC,
      vibration: digitalModelRef.bearingVibrationRms,
      current: digitalModelRef.phaseCurrentA,
    }
  );

  // Real statistical 2-sigma bounds calculated from rolling telemetry buffer
  const vibHistory = telemetryHistory.map((p) => p.bearingVibrationRms);
  const vibStats = calculateStatisticalBounds(vibHistory);
  const tempHistory = telemetryHistory.map((p) => p.statorTempC);
  const tempStats = calculateStatisticalBounds(tempHistory);

  // Fault classification list
  const faultTypes = [
    {
      category: 'Bearing Raceway Spalling (BPFO)',
      likelihood:
        currentTelemetry.bearingVibrationRms > settings.thresholds.vibrationWarning ? 'High (88%)' : 'Nominal (< 3%)',
      status:
        currentTelemetry.bearingVibrationRms > settings.thresholds.vibrationWarning ? 'active_threat' : 'nominal',
      symptom: 'Harmonics around 3.58x shaft running frequency (BPFO outer race defect).',
      recommendation: 'Perform high-resolution accelerometer FFT. Inspect cage and outer raceway.',
    },
    {
      category: 'Stator Thermal Insulation Aging',
      likelihood:
        currentTelemetry.statorTempC > settings.thresholds.tempWarning ? 'Elevated (74%)' : 'Nominal (< 5%)',
      status:
        currentTelemetry.statorTempC > settings.thresholds.tempWarning ? 'active_threat' : 'nominal',
      symptom: 'Arrhenius thermal rate doubling. Winding temperatures nearing Class F boundary.',
      recommendation: 'Thermographic survey on terminal connections and verify external cowl fan clearance.',
    },
    {
      category: 'Pump Impeller Cavitation & Clogging',
      likelihood:
        currentTelemetry.phaseCurrentA > settings.thresholds.currentWarning ? 'High (82%)' : 'Nominal (< 2%)',
      status:
        currentTelemetry.phaseCurrentA > settings.thresholds.currentWarning ? 'active_threat' : 'nominal',
      symptom: 'High load current, torque surges, and suction pressure fluctuations.',
      recommendation: 'Clean suction basket strainer and check net positive suction head (NPSH).',
    },
    {
      category: 'Rotor Dynamic Eccentricity & Misalignment',
      likelihood:
        Math.abs(currentTelemetry.speedRpm - 1480) > 60 ? 'Moderate (45%)' : 'Low (< 4%)',
      status:
        Math.abs(currentTelemetry.speedRpm - 1480) > 60 ? 'warning' : 'nominal',
      symptom: '2x rotational frequency vibration coupled with slip deviation.',
      recommendation: 'Laser alignment check across flexible disc coupling faces.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Predictive Maintenance & Degradation Prognostics
            </h2>
            <span className="text-xs font-mono font-medium text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
              SIMULATION MODE — NO LIVE HARDWARE DATA
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulated condition-based monitoring transforming synthetic multivariate telemetry into demonstration Remaining Useful Life (RUL) projections.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px]">Algorithm</span>
            <span className="font-bold text-slate-900 dark:text-white">Simulated Residuals (Vib Ref: ISO 10816-3)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px]">Statistical 2σ Bounds (Simulated Buffer)</span>
            <span className="font-bold text-teal-600 dark:text-teal-400">
              Vib: [{vibStats.lower2Sigma}, {vibStats.upper2Sigma}] mm/s
            </span>
          </div>
        </div>
      </div>

      {/* Direct vs. Derived vs. Predicted Transparency Hierarchy */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
            Telemetry Processing Pipeline: Direct vs. Derived vs. Predictive Inferences
          </h3>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            Engineering Provenance
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
          {/* Level 1: Direct Physical Telemetry */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                1. Direct Measurements
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Unprocessed electrical & transducer physical signals acquired directly from field sensors via SIMATIC I/O:
            </p>
            <ul className="space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
              <li>• Raw ADC Temp (%IW12): <strong>{currentTelemetry.rawTempAdc}</strong></li>
              <li>• Phase Current: <strong>{currentTelemetry.phaseCurrentA.toFixed(1)} A</strong> (4-20mA CT)</li>
              <li>• Shaft Speed: <strong>{currentTelemetry.speedRpm.toFixed(0)} RPM</strong> (Encoder)</li>
              <li>• Pump Pressure: <strong>{currentTelemetry.pumpPressureBar.toFixed(2)} bar</strong></li>
            </ul>
          </div>

          {/* Level 2: Derived Engineering Metrics */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                2. Derived Engineering Units
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Calculated via physical transfer functions and standard calibration equations:
            </p>
            <ul className="space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
              <li>• Scaled Winding Temp: <strong>{currentTelemetry.statorTempC.toFixed(1)} °C</strong></li>
              <li>• ISO Vib Velocity RMS: <strong>{currentTelemetry.bearingVibrationRms.toFixed(2)} mm/s</strong></li>
              <li>• Actual Mech Power: <strong>{currentTelemetry.powerKw.toFixed(1)} kW</strong> ({currentTelemetry.loadFactorPct.toFixed(0)}%)</li>
              <li>• Calculated Torque: <strong>{currentTelemetry.torqueNm.toFixed(1)} Nm</strong> (9550 × P / N)</li>
            </ul>
          </div>

          {/* Level 3: Predictive ML & RUL Inferences */}
          <div className="p-3.5 rounded-lg bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <h4 className="font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wider text-[11px]">
                3. Model Inferences & Prognostics
              </h4>
            </div>
            <p className="text-[11px] text-teal-800/80 dark:text-teal-300/80 leading-relaxed">
              Synthesized through Arrhenius degradation models, ISO severity envelopes, and multivariate residuals:
            </p>
            <ul className="space-y-1 font-mono text-[11px] text-slate-800 dark:text-slate-200">
              <li>• Anomaly Score: <strong>{currentTelemetry.anomalyScore.toFixed(3)}</strong> / 1.0</li>
              <li>• Asset Health Index: <strong>{currentTelemetry.assetHealthPct}%</strong></li>
              <li>• Projected RUL: <strong>{currentTelemetry.estimatedRulHours.toLocaleString()} hours</strong></li>
              <li>• 2σ Temp Bound: <strong>[{tempStats.lower2Sigma}, {tempStats.upper2Sigma}] °C</strong></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Top Prognostic Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Gauge & RUL */}
        <div className="lg:col-span-1">
          <HealthGauge
            healthPct={currentTelemetry.assetHealthPct}
            anomalyScore={currentTelemetry.anomalyScore}
            rulHours={currentTelemetry.estimatedRulHours}
            vibrationRms={currentTelemetry.bearingVibrationRms}
          />
        </div>

        {/* Multivariate Anomaly Contributions */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Multivariate Anomaly Score Attribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mathematical contribution of individual channels to overall anomaly index ({currentTelemetry.anomalyScore.toFixed(3)}).
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-1 rounded">
              Score: {currentTelemetry.anomalyScore.toFixed(3)} / 1.0
            </span>
          </div>

          {/* Contribution Progress Bars */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Drive-End Vibration Severity (ISO 10816)
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {contributions.vibrationPct}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all duration-500"
                  style={{ width: `${contributions.vibrationPct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Stator Thermal Elevation (Class F PT100)
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {contributions.tempPct}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${contributions.tempPct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Phase Current Overload (CT Sensor)
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {contributions.currentPct}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${contributions.currentPct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Speed & Slip Deviation (Encoder)
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {contributions.speedPct}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${contributions.speedPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Degradation Trajectory Visual Narrative */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
            <TrendingDown className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">
                Prognostic Trajectory Projection:
              </span>{' '}
              Based on the Paris-Erdogan bearing fatigue law and Arrhenius thermal degradation coefficient, the current stress rate projects an estimated remaining operational window of <strong className="font-mono text-teal-700 dark:text-teal-400">{currentTelemetry.estimatedRulHours.toLocaleString()} hours</strong> before required overhaul.
            </div>
          </div>
        </div>
      </div>

      {/* Fault Classification & Diagnosis Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              Automated Fault Classification & Diagnostic Matching
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Signature matching comparing live telemetry residuals against empirical motor defect patterns.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
            Classifiers: 4 Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faultTypes.map((ft, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-colors flex flex-col justify-between gap-3 ${
                ft.status === 'active_threat'
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900'
                  : ft.status === 'warning'
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {ft.category}
                  </h4>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      ft.status === 'active_threat'
                        ? 'bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                        : ft.status === 'warning'
                        ? 'bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {ft.likelihood}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">
                  {ft.symptom}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-white">Action:</span>{' '}
                {ft.recommendation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prescriptive Work Orders Queue */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              Prescriptive Maintenance Task Orders
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Condition-triggered maintenance directives queued for plant maintenance team dispatch.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
            Active Tasks: {maintenanceActions.length}
          </span>
        </div>

        <div className="space-y-3">
          {maintenanceActions.map((action) => (
            <div
              key={action.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">{action.id}</span>
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {action.title}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      action.priority === 'immediate'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                        : action.priority === 'high'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    }`}
                  >
                    {action.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Target Component: <span className="font-semibold text-slate-800 dark:text-slate-200">{action.component}</span> · Trigger: {action.triggerReason}
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {action.recommendedAction}
                </p>
              </div>

              <div className="text-right shrink-0 flex md:flex-col justify-between items-end gap-1">
                <div className="text-xs font-mono text-slate-500">
                  Window: <strong className="text-slate-900 dark:text-white">{action.targetWindowHours}h</strong>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Est. Downtime: {action.estimatedDowntimeHours}h
                </div>
                {dispatchedTaskIds[action.id] ? (
                  <span className="mt-1 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Dispatched (WO #48201)</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleDispatchWorkOrder(action.id)}
                    className="mt-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 transition-colors shadow-xs"
                  >
                    Dispatch Work Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Transparency & Limitations Panel */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 p-5 text-xs text-slate-600 dark:text-slate-400 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-600 shrink-0" />
          <h4 className="font-bold text-slate-900 dark:text-white text-xs">
            Model Architecture & Illustrative Simulation Estimates
          </h4>
        </div>
        <p className="leading-relaxed">
          <strong>Direct Measurements vs. Derived Metrics vs. Simulated Estimates:</strong> Direct telemetry comprises raw physical sensor quantities (voltage, resistance, current). Derived variables include mechanical shaft torque and vibration velocity RMS computed via mathematical scaling. Prognostic RUL and Anomaly Scores are simulated heuristic models.
        </p>
        <p className="leading-relaxed">
          <strong>Illustrative Simulation Estimates:</strong> Health, anomaly, and Remaining Useful Life values are generated from the prototype&apos;s simulation logic. They are not validated predictions of actual industrial motor life. In commercial production deployments, RUL prognostics are trained against historical run-to-failure runtimes across empirical plant rotating machine assets.
        </p>
      </div>
    </div>
  );
};
