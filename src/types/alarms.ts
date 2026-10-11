export type AlarmSeverity = 'info' | 'warning' | 'critical';
export type AlarmState = 'active' | 'acknowledged' | 'resolved' | 'historical';

export interface AlarmItem {
  id: string;
  timestamp: string;
  epoch: number;
  assetId: string;
  sensor: string;
  subsystem: string;
  severity: AlarmSeverity;
  measuredValue: number;
  unit: string;
  threshold: number;
  clearingThreshold?: number;
  description: string;
  suggestedAction: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedAt?: string;
  isActive: boolean; // condition currently exists above clearing threshold
  state: AlarmState; // 'active' | 'acknowledged' | 'resolved' | 'historical'
  lastRecurrenceAt?: string;
}

export interface MaintenanceAction {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'immediate';
  title: string;
  component: string;
  triggerReason: string;
  recommendedAction: string;
  targetWindowHours: number;
  estimatedDowntimeHours: number;
  createdTimestamp: string;
}
