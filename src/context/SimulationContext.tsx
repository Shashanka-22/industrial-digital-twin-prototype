import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  TelemetryPoint,
  FaultScenario,
  OperatingCondition,
  DigitalModelReference,
  AssetMetadata,
  SensorHotspot,
} from '../types/telemetry';
import { AlarmItem, MaintenanceAction } from '../types/alarms';
import { SystemSettings, ThresholdSettings } from '../types/settings';
import {
  calculateTorque,
  scaleSiemensAnalogRaw,
  unscaleSiemensAnalog,
  calculateAnomalyScore,
  estimateRulHours,
} from '../utils/engineeringCalculations';

const DEFAULT_THRESHOLDS: ThresholdSettings = {
  vibrationWarning: 2.8, // ISO 10816 Zone B/C limit
  vibrationCritical: 4.5, // ISO 10816 Zone C/D limit
  tempWarning: 75.0,
  tempCritical: 90.0,
  currentWarning: 78.0,
  currentCritical: 92.0,
  anomalyWarning: 0.35,
  anomalyCritical: 0.65,
};

const DEFAULT_SETTINGS: SystemSettings = {
  assetId: 'MOTOR_45KW_001',
  assetName: 'Centrifugal Feed Pump Motor 45kW',
  samplingIntervalMs: 1000,
  historyBufferSize: 60,
  sensorNoiseEnabled: true,
  thresholds: DEFAULT_THRESHOLDS,
  soundAlertsEnabled: false,
  darkTheme: false,
  activeDataSource: 'simulation',
};

export const ASSET_METADATA: AssetMetadata = {
  id: 'MOTOR_45KW_001',
  name: '45 kW Three-Phase Induction Motor — Simulated Asset',
  type: 'Three-Phase Squirrel-Cage Induction Motor driving Centrifugal Feed Pump',
  ratedPowerKw: 45.0,
  ratedSpeedRpm: 1480,
  ratedCurrentA: 81.5,
  ratedVoltageV: 400,
  controller: 'SIMATIC S7-1500 CPU 1516-3 (Conceptual PLC Reference — Not Connected)',
  dataInterface: 'OPC UA Server (IEC 62541) — Prepared / Disconnected',
  edgePlatform: 'Industrial Edge IPC — Conceptual Architecture Reference',
  cloudPlatform: 'Cloud IoT Analytics Hub — Disconnected Architecture Reference',
  commissionDate: '2025-03-15',
  isoClass: 'Vibration Reference: ISO 10816-3 Class II (Rigid Foundation)',
  location: 'Bay 4 - Primary Cooling Water Pump House',
};

interface SimulationContextType {
  // Telemetry
  currentTelemetry: TelemetryPoint;
  telemetryHistory: TelemetryPoint[];
  sessionHistorian: TelemetryPoint[];
  digitalModelRef: DigitalModelReference;
  assetMetadata: AssetMetadata;
  
  // State & Controls
  isRunning: boolean;
  simulationSpeed: 1 | 2 | 5;
  operatingCondition: OperatingCondition;
  faultScenario: FaultScenario;
  sensorNoiseEnabled: boolean;
  
  // Actions
  setIsRunning: (running: boolean) => void;
  setSimulationSpeed: (speed: 1 | 2 | 5) => void;
  setOperatingCondition: (cond: OperatingCondition) => void;
  setFaultScenario: (scenario: FaultScenario) => void;
  setSensorNoiseEnabled: (enabled: boolean) => void;
  resetSimulation: () => void;
  
  // Connectivity & Sync
  isConnected: boolean;
  lastSyncTimestamp: string;
  secondsSinceLastSync: number;
  reconnectSync: () => void;
  
  // Alarms & Maintenance
  alarms: AlarmItem[];
  unacknowledgedAlarmCount: number;
  criticalAlarmCount: number;
  acknowledgeAlarm: (id: string) => void;
  resolveAlarm: (id: string) => void;
  acknowledgeAllAlarms: () => void;
  clearResolvedAlarms: () => void;
  maintenanceActions: MaintenanceAction[];
  
  // Hotspot selection
  selectedSensorId: string | null;
  setSelectedSensorId: (id: string | null) => void;
  sensorHotspots: SensorHotspot[];

  // Settings & Theme
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetSettings: () => void;
  toggleTheme: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

// Generate initial nominal history buffer
function createInitialHistory(): TelemetryPoint[] {
  const points: TelemetryPoint[] = [];
  const now = Date.now();
  for (let i = 59; i >= 0; i--) {
    const epoch = now - i * 1000;
    const date = new Date(epoch);
    const timeStr = date.toLocaleTimeString('en-US', { hour12: false });
    const speed = 1480 + (Math.sin(i * 0.2) * 1.5);
    const temp = 52.0 + (Math.cos(i * 0.1) * 0.4);
    const vibration = 1.1 + (Math.sin(i * 0.3) * 0.04);
    const current = 62.0 + (Math.sin(i * 0.25) * 0.5);
    const power = 34.2; // 76.0% nominal load of 45 kW rated
    const torque = calculateTorque(power, speed);
    const { score } = calculateAnomalyScore(speed, temp, vibration, current);
    const { rulHours, healthPct } = estimateRulHours(score, vibration, temp);

    points.push({
      timestamp: timeStr,
      epoch,
      speedRpm: Number(speed.toFixed(1)),
      statorTempC: Number(temp.toFixed(1)),
      bearingVibrationRms: Number(vibration.toFixed(2)),
      phaseCurrentA: Number(current.toFixed(1)),
      torqueNm: torque,
      anomalyScore: score,
      estimatedRulHours: rulHours,
      assetHealthPct: healthPct,
      powerKw: power,
      loadFactorPct: 76.0,
      pumpFlowM3h: 120.5,
      pumpPressureBar: 6.2,
      rawTempAdc: unscaleSiemensAnalog(temp),
      isStale: false,
    });
  }
  return points;
}

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persistent settings or default
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('industrial_twin_settings') || localStorage.getItem('siemens_twin_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  // Theme synchronization with document class
  useEffect(() => {
    if (settings.darkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('industrial_twin_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<1 | 2 | 5>(1);
  const [operatingCondition, setOperatingCondition] = useState<OperatingCondition>('medium_load');
  const [faultScenario, setFaultScenario] = useState<FaultScenario>('normal');
  const [sensorNoiseEnabled, setSensorNoiseEnabled] = useState<boolean>(settings.sensorNoiseEnabled);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>('sensor_vib_de');

  // Telemetry state
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>(createInitialHistory);
  const [currentTelemetry, setCurrentTelemetry] = useState<TelemetryPoint>(
    () => telemetryHistory[telemetryHistory.length - 1]
  );

  // Connection & sync state
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<string>(new Date().toLocaleTimeString());
  const [secondsSinceLastSync, setSecondsSinceLastSync] = useState<number>(0);

  // Alarms
  const [alarms, setAlarms] = useState<AlarmItem[]>(() => {
    try {
      const saved = localStorage.getItem('industrial_twin_alarms') || localStorage.getItem('siemens_twin_alarms');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('industrial_twin_alarms', JSON.stringify(alarms));
    } catch {
      // ignore
    }
  }, [alarms]);

  // Track scenario step progress for progressive ramp
  const scenarioStepRef = useRef<number>(0);
  const lastAlarmTimeRef = useRef<Record<string, number>>({});
  const conditionStartRef = useRef<Record<string, number>>({});

  // Long-term session historian buffer (up to 300 points) to power Historical Analytics
  const [sessionHistorian, setSessionHistorian] = useState<TelemetryPoint[]>(() => createInitialHistory());

  // Function to switch fault scenarios with progressive step reset
  const handleSetFaultScenario = useCallback((scenario: FaultScenario) => {
    scenarioStepRef.current = 0;
    setFaultScenario(scenario);
  }, []);

  // Digital Model Reference values (ideal physics expectation for operating condition)
  const digitalModelRef: DigitalModelReference = React.useMemo(() => {
    switch (operatingCondition) {
      case 'medium_load':
        return {
          speedRpm: 1480,
          statorTempC: 52.0,
          bearingVibrationRms: 1.10,
          phaseCurrentA: 62.0,
          actualPowerKw: 34.2,
          loadFactorPct: 76.0,
          torqueNm: calculateTorque(34.2, 1480), // 220.7 Nm (Nominal 76% load)
        };
      case 'idle':
        return {
          speedRpm: 1495,
          statorTempC: 36.0,
          bearingVibrationRms: 0.65,
          phaseCurrentA: 28.0,
          actualPowerKw: 11.2,
          loadFactorPct: 24.9,
          torqueNm: calculateTorque(11.2, 1495), // 71.5 Nm (25% recirc load)
        };
      case 'full_load':
      default:
        return {
          speedRpm: 1475,
          statorTempC: 68.0,
          bearingVibrationRms: 1.30,
          phaseCurrentA: 81.5,
          actualPowerKw: 45.0,
          loadFactorPct: 100.0,
          torqueNm: calculateTorque(45.0, 1475), // 291.4 Nm (100% rated output)
        };
    }
  }, [operatingCondition]);

  // Alarm evaluation with debouncing, duplicate suppression, and clearing hysteresis
  const evaluateAlarmChannel = useCallback(
    (
      sensor: string,
      subsystem: string,
      currentValue: number,
      unit: string,
      warningLimit: number,
      criticalLimit: number,
      clearingHysteresisDelta: number,
      warningDescription: string,
      criticalDescription: string,
      warningAction: string,
      criticalAction: string
    ) => {
      const now = Date.now();
      const timeStr = new Date(now).toLocaleTimeString('en-US', { hour12: false });
      const isCritical = currentValue >= criticalLimit;
      const isWarning = currentValue >= warningLimit;
      const isExceeded = isCritical || isWarning;
      const activeSeverity = isCritical ? 'critical' : 'warning';
      const activeThreshold = isCritical ? criticalLimit : warningLimit;
      const clearingThreshold = warningLimit - clearingHysteresisDelta;
      const description = isCritical ? criticalDescription : warningDescription;
      const suggestedAction = isCritical ? criticalAction : warningAction;

      // 1. Evaluate condition onset and debounce (require condition to hold for at least 1000ms)
      if (isExceeded) {
        if (!conditionStartRef.current[sensor]) {
          conditionStartRef.current[sensor] = now;
        }
        const conditionDuration = now - conditionStartRef.current[sensor];

        // Debounce: must persist for at least 800ms before generating alarm
        if (conditionDuration >= 800) {
          setAlarms((prev) => {
            const existingIdx = prev.findIndex(
              (a) => a.sensor === sensor && a.state !== 'resolved' && a.state !== 'historical'
            );

            if (existingIdx >= 0) {
              const existing = prev[existingIdx];
              // Update telemetry reading, severity escalation, and timestamp without duplicate record
              const updated = [...prev];
              const wasAcknowledged = existing.acknowledged;
              updated[existingIdx] = {
                ...existing,
                measuredValue: currentValue,
                severity: isCritical ? 'critical' : existing.severity,
                threshold: activeThreshold,
                clearingThreshold,
                description,
                suggestedAction,
                isActive: true,
                state: wasAcknowledged ? 'acknowledged' : 'active',
                lastRecurrenceAt: timeStr,
              };
              return updated;
            }

            // New alarm record
            const newAlarm: AlarmItem = {
              id: `ALM-${Math.floor(1000 + Math.random() * 9000)}-${sensor.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`,
              timestamp: timeStr,
              epoch: now,
              assetId: settings.assetId,
              sensor,
              subsystem,
              severity: activeSeverity,
              measuredValue: currentValue,
              unit,
              threshold: activeThreshold,
              clearingThreshold,
              description,
              suggestedAction,
              acknowledged: false,
              resolved: false,
              isActive: true,
              state: 'active',
            };

            return [newAlarm, ...prev.slice(0, 99)];
          });
        }
      } else {
        // Value is not exceeded. Reset condition start ref
        conditionStartRef.current[sensor] = 0;

        // Check if value has dropped below clearing threshold (hysteresis) to automatically resolve
        if (currentValue <= clearingThreshold) {
          setAlarms((prev) => {
            const needsResolution = prev.some(
              (a) => a.sensor === sensor && a.isActive && !a.resolved
            );
            if (!needsResolution) return prev;

            return prev.map((a) => {
              if (a.sensor === sensor && a.isActive && !a.resolved) {
                return {
                  ...a,
                  isActive: false,
                  resolved: true,
                  resolvedAt: timeStr,
                  state: 'resolved',
                  measuredValue: currentValue,
                };
              }
              return a;
            });
          });
        }
      }
    },
    [settings.assetId]
  );

  // Simulation tick logic
  useEffect(() => {
    if (!isRunning) return;

    const intervalTime = Math.max(200, settings.samplingIntervalMs / simulationSpeed);

    const timer = setInterval(() => {
      // Check communication fault
      if (faultScenario === 'comm_interruption') {
        setIsConnected(false);
        setSecondsSinceLastSync((prev) => prev + 1);
        setCurrentTelemetry((prev) => ({
          ...prev,
          isStale: true,
        }));
        return;
      } else {
        if (!isConnected) {
          setIsConnected(true);
        }
        setSecondsSinceLastSync(0);
        setLastSyncTimestamp(new Date().toLocaleTimeString('en-US', { hour12: false }));
      }

      scenarioStepRef.current += 1;
      const step = scenarioStepRef.current;
      const noiseAmp = sensorNoiseEnabled ? 1 : 0.05;
      const randomNoise = (Math.random() - 0.5) * noiseAmp;

      // Base targets according to operating condition
      let targetSpeed = digitalModelRef.speedRpm;
      let targetTemp = digitalModelRef.statorTempC;
      let targetVib = digitalModelRef.bearingVibrationRms;
      let targetCurrent = digitalModelRef.phaseCurrentA;
      let targetPower = digitalModelRef.actualPowerKw;
      let targetFlow = 120.5;
      let targetPressure = 6.2;

      // Apply fault scenario progressive offsets
      // Progressively ramp up over 10-20 steps
      const progress = Math.min(1, step / 15);

      switch (faultScenario) {
        case 'bearing_degradation':
          // Vibration ramps significantly; temp and current slightly increase
          targetVib += (5.2 - digitalModelRef.bearingVibrationRms) * progress;
          targetTemp += 14 * progress;
          targetCurrent += 4.5 * progress;
          break;

        case 'motor_overheating':
          // Thermal runaway due to fan shroud blockage / high ambient
          targetTemp += (94.0 - digitalModelRef.statorTempC) * progress;
          targetCurrent += 6.5 * progress;
          targetVib += 0.4 * progress;
          break;

        case 'excessive_current':
          // Impeller binding or high fluid viscosity load
          targetCurrent += (98.0 - digitalModelRef.phaseCurrentA) * progress;
          targetPower = 48.2 * progress + digitalModelRef.actualPowerKw * (1 - progress);
          targetTemp += 18.0 * progress;
          targetSpeed -= 45.0 * progress;
          targetPressure += 1.8 * progress;
          break;

        case 'speed_deviation':
          // VFD slip instability or encoder hunting
          targetSpeed -= 95.0 * progress + Math.sin(step * 0.8) * 45;
          targetVib += 0.8 * progress;
          targetCurrent += 8.0 * progress;
          break;

        case 'sensor_noise':
          // High EMI spikes without genuine physical distress
          targetVib += (Math.random() - 0.5) * 3.2;
          targetCurrent += (Math.random() - 0.5) * 18.0;
          break;

        case 'combined_fault':
          // Severe compound failure: bearing seizure leading to thermal runaway and stall
          targetVib += (7.2 - digitalModelRef.bearingVibrationRms) * progress;
          targetTemp += (102.0 - digitalModelRef.statorTempC) * progress;
          targetCurrent += (105.0 - digitalModelRef.phaseCurrentA) * progress;
          targetSpeed -= 110.0 * progress;
          targetPower = 52.0;
          break;

        case 'normal':
        default:
          // Stay nominal
          break;
      }

      // Add small realistic harmonic fluctuations
      const nowEpoch = Date.now();
      const timeStr = new Date(nowEpoch).toLocaleTimeString('en-US', { hour12: false });
      const finalSpeed = Math.max(0, targetSpeed + Math.sin(step * 0.15) * 1.8 + randomNoise * 0.8);
      const finalTemp = Math.max(15, targetTemp + Math.cos(step * 0.08) * 0.3 + randomNoise * 0.2);
      const finalVib = Math.max(0.1, targetVib + Math.sin(step * 0.25) * 0.05 + randomNoise * 0.08);
      const finalCurrent = Math.max(0, targetCurrent + Math.sin(step * 0.2) * 0.6 + randomNoise * 0.4);
      const finalTorque = calculateTorque(targetPower, finalSpeed);

      // Continuous Alarm Evaluation with Thresholds, Debounce & Hysteresis
      // Channel 1: Drive-End Bearing Vibration
      evaluateAlarmChannel(
        'Drive-End Bearing',
        'Mechanical Transmission',
        Number(finalVib.toFixed(2)),
        'mm/s RMS',
        settings.thresholds.vibrationWarning,
        settings.thresholds.vibrationCritical,
        0.4, // 0.4 mm/s clearing hysteresis
        `Drive-end vibration elevated (> ${settings.thresholds.vibrationWarning} mm/s RMS). ISO 10816 Zone C warning limit referenced.`,
        `CRITICAL VIBRATION: Drive-end bearing exceeded trip envelope (> ${settings.thresholds.vibrationCritical} mm/s RMS). ISO 10816 Zone D.`,
        'Schedule lubrication and perform high-frequency FFT acceleration envelope analysis.',
        'Simulated Trip: Inspect DE rolling-element bearing for outer raceway spalling and isolate motor.'
      );

      // Channel 2: Stator Winding Temperature (PT100)
      evaluateAlarmChannel(
        'Stator Winding PT100',
        'Electrical Stator',
        Number(finalTemp.toFixed(1)),
        '°C',
        settings.thresholds.tempWarning,
        settings.thresholds.tempCritical,
        4.0, // 4°C clearing hysteresis
        `Stator winding temp elevated (> ${settings.thresholds.tempWarning}°C). Approaching Class F service limit.`,
        `CRITICAL TEMPERATURE: Stator winding exceeded thermal limit (> ${settings.thresholds.tempCritical}°C). Insulation breakdown risk.`,
        'Verify cooling fan cowl airflow clearance and check motor terminal box phase connections.',
        'Simulated Trip: Isolate 400V circuit breaker and verify motor thermal protection relay.'
      );

      // Channel 3: Phase Current (CT)
      evaluateAlarmChannel(
        'Hall-Effect Current CT',
        'Power Train',
        Number(finalCurrent.toFixed(1)),
        'A',
        settings.thresholds.currentWarning,
        settings.thresholds.currentCritical,
        5.0, // 5A clearing hysteresis
        `Phase current at ${finalCurrent.toFixed(1)} A exceeds warning limit (${settings.thresholds.currentWarning} A). Rated FLA: 81.5 A.`,
        `CRITICAL OVERCURRENT: Phase current at ${finalCurrent.toFixed(1)} A exceeds critical threshold (${settings.thresholds.currentCritical} A). Impeller surge or rotor binding.`,
        'Throttle discharge control valve and verify fluid viscosity and suction strainers.',
        'Simulated Trip: Initiate overload shutdown and inspect centrifugal pump impeller for foreign debris.'
      );

      // Channel 4: Shaft Optical Encoder (Speed Deviation)
      if (Math.abs(finalSpeed - 1480) > 60) {
        evaluateAlarmChannel(
          'Shaft Optical Encoder',
          'VFD Closed Loop Control',
          Number(finalSpeed.toFixed(0)),
          'RPM',
          1420,
          1350,
          25,
          'High slip ratio detected: motor shaft speed deviated > 4% from synchronous setpoint.',
          'CRITICAL SLIP: Severe speed stall detected on motor drive shaft.',
          'Check SINAMICS drive V/f slip compensation parameters and encoder pulse shield grounding.',
          'Simulated Trip: Inverter safe-stop triggered to prevent rotor thermal runaway.'
        );
      }

      // Anomaly score evaluated against calibrated baseline of the active operating load condition
      const { score } = calculateAnomalyScore(
        finalSpeed,
        finalTemp,
        finalVib,
        finalCurrent,
        {
          speed: digitalModelRef.speedRpm,
          temp: digitalModelRef.statorTempC,
          vibration: digitalModelRef.bearingVibrationRms,
          current: digitalModelRef.phaseCurrentA,
        }
      );
      const { rulHours, healthPct } = estimateRulHours(score, finalVib, finalTemp);

      const newPoint: TelemetryPoint = {
        timestamp: timeStr,
        epoch: nowEpoch,
        speedRpm: Number(finalSpeed.toFixed(1)),
        statorTempC: Number(finalTemp.toFixed(1)),
        bearingVibrationRms: Number(finalVib.toFixed(2)),
        phaseCurrentA: Number(finalCurrent.toFixed(1)),
        torqueNm: finalTorque,
        anomalyScore: score,
        estimatedRulHours: rulHours,
        assetHealthPct: healthPct,
        powerKw: Number(targetPower.toFixed(1)),
        loadFactorPct: Number(((targetPower / 45.0) * 100).toFixed(1)),
        pumpFlowM3h: Number(targetFlow.toFixed(1)),
        pumpPressureBar: Number(targetPressure.toFixed(2)),
        rawTempAdc: unscaleSiemensAnalog(finalTemp),
        isStale: false,
      };

      setCurrentTelemetry(newPoint);
      setTelemetryHistory((prev) => {
        const next = [...prev, newPoint];
        if (next.length > settings.historyBufferSize) {
          return next.slice(next.length - settings.historyBufferSize);
        }
        return next;
      });
      setSessionHistorian((prev) => {
        const next = [...prev, newPoint];
        if (next.length > 300) {
          return next.slice(next.length - 300);
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [
    isRunning,
    simulationSpeed,
    operatingCondition,
    faultScenario,
    sensorNoiseEnabled,
    settings,
    digitalModelRef,
    evaluateAlarmChannel,
    isConnected,
  ]);

  // Context reset action
  const resetSimulation = useCallback(() => {
    scenarioStepRef.current = 0;
    setFaultScenario('normal');
    setIsConnected(true);
    setSecondsSinceLastSync(0);
    const freshHistory = createInitialHistory();
    setTelemetryHistory(freshHistory);
    setCurrentTelemetry(freshHistory[freshHistory.length - 1]);
  }, []);

  const reconnectSync = useCallback(() => {
    setIsConnected(true);
    setFaultScenario('normal');
    setSecondsSinceLastSync(0);
    setLastSyncTimestamp(new Date().toLocaleTimeString('en-US', { hour12: false }));
    setCurrentTelemetry((prev) => ({ ...prev, isStale: false }));
  }, []);

  // Alarm management actions
  const acknowledgeAlarm = useCallback((id: string) => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    setAlarms((prev) =>
      prev.map((alm) =>
        alm.id === id
          ? {
              ...alm,
              acknowledged: true,
              acknowledgedAt: timeStr,
              state: alm.isActive ? 'acknowledged' : alm.state,
            }
          : alm
      )
    );
  }, []);

  const resolveAlarm = useCallback((id: string) => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    setAlarms((prev) =>
      prev.map((alm) =>
        alm.id === id
          ? {
              ...alm,
              acknowledged: true,
              resolved: true,
              resolvedAt: timeStr,
              isActive: false,
              state: 'resolved',
            }
          : alm
      )
    );
  }, []);

  const acknowledgeAllAlarms = useCallback(() => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    setAlarms((prev) =>
      prev.map((alm) =>
        !alm.acknowledged
          ? {
              ...alm,
              acknowledged: true,
              acknowledgedAt: timeStr,
              state: alm.isActive ? 'acknowledged' : alm.state,
            }
          : alm
      )
    );
  }, []);

  // History-management: archive resolved alarms into historical state without destroying audit records
  const clearResolvedAlarms = useCallback(() => {
    setAlarms((prev) =>
      prev.map((alm) => (alm.resolved ? { ...alm, state: 'historical' } : alm))
    );
  }, []);

  const unacknowledgedAlarmCount = alarms.filter((a) => !a.acknowledged && !a.resolved).length;
  const criticalAlarmCount = alarms.filter((a) => a.severity === 'critical' && !a.resolved).length;

  // Settings update
  const updateSettings = useCallback((newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings((prev) => ({ ...prev, darkTheme: !prev.darkTheme }));
  }, []);

  // Dynamically generated sensor hotspots based on current telemetry
  const sensorHotspots: SensorHotspot[] = React.useMemo(() => {
    const vibStatus =
      currentTelemetry.bearingVibrationRms >= settings.thresholds.vibrationCritical
        ? 'critical'
        : currentTelemetry.bearingVibrationRms >= settings.thresholds.vibrationWarning
        ? 'warning'
        : 'nominal';

    const tempStatus =
      currentTelemetry.statorTempC >= settings.thresholds.tempCritical
        ? 'critical'
        : currentTelemetry.statorTempC >= settings.thresholds.tempWarning
        ? 'warning'
        : 'nominal';

    const currentStatus =
      currentTelemetry.phaseCurrentA >= settings.thresholds.currentCritical
        ? 'critical'
        : currentTelemetry.phaseCurrentA >= settings.thresholds.currentWarning
        ? 'warning'
        : 'nominal';

    const speedStatus =
      Math.abs(currentTelemetry.speedRpm - 1480) > 70 ? 'warning' : 'nominal';

    return [
      {
        id: 'sensor_vib_de',
        name: 'Drive-End Tri-Axial Accelerometer',
        tag: 'ACC-101-DE',
        type: 'Piezoelectric Accelerometer (IEPE)',
        location: 'Motor Drive-End Bearing Housing',
        currentValue: currentTelemetry.bearingVibrationRms,
        unit: 'mm/s RMS',
        normalRange: [0.5, 2.3],
        warningThreshold: settings.thresholds.vibrationWarning,
        criticalThreshold: settings.thresholds.vibrationCritical,
        status: vibStatus,
        description: 'Simulates high-frequency velocity RMS across radial and axial planes (referenced to ISO 10816-3 for educational comparison).',
        plcChannel: 'ET 200SP AI 4xVIB / SM 1281 Condition Monitoring (Simulated)',
        xPercent: 57,
        yPercent: 62,
      },
      {
        id: 'sensor_temp_stator',
        name: 'Stator Winding RTD PT100',
        tag: 'TE-202-NDE',
        type: '4-Wire Platinum RTD (DIN EN 60751)',
        location: 'Non-Drive-End Stator Slot Core',
        currentValue: currentTelemetry.statorTempC,
        unit: '°C',
        normalRange: [40, 65],
        warningThreshold: settings.thresholds.tempWarning,
        criticalThreshold: settings.thresholds.tempCritical,
        status: tempStatus,
        description: 'Simulated winding temperature channel protecting Class F insulation (limit 155°C).',
        plcChannel: 'SIMATIC S7-1500 AI 8xU/I/RTD/TC ST (Address %IW12 — Simulated)',
        xPercent: 28,
        yPercent: 48,
      },
      {
        id: 'sensor_current_ct',
        name: 'Phase Current Transformer (CT)',
        tag: 'CT-303-PHASE-U',
        type: 'Hall-Effect Current Transducer (0-100A / 4-20mA)',
        location: 'Motor Main Terminal Box',
        currentValue: currentTelemetry.phaseCurrentA,
        unit: 'A',
        normalRange: [45, 68],
        warningThreshold: settings.thresholds.currentWarning,
        criticalThreshold: settings.thresholds.currentCritical,
        status: currentStatus,
        description: 'Simulated RMS phase current channel detecting unbalance, overloads, and rotor bar faults.',
        plcChannel: 'ET 200SP AI 4xI 2-wire 4-20mA (%IW16 — Simulated)',
        xPercent: 36,
        yPercent: 25,
      },
      {
        id: 'sensor_speed_enc',
        name: 'Optical Shaft Encoder / Tachometer',
        tag: 'SE-404-SHAFT',
        type: 'Incremental Optical Encoder (1024 PPR)',
        location: 'Coupling Guard Intermediate Hub',
        currentValue: currentTelemetry.speedRpm,
        unit: 'RPM',
        normalRange: [1460, 1495],
        warningThreshold: 1420,
        criticalThreshold: 1350,
        status: speedStatus,
        description: 'Simulated shaft speed measurement determining motor slip and VFD torque response.',
        plcChannel: 'SIMATIC S7-1500 High-Speed Counter TM Count 2x24V (%ID20 — Simulated)',
        xPercent: 69,
        yPercent: 63,
      },
      {
        id: 'sensor_pump_press',
        name: 'Discharge Pressure Transmitter',
        tag: 'PT-505-PUMP-OUT',
        type: 'Piezoresistive Pressure Transmitter (0-16 bar)',
        location: 'Centrifugal Pump Volute Discharge Flange',
        currentValue: currentTelemetry.pumpPressureBar,
        unit: 'bar',
        normalRange: [5.5, 6.8],
        warningThreshold: 7.5,
        criticalThreshold: 8.5,
        status: 'nominal',
        description: 'Simulated pump discharge head pressure channel to calculate hydraulic duty point.',
        plcChannel: 'Pressure Transmitter (%IW24 — Simulated)',
        xPercent: 88,
        yPercent: 35,
      },
    ];
  }, [currentTelemetry, settings.thresholds]);

  // Contextual Prescriptive Maintenance Actions based on fault condition
  const maintenanceActions: MaintenanceAction[] = React.useMemo(() => {
    const list: MaintenanceAction[] = [];
    const nowStr = new Date().toLocaleTimeString('en-US', { hour12: false });

    if (currentTelemetry.bearingVibrationRms >= settings.thresholds.vibrationWarning) {
      const isCrit = currentTelemetry.bearingVibrationRms >= settings.thresholds.vibrationCritical;
      list.push({
        id: 'MA-01-BEARING',
        priority: isCrit ? 'immediate' : 'high',
        title: 'Deep Groove Ball Bearing Inspection & Lubrication',
        component: 'Drive-End Bearing 6312-C3',
        triggerReason: `DE Vibration RMS (${currentTelemetry.bearingVibrationRms} mm/s) exceeded limit (${settings.thresholds.vibrationWarning} mm/s). ISO 10816 Zone ${isCrit ? 'D' : 'C'}.`,
        recommendedAction: 'Perform high-frequency FFT vibration analysis to isolate BPFO/BPFI harmonics. Apply 35g of lithium complex grease or schedule bearing replacement.',
        targetWindowHours: isCrit ? 12 : 72,
        estimatedDowntimeHours: 4,
        createdTimestamp: nowStr,
      });
    }

    if (currentTelemetry.statorTempC >= settings.thresholds.tempWarning) {
      const isCrit = currentTelemetry.statorTempC >= settings.thresholds.tempCritical;
      list.push({
        id: 'MA-02-THERMAL',
        priority: isCrit ? 'immediate' : 'medium',
        title: 'Air Intake Shroud & Cooling Cowl De-clogging',
        component: 'Stator Cooling System & External Fan',
        triggerReason: `Winding temperature (${currentTelemetry.statorTempC} °C) elevated above normal operating envelope.`,
        recommendedAction: 'Inspect external fan cowl for fibrous dust accumulation. Measure motor insulation resistance (Megger test 500V DC).',
        targetWindowHours: isCrit ? 24 : 120,
        estimatedDowntimeHours: 1.5,
        createdTimestamp: nowStr,
      });
    }

    if (currentTelemetry.phaseCurrentA >= settings.thresholds.currentWarning) {
      list.push({
        id: 'MA-03-HYDRAULIC',
        priority: 'high',
        title: 'Centrifugal Pump Impeller & Fluid Resistance Check',
        component: 'Centrifugal Pump Volute & Impeller',
        triggerReason: `Phase current (${currentTelemetry.phaseCurrentA} A) exceeds nominal continuous baseline (62.0 A).`,
        recommendedAction: 'Check discharge control valve positioning. Inspect pump suction strainer for debris clogging causing hydraulic cavitation or motor overload.',
        targetWindowHours: 48,
        estimatedDowntimeHours: 2.5,
        createdTimestamp: nowStr,
      });
    }

    if (list.length === 0) {
      list.push({
        id: 'MA-00-PREVENTIVE',
        priority: 'low',
        title: 'Routine Condition Monitoring Interval Inspection',
        component: 'Asset MOTOR_45KW_001 Complete Train',
        triggerReason: 'Asset operating strictly within nominal ISO parameters.',
        recommendedAction: 'Continue continuous OPC UA high-frequency telemetry logging. Next scheduled manual thermography audit in 420 operating hours.',
        targetWindowHours: 420,
        estimatedDowntimeHours: 0,
        createdTimestamp: nowStr,
      });
    }

    return list;
  }, [currentTelemetry, settings.thresholds]);

  return (
    <SimulationContext.Provider
      value={{
        currentTelemetry,
        telemetryHistory,
        sessionHistorian,
        digitalModelRef,
        assetMetadata: ASSET_METADATA,
        isRunning,
        simulationSpeed,
        operatingCondition,
        faultScenario,
        sensorNoiseEnabled,
        setIsRunning,
        setSimulationSpeed,
        setOperatingCondition,
        setFaultScenario: handleSetFaultScenario,
        setSensorNoiseEnabled,
        resetSimulation,
        isConnected,
        lastSyncTimestamp,
        secondsSinceLastSync,
        reconnectSync,
        alarms,
        unacknowledgedAlarmCount,
        criticalAlarmCount,
        acknowledgeAlarm,
        resolveAlarm,
        acknowledgeAllAlarms,
        clearResolvedAlarms,
        maintenanceActions,
        selectedSensorId,
        setSelectedSensorId,
        sensorHotspots,
        settings,
        updateSettings,
        resetSettings,
        toggleTheme,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export function useSimulation(): SimulationContextType {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
