export interface ThresholdSettings {
  vibrationWarning: number; // mm/s RMS (ISO 10816 Zone B boundary, e.g. 2.8)
  vibrationCritical: number; // mm/s RMS (ISO 10816 Zone C/D boundary, e.g. 4.5)
  tempWarning: number; // °C (e.g. 75)
  tempCritical: number; // °C (e.g. 90)
  currentWarning: number; // A (e.g. 75)
  currentCritical: number; // A (e.g. 90)
  anomalyWarning: number; // 0 to 1 (e.g. 0.35)
  anomalyCritical: number; // 0 to 1 (e.g. 0.65)
}

export interface SystemSettings {
  assetId: string;
  assetName: string;
  samplingIntervalMs: number; // 500, 1000, 2000
  historyBufferSize: number; // 30, 60, 120
  sensorNoiseEnabled: boolean;
  thresholds: ThresholdSettings;
  soundAlertsEnabled: boolean;
  darkTheme: boolean;
  activeDataSource: 'simulation' | 'edge_mqtt_gateway' | 'opcua_rest';
}
