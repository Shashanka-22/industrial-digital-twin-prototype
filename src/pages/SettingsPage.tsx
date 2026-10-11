import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import {
  Settings,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Database,
  Moon,
  Sun,
  Shield,
  Sliders,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetSettings, toggleTheme } = useSimulation();

  // Local editable form state
  const [assetId, setAssetId] = useState(settings.assetId);
  const [assetName, setAssetName] = useState(settings.assetName);
  const [samplingInterval, setSamplingInterval] = useState(settings.samplingIntervalMs);
  const [historyBuffer, setHistoryBuffer] = useState(settings.historyBufferSize);
  const [vibWarn, setVibWarn] = useState(settings.thresholds.vibrationWarning);
  const [vibCrit, setVibCrit] = useState(settings.thresholds.vibrationCritical);
  const [tempWarn, setTempWarn] = useState(settings.thresholds.tempWarning);
  const [tempCrit, setTempCrit] = useState(settings.thresholds.tempCritical);
  const [currentWarn, setCurrentWarn] = useState(settings.thresholds.currentWarning);
  const [currentCrit, setCurrentCrit] = useState(settings.thresholds.currentCritical);
  const [anomalyWarn, setAnomalyWarn] = useState(settings.thresholds.anomalyWarning);
  const [anomalyCrit, setAnomalyCrit] = useState(settings.thresholds.anomalyCritical);
  const [dataSource, setDataSource] = useState(settings.activeDataSource);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation checks
    if (vibWarn >= vibCrit) {
      setValidationError('Vibration Warning threshold must be lower than Critical threshold.');
      return;
    }
    if (tempWarn >= tempCrit) {
      setValidationError('Temperature Warning threshold must be lower than Critical threshold.');
      return;
    }
    if (currentWarn >= currentCrit) {
      setValidationError('Current Warning threshold must be lower than Critical threshold.');
      return;
    }
    if (anomalyWarn >= anomalyCrit) {
      setValidationError('Anomaly Warning score must be lower than Critical score.');
      return;
    }

    updateSettings({
      assetId,
      assetName,
      samplingIntervalMs: Number(samplingInterval),
      historyBufferSize: Number(historyBuffer),
      activeDataSource: dataSource,
      thresholds: {
        vibrationWarning: Number(vibWarn),
        vibrationCritical: Number(vibCrit),
        tempWarning: Number(tempWarn),
        tempCritical: Number(tempCrit),
        currentWarning: Number(currentWarn),
        currentCritical: Number(currentCrit),
        anomalyWarning: Number(anomalyWarn),
        anomalyCritical: Number(anomalyCrit),
      },
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    resetSettings();
    setVibWarn(2.8);
    setVibCrit(4.5);
    setTempWarn(75.0);
    setTempCrit(90.0);
    setCurrentWarn(78.0);
    setCurrentCrit(92.0);
    setAnomalyWarn(0.35);
    setAnomalyCrit(0.65);
    setSamplingInterval(1000);
    setHistoryBuffer(60);
    setValidationError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              System Engineering & Threshold Configuration
            </h2>
            <span className="text-xs font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
              ISO 10816 / IEC 62682 Referenced
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generates synthetic industrial motor telemetry using configurable engineering thresholds and simplified physical models. Values are illustrative and are not evidence of standards compliance or validated plant performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset to Engineering Defaults</span>
          </button>
        </div>
      </div>

      {/* Validation / Success Messages */}
      {validationError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Configuration saved successfully and persisted to browser local storage.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Asset Identity & Sampling */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white text-base">
            Asset Identity & Telemetry Sampling
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Asset Identifier
              </label>
              <input
                type="text"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full text-xs font-mono p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Asset Name & Application Description
              </label>
              <input
                type="text"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Sampling Interval (ms)
              </label>
              <select
                value={samplingInterval}
                onChange={(e) => setSamplingInterval(Number(e.target.value))}
                className="w-full text-xs font-mono p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer"
              >
                <option value={500}>500 ms (Fast Polling)</option>
                <option value={1000}>1000 ms (Nominal Standard 1s)</option>
                <option value={2000}>2000 ms (Bandwidth Conservative)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Telemetry Rolling History Buffer Size
              </label>
              <select
                value={historyBuffer}
                onChange={(e) => setHistoryBuffer(Number(e.target.value))}
                className="w-full text-xs font-mono p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer"
              >
                <option value={30}>30 Samples</option>
                <option value={60}>60 Samples (Recommended)</option>
                <option value={120}>120 Samples (High Density)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alarm Thresholds Configuration */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Simulated Sensor Alarm Thresholds & Envelopes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Values exceeding warning trigger simulated amber alerts; values exceeding critical trigger simulated red alarms (simulation only; no physical trip is commanded).
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">ISA-18.2 / ISO 10816 Referenced</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Vibration */}
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Vibration (mm/s RMS)
              </span>
              <div>
                <label className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium">
                  Warning Limit
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={vibWarn}
                  onChange={(e) => setVibWarn(Number(e.target.value))}
                  className="w-full text-xs font-mono p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded mt-0.5"
                />
              </div>
              <div>
                <label className="text-[10px] text-rose-600 dark:text-rose-400 block font-medium">
                  Critical Trip Limit
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={vibCrit}
                  onChange={(e) => setVibCrit(Number(e.target.value))}
                  className="w-full text-xs font-mono p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded mt-0.5"
                />
              </div>
            </div>

            {/* Temperature */}
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Stator Winding Temp (°C)
              </span>
              <div>
                <label className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium">
                  Warning Limit
                </label>
                <input
                  type="number"
                  step="1"
                  value={tempWarn}
                  onChange={(e) => setTempWarn(Number(e.target.value))}
                  className="w-full text-xs font-mono p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded mt-0.5"
                />
              </div>
              <div>
                <label className="text-[10px] text-rose-600 dark:text-rose-400 block font-medium">
                  Critical Trip Limit
                </label>
                <input
                  type="number"
                  step="1"
                  value={tempCrit}
                  onChange={(e) => setTempCrit(Number(e.target.value))}
                  className="w-full text-xs font-mono p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded mt-0.5"
                />
              </div>
            </div>

            {/* Current */}
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Phase Current (A)
              </span>
              <div>
                <label className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium">
                  Warning Limit
                </label>
                <input
                  type="number"
                  step="1"
                  value={currentWarn}
                  onChange={(e) => setCurrentWarn(Number(e.target.value))}
                  className="w-full text-xs font-mono p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded mt-0.5"
                />
              </div>
              <div>
                <label className="text-[10px] text-rose-600 dark:text-rose-400 block font-medium">
                  Critical Trip Limit
                </label>
                <input
                  type="number"
                  step="1"
                  value={currentCrit}
                  onChange={(e) => setCurrentCrit(Number(e.target.value))}
                  className="w-full text-xs font-mono p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded mt-0.5"
                />
              </div>
            </div>

            {/* Anomaly Score */}
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Anomaly Index (0 - 1.0)
              </span>
              <div>
                <label className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium">
                  Warning Score
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={anomalyWarn}
                  onChange={(e) => setAnomalyWarn(Number(e.target.value))}
                  className="w-full text-xs font-mono p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded mt-0.5"
                />
              </div>
              <div>
                <label className="text-[10px] text-rose-600 dark:text-rose-400 block font-medium">
                  Critical Score
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={anomalyCrit}
                  onChange={(e) => setAnomalyCrit(Number(e.target.value))}
                  className="w-full text-xs font-mono p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded mt-0.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Backend Ingestion & Data Source Gateway Readiness */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-teal-600" />
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              Telemetry Ingestion Source Interface
            </h3>
          </div>

          <div className="space-y-2">
            {[
              {
                id: 'simulation',
                title: 'Internal Deterministic Simulation Engine (Active)',
                desc: 'Generates synthetic multivariate motor telemetry using configurable engineering thresholds and simplified physical models in browser. Values are illustrative and do not establish standards compliance.',
              },
              {
                id: 'edge_mqtt_gateway',
                title: 'MQTT Industrial Gateway (Prepared / Disconnected)',
                desc: 'Prepared telemetry ingest interface for industrial MQTT broker. Currently disconnected (no physical edge broker connected).',
              },
              {
                id: 'opcua_rest',
                title: 'OPC UA Gateway (Prepared / Disconnected)',
                desc: 'Prepared interface for OPC UA server address space proxy. Currently disconnected (no physical PLC connection).',
              },
            ].map((src) => (
              <label
                key={src.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  dataSource === src.id
                    ? 'bg-teal-50/50 dark:bg-teal-950/40 border-teal-600'
                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="datasource"
                  value={src.id}
                  checked={dataSource === src.id}
                  onChange={() => setDataSource(src.id as any)}
                  className="mt-1 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {src.title}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                    {src.desc}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save & Apply Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
