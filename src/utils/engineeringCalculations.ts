/**
 * Industrial Automation & Motor Engineering Calculations
 * Educational Prototype — ISO 10816-3 & S7-1500 Concepts Referenced
 */

/**
 * Calculates mechanical shaft torque from mechanical power and rotational speed.
 * Formula: T (Nm) = 9550 * P (kW) / N (RPM)
 */
export function calculateTorque(powerKw: number, speedRpm: number): number {
  if (speedRpm <= 0) return 0;
  return Number(((9550 * powerKw) / speedRpm).toFixed(1));
}

/**
 * Scales standard PLC raw analog input word (0 to 27648 integer range)
 * to engineering units (e.g. 0°C to 150°C for RTD module).
 */
export function scalePlcAnalogRaw(
  rawWord: number,
  engineeringRangeMin: number = 0,
  engineeringRangeMax: number = 150
): number {
  const clampedRaw = Math.max(0, Math.min(27648, rawWord));
  const span = engineeringRangeMax - engineeringRangeMin;
  const scaled = engineeringRangeMin + (clampedRaw / 27648) * span;
  return Number(scaled.toFixed(1));
}

export const scaleSiemensAnalogRaw = scalePlcAnalogRaw;

/**
 * Converts engineering temperature to PLC raw integer word (0 to 27648).
 */
export function unscalePlcAnalog(
  tempC: number,
  engineeringRangeMin: number = 0,
  engineeringRangeMax: number = 150
): number {
  const span = engineeringRangeMax - engineeringRangeMin;
  const fraction = Math.max(0, Math.min(1, (tempC - engineeringRangeMin) / span));
  return Math.round(fraction * 27648);
}

export const unscaleSiemensAnalog = unscalePlcAnalog;

/**
 * Deterministic multi-variable anomaly scoring function.
 * Evaluates deviations across vibration, temperature, current, and speed
 * weighted against ISO 10816-3 industrial guidelines and baseline parameters.
 * Output is normalized [0, 1.0].
 */
export function calculateAnomalyScore(
  speedRpm: number,
  tempC: number,
  vibrationRms: number,
  currentA: number,
  baseline = { speed: 1480, temp: 52, vibration: 1.1, current: 62 }
): {
  score: number;
  contributions: {
    vibrationPct: number;
    tempPct: number;
    currentPct: number;
    speedPct: number;
  };
} {
  // Normalized deviations with sensitivity factors relative to operating point baseline
  const dVib = Math.max(0, (vibrationRms - baseline.vibration) / 2.5); // high sensitivity for ISO 10816
  const dTemp = Math.max(0, (tempC - baseline.temp) / 32.0);
  const dCurrent = Math.max(0, (currentA - baseline.current) / 22.0);
  const dSpeed = Math.abs(speedRpm - baseline.speed) / 90.0;

  // Weighted quadratic aggregation (weights sum to 1.0)
  // Vibration is 45%, Temp 25%, Current 20%, Speed 10%
  const wVib = 0.45;
  const wTemp = 0.25;
  const wCurrent = 0.20;
  const wSpeed = 0.10;

  const rawSum =
    wVib * Math.pow(dVib, 1.8) +
    wTemp * Math.pow(dTemp, 1.5) +
    wCurrent * Math.pow(dCurrent, 1.5) +
    wSpeed * Math.pow(dSpeed, 1.5);

  const score = Number(Math.min(1.0, Math.max(0.015, rawSum)).toFixed(3));

  // Individual component contributions
  const total = (wVib * dVib) + (wTemp * dTemp) + (wCurrent * dCurrent) + (wSpeed * dSpeed) + 0.0001;
  const vibrationPct = Math.round(((wVib * dVib) / total) * 100);
  const tempPct = Math.round(((wTemp * dTemp) / total) * 100);
  const currentPct = Math.round(((wCurrent * dCurrent) / total) * 100);
  const speedPct = Math.max(0, 100 - (vibrationPct + tempPct + currentPct));

  return {
    score,
    contributions: { vibrationPct, tempPct, currentPct, speedPct },
  };
}

/**
 * Calculates genuine 2-sigma (95.4%) statistical confidence intervals
 * over a rolling time-series window.
 */
export function calculateStatisticalBounds(values: number[]): {
  mean: number;
  stdDev: number;
  lower2Sigma: number;
  upper2Sigma: number;
} {
  if (!values || values.length === 0) {
    return { mean: 0, stdDev: 0, lower2Sigma: 0, upper2Sigma: 0 };
  }
  const sum = values.reduce((acc, v) => acc + v, 0);
  const mean = sum / values.length;
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return {
    mean: Number(mean.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    lower2Sigma: Number(Math.max(0, mean - 2 * stdDev).toFixed(2)),
    upper2Sigma: Number((mean + 2 * stdDev).toFixed(2)),
  };
}

/**
 * Calculates Estimated Remaining Useful Life (RUL) in hours based on
 * cumulative stress penalty from ISO vibration severity and thermal degradation.
 * Baseline healthy motor rated L10h bearing life ~ 20,000h (nominal 8,500h current inspection cycle).
 */
export function estimateRulHours(
  anomalyScore: number,
  vibrationRms: number,
  tempC: number
): {
  rulHours: number;
  healthPct: number;
} {
  const nominalRul = 8500;

  // Vibration exponential stress factor (Paris Law approximation)
  const vibStressFactor = Math.max(1, Math.pow(vibrationRms / 1.1, 1.6));
  // Arrhenius thermal factor (10-degree rule: life halves for every 10°C over nominal)
  const thermalOverNominal = Math.max(0, tempC - 52);
  const thermalFactor = Math.pow(2, thermalOverNominal / 18.0);

  const combinedFactor = (vibStressFactor * 0.6) + (thermalFactor * 0.4);
  const degradedRul = Math.max(48, Math.round(nominalRul / Math.max(1, combinedFactor * (1 + anomalyScore * 2.5))));

  // Overall asset health percentage 0 to 100
  const healthPct = Math.max(5, Math.min(100, Math.round(100 - anomalyScore * 95)));

  return {
    rulHours: degradedRul,
    healthPct,
  };
}

/**
 * Export array of telemetry records to downloadable CSV file
 */
export function exportTelemetryToCsv(data: Record<string, any>[], filename = 'motor_telemetry_export.csv') {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((field) => {
      const val = row[field];
      if (typeof val === 'string' && val.includes(',')) {
        return `"${val}"`;
      }
      return val ?? '';
    }).join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
