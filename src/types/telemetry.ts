export type FaultScenario =
  | 'normal'
  | 'bearing_degradation'
  | 'motor_overheating'
  | 'excessive_current'
  | 'speed_deviation'
  | 'sensor_noise'
  | 'comm_interruption'
  | 'combined_fault';

export type OperatingCondition = 'full_load' | 'medium_load' | 'idle';

export interface TelemetryPoint {
  timestamp: string; // ISO or formatted HH:mm:ss
  epoch: number;
  speedRpm: number;
  statorTempC: number;
  bearingVibrationRms: number; // mm/s RMS (ISO 10816-3)
  phaseCurrentA: number;
  torqueNm: number; // Calculated: 9550 * powerKw / speedRpm
  anomalyScore: number; // 0 to 1
  estimatedRulHours: number;
  assetHealthPct: number; // 0 to 100
  powerKw: number; // Actual operating mechanical output power (e.g. 34.2 kW at 76% load)
  loadFactorPct: number; // Actual power / Rated 45kW * 100
  pumpFlowM3h: number;
  pumpPressureBar: number;
  rawTempAdc: number; // 0-27648 PLC analog raw
  isStale?: boolean;
}

export interface DigitalModelReference {
  speedRpm: number;
  statorTempC: number;
  bearingVibrationRms: number;
  phaseCurrentA: number;
  torqueNm: number;
  actualPowerKw: number;
  loadFactorPct: number;
}

export interface AssetMetadata {
  id: string;
  name: string;
  type: string;
  ratedPowerKw: number;
  ratedSpeedRpm: number;
  ratedCurrentA: number;
  ratedVoltageV: number;
  controller: string;
  dataInterface: string;
  edgePlatform: string;
  cloudPlatform: string;
  commissionDate: string;
  isoClass: string;
  location: string;
}

export interface SensorHotspot {
  id: string;
  name: string;
  tag: string;
  type: string;
  location: string;
  currentValue: number;
  unit: string;
  normalRange: [number, number];
  warningThreshold: number;
  criticalThreshold: number;
  status: 'nominal' | 'warning' | 'critical';
  description: string;
  plcChannel: string;
  xPercent: number;
  yPercent: number;
}
