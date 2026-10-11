import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Eye, Info, Sparkles, Layers, Sliders, AlertCircle } from 'lucide-react';

export const InteractiveMotorTwin: React.FC = () => {
  const {
    currentTelemetry,
    sensorHotspots,
    selectedSensorId,
    setSelectedSensorId,
    faultScenario,
  } = useSimulation();

  const [showCutaway, setShowCutaway] = useState<boolean>(false);
  const [showDataFlow, setShowDataFlow] = useState<boolean>(true);

  // Rotation duration based on RPM (e.g. 1480 RPM -> 24.6 rev/sec -> 0.04s per rev, scaled for visual clarity to 0.8s)
  const rotationDuration = currentTelemetry.speedRpm > 100
    ? `${(1480 / Math.max(100, currentTelemetry.speedRpm)) * 0.8}s`
    : '0s';

  const selectedSensor = sensorHotspots.find((s) => s.id === selectedSensorId) || sensorHotspots[0];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col gap-4">
      {/* Top Twin Controls & View toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              Digital Twin 3D/Schematic Representation
            </h3>
            <span className="text-[11px] font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
              45 kW Three-Phase Induction Motor — Simulated Asset
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive virtual model linked to local simulated telemetry engine. Click sensor targets to inspect.
          </p>
        </div>

        {/* View toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCutaway(!showCutaway)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showCutaway
                ? 'bg-teal-700 text-white border-teal-700'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {showCutaway ? 'Cutaway View Active' : 'Cutaway Internal View'}
          </button>

          <button
            onClick={() => setShowDataFlow(!showDataFlow)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showDataFlow
                ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-700'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            {showDataFlow ? 'Sensor Pulses On' : 'Pulses Off'}
          </button>
        </div>
      </div>

      {/* Main Motor Twin Canvas */}
      <div className="relative w-full h-[380px] sm:h-[420px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-4">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(45, 212, 191, 0.4) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Coordinate Legend / Industrial Axis overlay */}
        <div className="absolute top-4 left-4 text-[10px] font-mono text-slate-400 space-y-0.5 pointer-events-none bg-slate-900/80 p-2 rounded border border-slate-800/80 backdrop-blur-xs">
          <div>ASSET: MOTOR-45KW-FEED-PUMP (Simulated Asset)</div>
          <div>FRAME: 225M-4 | IP55 | IC411</div>
          <div className="text-teal-400">SYNC: 1480 RPM (50 Hz)</div>
          <div className="text-slate-500">BASE: Rigid Bedplate (Vibration Ref: ISO 10816-3 Class II)</div>
        </div>

        {/* Rotation indicator badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 backdrop-blur-xs">
          <div
            className="w-3.5 h-3.5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"
            style={{ animationDuration: currentTelemetry.speedRpm > 50 ? rotationDuration : '0s' }}
          />
          <span>{currentTelemetry.speedRpm.toFixed(0)} RPM</span>
        </div>

        {/* High-Precision SVG Industrial Assembly */}
        <svg
          viewBox="0 0 1000 520"
          className="w-full h-full max-h-[380px] drop-shadow-2xl select-none"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="motorBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2A4365" />
              <stop offset="40%" stopColor="#1E3A5F" />
              <stop offset="70%" stopColor="#172E4C" />
              <stop offset="100%" stopColor="#0F1E33" />
            </linearGradient>

            <linearGradient id="finGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4A6B94" />
              <stop offset="100%" stopColor="#1E324E" />
            </linearGradient>

            <linearGradient id="pumpGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#319795" />
              <stop offset="50%" stopColor="#285E61" />
              <stop offset="100%" stopColor="#1D4044" />
            </linearGradient>

            <linearGradient id="steelShaftGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="30%" stopColor="#CBD5E1" />
              <stop offset="70%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>

            <linearGradient id="baseplateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>

            <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10B981" />
            </filter>
            <filter id="glowAmber" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#F59E0B" />
            </filter>
            <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#EF4444" />
            </filter>
          </defs>

          {/* 1. Heavy Baseplate Frame (I-Beam mounting skid) */}
          <rect x="100" y="380" width="800" height="45" rx="4" fill="url(#baseplateGrad)" stroke="#475569" strokeWidth="2" />
          <rect x="100" y="425" width="800" height="15" fill="#0F172A" />
          {/* Foundation Anchor Bolts */}
          <circle cx="140" cy="402" r="5" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
          <circle cx="480" cy="402" r="5" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
          <circle cx="860" cy="402" r="5" fill="#94A3B8" stroke="#475569" strokeWidth="2" />

          {/* 2. Non-Drive-End (NDE) Fan Cowl / Air Shroud */}
          <path
            d="M 170 190 Q 150 190 140 210 L 140 330 Q 150 350 170 350 Z"
            fill="#1E293B"
            stroke="#475569"
            strokeWidth="2"
          />
          {/* Fan Cowl Grille slots */}
          <line x1="148" y1="220" x2="148" y2="320" stroke="#334155" strokeWidth="3" />
          <line x1="156" y1="210" x2="156" y2="330" stroke="#334155" strokeWidth="3" />

          {/* 3. Motor Stator Frame (Finned Housing) */}
          <rect x="170" y="175" width="310" height="190" rx="8" fill="url(#motorBodyGrad)" stroke="#38B2AC" strokeWidth="1.5" />

          {/* Stator Cooling Fins (Exterior heat dissipation ribs) */}
          {!showCutaway && (
            <>
              {[200, 220, 240, 260, 280, 300, 320, 340].map((yVal, idx) => (
                <rect
                  key={idx}
                  x="180"
                  y={yVal}
                  width="290"
                  height="7"
                  rx="2"
                  fill="url(#finGrad)"
                  stroke="#334E68"
                  strokeWidth="0.5"
                />
              ))}
            </>
          )}

          {/* Cutaway Internal Stator & Rotor View */}
          {showCutaway && (
            <g>
              {/* Stator Core Laminations */}
              <rect x="195" y="195" width="260" height="150" fill="#1A202C" stroke="#718096" strokeWidth="1" />
              {/* Copper Stator Windings */}
              <rect x="210" y="205" width="230" height="25" fill="#C05621" opacity="0.9" />
              <rect x="210" y="310" width="230" height="25" fill="#C05621" opacity="0.9" />
              <text x="325" y="222" fill="#FED7D7" fontSize="10" textAnchor="middle" fontFamily="monospace">
                COPPER WINDINGS (CLASS F)
              </text>
              {/* Squirrel Cage Rotor Core */}
              <rect x="225" y="238" width="200" height="64" fill="#4A5568" stroke="#A0AEC0" strokeWidth="1.5" />
              <text x="325" y="275" fill="#E2E8F0" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                SQUIRREL-CAGE ROTOR
              </text>
            </g>
          )}

          {/* Motor Mounting Feet */}
          <rect x="180" y="360" width="45" height="22" fill="#1A365D" stroke="#475569" strokeWidth="1.5" />
          <rect x="420" y="360" width="45" height="22" fill="#1A365D" stroke="#475569" strokeWidth="1.5" />

          {/* 4. Terminal Box on top of motor with Cable Gland */}
          <rect x="250" y="110" width="120" height="65" rx="4" fill="#1A365D" stroke="#319795" strokeWidth="1.5" />
          <rect x="260" y="98" width="100" height="12" rx="2" fill="#2D3748" stroke="#4A5568" strokeWidth="1" />
          {/* Cable entry gland */}
          <rect x="290" y="75" width="40" height="23" fill="#4A5568" />
          <path d="M 310 75 Q 310 40 280 20" stroke="#CBD5E0" strokeWidth="8" fill="none" strokeDasharray="4 2" />
          <text x="310" y="145" fill="#E2E8F0" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            400V 3~ TERM BOX
          </text>

          {/* 5. Drive-End (DE) Bearing Housing Flange */}
          <path
            d="M 480 200 L 520 220 L 520 320 L 480 340 Z"
            fill="#1E293B"
            stroke="#64748B"
            strokeWidth="2"
          />
          {/* Bearing Housing Ring */}
          <circle cx="500" cy="270" r="28" fill="#334155" stroke="#94A3B8" strokeWidth="2" />
          <circle cx="500" cy="270" r="16" fill="#1E293B" stroke="#64748B" strokeWidth="1.5" />

          {/* 6. Rotating Steel Shaft */}
          <rect x="520" y="258" width="85" height="24" fill="url(#steelShaftGrad)" stroke="#475569" strokeWidth="1.5" />

          {/* 7. Flexible Disc Coupling with Coupling Guard */}
          <g>
            <rect x="605" y="235" width="55" height="70" rx="4" fill="#334155" stroke="#64748B" strokeWidth="2" />
            <line x1="632" y1="235" x2="632" y2="305" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="5 3" />
            {/* Coupling Guard Frame */}
            <rect x="595" y="225" width="75" height="90" rx="6" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />
          </g>

          {/* 8. Centrifugal Pump Volute Casing */}
          <path
            d="M 680 260 L 730 260 C 760 210, 840 210, 860 270 C 870 320, 830 370, 770 370 L 680 370 Z"
            fill="url(#pumpGrad)"
            stroke="#4FD1C5"
            strokeWidth="2"
          />
          {/* Pump Impeller Housing Eye */}
          <circle cx="790" cy="285" r="45" fill="#134E4A" stroke="#2DD4BF" strokeWidth="2" />
          {/* Rotating Impeller Blades Representation */}
          <g transform={`rotate(${currentTelemetry.speedRpm * 0.2}, 790, 285)`}>
            <circle cx="790" cy="285" r="14" fill="#0D9488" />
            <line x1="790" y1="245" x2="790" y2="325" stroke="#99F6E4" strokeWidth="3" />
            <line x1="750" y1="285" x2="830" y2="285" stroke="#99F6E4" strokeWidth="3" />
          </g>

          {/* Pump Suction Flange (Horizontal Inlet) */}
          <rect x="860" y="260" width="35" height="50" rx="2" fill="#234E52" stroke="#4FD1C5" strokeWidth="2" />
          <line x1="880" y1="250" x2="880" y2="320" stroke="#99F6E4" strokeWidth="3" />

          {/* Pump Discharge Flange (Vertical Outlet at Top) */}
          <path
            d="M 760 220 L 800 220 L 800 130 L 760 130 Z"
            fill="url(#pumpGrad)"
            stroke="#4FD1C5"
            strokeWidth="2"
          />
          <rect x="750" y="120" width="60" height="15" rx="2" fill="#234E52" stroke="#4FD1C5" strokeWidth="2" />

          {/* Flow Direction Arrows */}
          <path d="M 885 285 L 850 285" stroke="#38BDF8" strokeWidth="3" markerEnd="url(#arrow)" />
          <path d="M 780 180 L 780 135" stroke="#38BDF8" strokeWidth="3" />

          {/* Pump Mounting Foot */}
          <rect x="740" y="360" width="70" height="22" fill="#134E4A" stroke="#475569" strokeWidth="1.5" />

          {/* ================= SENSOR HOTSPOTS & CALLOUTS ================= */}
          {sensorHotspots.map((sensor) => {
            const isSelected = selectedSensorId === sensor.id;
            const statusFilter =
              sensor.status === 'critical'
                ? 'url(#glowRed)'
                : sensor.status === 'warning'
                ? 'url(#glowAmber)'
                : 'url(#glowGreen)';

            const statusColor =
              sensor.status === 'critical'
                ? '#EF4444'
                : sensor.status === 'warning'
                ? '#F59E0B'
                : '#10B981';

            // Coordinates in SVG space
            const cx = (sensor.xPercent / 100) * 1000;
            const cy = (sensor.yPercent / 100) * 520;

            return (
              <g
                key={sensor.id}
                className="cursor-pointer transition-transform duration-150 hover:scale-105"
                onClick={() => setSelectedSensorId(sensor.id)}
              >
                {/* Connecting Callout Line */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={cx}
                  y2={cy - 35}
                  stroke={statusColor}
                  strokeWidth="1.5"
                  strokeDasharray={isSelected ? 'none' : '3 2'}
                />

                {/* Animated Sensor Pulse Wave */}
                {showDataFlow && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="16"
                    fill="none"
                    stroke={statusColor}
                    strokeWidth="1.5"
                    opacity="0.4"
                    className="animate-ping"
                    style={{ animationDuration: sensor.status === 'critical' ? '1s' : '2.5s' }}
                  />
                )}

                {/* Sensor Hotspot Outer Target */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? '12' : '9'}
                  fill="#0F172A"
                  stroke={statusColor}
                  strokeWidth={isSelected ? '3' : '2'}
                  filter={statusFilter}
                />

                {/* Sensor Hotspot Inner Bullseye */}
                <circle cx={cx} cy={cy} r="4" fill={statusColor} />

                {/* Compact Floating Label Tag */}
                <g transform={`translate(${cx - 45}, ${cy - 55})`}>
                  <rect
                    width="90"
                    height="22"
                    rx="4"
                    fill="#0F172A"
                    stroke={isSelected ? statusColor : '#334155'}
                    strokeWidth={isSelected ? '1.5' : '1'}
                    opacity="0.95"
                  />
                  <text
                    x="45"
                    y="15"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="9.5"
                    fontWeight="600"
                    fontFamily="monospace"
                  >
                    {sensor.currentValue.toFixed(sensor.unit === 'mm/s RMS' ? 2 : 1)} {sensor.unit}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Fault scenario watermark banner if fault active */}
        {faultScenario !== 'normal' && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-rose-950/80 border border-rose-700/70 text-rose-300 text-xs px-3 py-1.5 rounded-lg backdrop-blur-xs font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>ACTIVE FAULT INJECTION: {faultScenario.replace('_', ' ').toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Selected Sensor Detailed Telemetry Inspection Drawer */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-white text-sm">
                {selectedSensor.name}
              </span>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                Tag: {selectedSensor.tag}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  selectedSensor.status === 'critical'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                    : selectedSensor.status === 'warning'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                }`}
              >
                {selectedSensor.status}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              {selectedSensor.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
                Live Reading
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {selectedSensor.currentValue.toFixed(selectedSensor.unit === 'mm/s RMS' ? 2 : 1)}{' '}
                <span className="text-xs font-normal text-slate-500">{selectedSensor.unit}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specification Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Nominal Range</span>
            <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
              {selectedSensor.normalRange[0]} – {selectedSensor.normalRange[1]} {selectedSensor.unit}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Warning / Trip Limit</span>
            <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
              {selectedSensor.warningThreshold} / {selectedSensor.criticalThreshold} {selectedSensor.unit}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Transducer Specification</span>
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
              {selectedSensor.type}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">PLC I/O Channel</span>
            <span className="font-mono text-teal-700 dark:text-teal-400 text-[11px] truncate block">
              {selectedSensor.plcChannel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
