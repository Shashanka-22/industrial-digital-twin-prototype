import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Network,
  Cloud,
  Monitor,
  Database,
  Radio,
  Server,
  Workflow,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';

interface ArchNode {
  id: string;
  name: string;
  category: 'field' | 'control' | 'edge' | 'cloud' | 'hmi';
  protocol: string;
  cycleTime: string;
  role: string;
  description: string;
  inputs: string[];
  outputs: string[];
  examplePayload: string;
  digitalTwinRole: 'Product Twin' | 'Production Twin' | 'Performance Twin';
}

export const ArchitectureFlow: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('plc');

  const nodes: ArchNode[] = [
    {
      id: 'physical_motor',
      name: 'Simulated Motor & Pump Asset',
      category: 'field',
      protocol: 'Mechanical Shaft / Hydraulic Fluid',
      cycleTime: 'Continuous physical dynamics',
      role: 'Heavy rotating prime mover generating kinetic energy and driving fluid flow.',
      description: '45 kW Three-Phase Induction Motor — Simulated Asset (400V 50Hz, 4-pole motor coupled to a single-stage centrifugal volute pump).',
      inputs: ['400V 3-phase AC electric power', 'Fluid suction head (2.1 bar)'],
      outputs: ['Operating shaft torque (221 Nm @ 76% nominal / 291 Nm @ 100% rated)', 'Centrifugal fluid flow (120 m³/h @ 6.2 bar)'],
      examplePayload: 'Mechanical state: 1480.2 RPM, 52.1°C thermal dissipation, 1.12 mm/s RMS vibration velocity',
      digitalTwinRole: 'Product Twin',
    },
    {
      id: 'pt100',
      name: 'PT100 Temperature Sensor',
      category: 'field',
      protocol: '4-Wire Platinum Resistance (DIN EN 60751)',
      cycleTime: 'Analog continuous (~500ms thermal time constant)',
      role: 'Measures stator winding core temperature to guard Class F insulation limits.',
      description: 'Thin-film platinum RTD embedded into motor winding slot stator core, providing 100.00 Ω at 0°C.',
      inputs: ['Joule heat dissipation from stator copper winding'],
      outputs: ['Resistance change: 120.17 Ω @ 52°C'],
      examplePayload: 'Resistance: 120.17 Ω -> Converted by RTD module to %IW12 = 9580 (Raw)',
      digitalTwinRole: 'Performance Twin',
    },
    {
      id: 'accelerometer',
      name: 'Tri-Axial Accelerometer',
      category: 'field',
      protocol: 'IEPE (Integrated Electronics Piezo-Electric, 100 mV/g)',
      cycleTime: 'High-frequency vibration waveform (up to 20 kHz)',
      role: 'Captures radial and axial acceleration waveforms on Drive-End bearing housing.',
      description: 'Shear-mode piezoelectric transducer mounted magnetically or stud-mounted onto bearing end-shield for ISO 10816 evaluation.',
      inputs: ['Mechanical vibration force & bearing surface contact acoustics'],
      outputs: ['Modulated AC analog voltage signal (mV proportional to acceleration g)'],
      examplePayload: 'Raw waveform sample: +/- 2.4g dynamic amplitude -> FFT velocity RMS = 1.15 mm/s',
      digitalTwinRole: 'Performance Twin',
    },
    {
      id: 'ct_sensor',
      name: 'Current Transformer (CT)',
      category: 'field',
      protocol: 'Hall-Effect / 4-20mA loop',
      cycleTime: '50 Hz AC sinusoidal cycle sampling',
      role: 'Galvanically isolated measurement of Phase U line current.',
      description: 'Split-core current transducer transforming 0-100 A AC line current to standard 4-20 mA DC industrial signal.',
      inputs: ['Phase U primary conductor electromagnetic field'],
      outputs: ['4-20 mA proportional loop current'],
      examplePayload: 'Current: 62.0 A AC -> 13.92 mA DC loop signal (%IW16 = 17120 Raw)',
      digitalTwinRole: 'Performance Twin',
    },
    {
      id: 'io_module',
      name: 'ET 200SP I/O System',
      category: 'control',
      protocol: 'Backplane bus (ET 200SP BaseUnit to IM 155-6 PN)',
      cycleTime: '1 ms deterministic bus cycle',
      role: 'High-speed analog signal conditioning, filtering, and ADC quantization.',
      description: 'Distributed modular I/O station converting analog voltages and currents into 16-bit integers with wire-break diagnostics.',
      inputs: ['PT100 4-wire leads', '4-20 mA loop current', 'IEPE vibration inputs'],
      outputs: ['Scaled PROFINET cyclic I/O frames'],
      examplePayload: 'Module AI 8xU/I/RTD/TC: Channel 0 Word = 0x256C (Raw 9580 integer)',
      digitalTwinRole: 'Production Twin',
    },
    {
      id: 'plc',
      name: 'SIMATIC S7-1500 PLC (Conceptual)',
      category: 'control',
      protocol: 'PROFINET IO IRT & ISO-on-TCP',
      cycleTime: '10 ms cyclic OB1 execution cycle',
      role: 'Core industrial controller executing automation logic, interlocks, and safety limits.',
      description: 'CPU 1516-3 PN/DP (Conceptual PLC Reference — Not Connected). Represents target automation logic controller.',
      inputs: ['Cyclic input process image (%I words)', 'Field instrumentation tags'],
      outputs: ['Contactor outputs (%Q)', 'OPC UA Information Model address space'],
      examplePayload: 'DB_MotorTwin.ActualSpeed = 1480.0, DB_MotorTwin.WindingTemp = 52.0',
      digitalTwinRole: 'Production Twin',
    },
    {
      id: 'profinet',
      name: 'PROFINET Network (Reference)',
      category: 'control',
      protocol: 'PROFINET Real-Time (RT / IRT, IEC 61158 / 61784)',
      cycleTime: '< 1 ms jitter-free fieldbus cycle',
      role: 'Deterministic Ethernet field communication between controller and distributed peripherals.',
      description: 'Standard 100 Mbps industrial Ethernet with prioritized IEEE 802.1Q VLAN tagging guaranteeing sub-millisecond I/O determinism.',
      inputs: ['Raw Ethernet frames from ET 200SP'],
      outputs: ['Deterministic cyclic payloads delivered to S7-1500 memory image'],
      examplePayload: 'EtherType 0x8892 (PROFINET RT frame, frame ID 0x8000, 64-byte payload)',
      digitalTwinRole: 'Production Twin',
    },
    {
      id: 'opcua',
      name: 'OPC UA Server (IEC 62541)',
      category: 'edge',
      protocol: 'OPC Unified Architecture (Prepared / Disconnected)',
      cycleTime: '100 ms subscription publishing interval',
      role: 'Standardized, vendor-neutral vertical data modeling with encrypted communication.',
      description: 'Prepared OPC UA server interface for S7-1500 address space (Prepared / Disconnected in this simulation deployment).',
      inputs: ['PLC Data Blocks (DB_MotorTwin)'],
      outputs: ['Secure binary TCP data stream with MonitoredItems'],
      examplePayload: 'NodeId ns=3;s="DB_MotorTwin"."VibrationRMS" -> Value: 1.12, StatusCode: Good',
      digitalTwinRole: 'Performance Twin',
    },
    {
      id: 'edge_device',
      name: 'Industrial Edge Computing IPC',
      category: 'edge',
      protocol: 'Docker Container Runtime / Edge App Engine',
      cycleTime: '100 ms local processing buffer',
      role: 'On-premise high-performance compute platform hosting AI inference and containerized apps.',
      description: 'Industrial PC (SIMATIC IPC227E / Linux Edge) running containerized diagnostics (Conceptual Architecture Reference).',
      inputs: ['OPC UA client subscriptions', 'High-frequency sensor buffers'],
      outputs: ['Pre-processed feature metrics', 'MQTT edge messages'],
      examplePayload: 'Edge container: "Anomaly-Detection-App" computing local isolation forest inference',
      digitalTwinRole: 'Performance Twin',
    },
    {
      id: 'local_anomaly',
      name: 'Local Edge Anomaly Detector',
      category: 'edge',
      protocol: 'Python / ONNX Runtime within Docker',
      cycleTime: '1000 ms sliding window evaluation',
      role: 'Instantaneous localized anomaly scoring without dependency on cloud connectivity.',
      description: 'Calculates multi-variate statistical distances, FFT spectral harmonics, and physics-based residual deviations.',
      inputs: ['Speed, Temp, Vibration RMS, Current vectors'],
      outputs: ['Anomaly score [0.0 - 1.0]', 'Feature contribution breakdown'],
      examplePayload: '{"anomaly_score": 0.024, "degradation_class": "nominal", "confidence": 0.99}',
      digitalTwinRole: 'Performance Twin',
    },
    {
      id: 'mqtt_tls',
      name: 'MQTT over TLS 1.3',
      category: 'cloud',
      protocol: 'MQTTS (TCP port 8883) — Prepared / Disconnected',
      cycleTime: '1 s to 10 s telemetry upload cadence',
      role: 'Bandwidth-efficient, resilient pub/sub protocol transmitting operational telemetry to cloud.',
      description: 'Low-overhead messaging with Quality of Service QoS 1 (Prepared / Disconnected in this deployment).',
      inputs: ['Edge processed JSON telemetry payloads'],
      outputs: ['Encrypted TCP packets to Insights Hub IoT ingest broker'],
      examplePayload: 'Topic: plants/bay4/motor_45kw/telemetry -> Payload size: 480 bytes',
      digitalTwinRole: 'Performance Twin',
    },
    {
      id: 'insights_hub',
      name: 'Cloud IoT Analytics Hub',
      category: 'cloud',
      protocol: 'Cloud REST APIs, Time Series DB, Kafka Streaming',
      cycleTime: 'Fleet-wide historical aggregation & training pipelines',
      role: 'Fleet-level asset performance management, RUL prognostic modeling, and digital twin orchestration.',
      description: 'Industrial IoT cloud platform running predictive maintenance analytics (Disconnected Architecture Reference).',
      inputs: ['Aggregated telemetry streams from global plant edge gateways'],
      outputs: ['Long-term health trajectories', 'Enterprise ERP work orders'],
      examplePayload: 'Fleet benchmark: MOTOR_45KW_001 health percentile 92nd in global rotating assets',
      digitalTwinRole: 'Performance Twin',
    },
    {
      id: 'dashboard_hmi',
      name: 'Digital Twin Dashboard & HMI',
      category: 'hmi',
      protocol: 'WebSocket / REST Web HMI (Local Simulation Engine Active)',
      cycleTime: 'Instantaneous UI reactive state sync',
      role: 'Operator and engineer decision portal displaying live 3D models, alarm queues, and prescriptive recommendations.',
      description: 'Responsive web interface for control room operators, maintenance supervisors, and plant managers.',
      inputs: ['Real-time telemetry streams', 'Model predictions', 'Active alarm registers'],
      outputs: ['Operator acknowledgements', 'Maintenance dispatch tickets'],
      examplePayload: 'Active dashboard session: Rendering 60fps SVG Twin with live ISO alarms',
      digitalTwinRole: 'Performance Twin',
    },
  ];

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[5];

  return (
    <div className="space-y-6">
      {/* Top Diagram Canvas */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                End-to-End Industrial Architecture & Data Pipeline
              </h3>
              <span className="text-[11px] font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                Industrial Automation Architecture Reference
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive architecture reference from field instrumentation to S7-1500, Industrial Edge, and Cloud Twin. Click any block to view specs.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>Protocol Chain:</span>
            <span className="text-teal-600 font-bold">PROFINET → OPC UA → MQTT</span>
          </div>
        </div>

        {/* Clickable Pipeline Blocks Chain */}
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Level 0: Field Assets & Sensors */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Level 0 · Field Instruments
              </div>
              <div className="space-y-2">
                {nodes.slice(0, 4).map((node) => {
                  const isSel = selectedNodeId === node.id;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`w-full p-2.5 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                        isSel
                          ? 'bg-teal-700 text-white border-teal-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <span className="text-xs font-semibold truncate">{node.name}</span>
                      <span
                        className={`text-[10px] font-mono truncate ${
                          isSel ? 'text-teal-200' : 'text-slate-400'
                        }`}
                      >
                        {node.protocol}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level 1: Control & Fieldbus */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Level 1 · Control & Fieldbus
              </div>
              <div className="space-y-2">
                {nodes.slice(4, 7).map((node) => {
                  const isSel = selectedNodeId === node.id;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`w-full p-2.5 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                        isSel
                          ? 'bg-teal-700 text-white border-teal-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <span className="text-xs font-semibold truncate">{node.name}</span>
                      <span
                        className={`text-[10px] font-mono truncate ${
                          isSel ? 'text-teal-200' : 'text-slate-400'
                        }`}
                      >
                        {node.protocol}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level 2: Industrial Edge & Local AI */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Level 2 · Industrial Edge
              </div>
              <div className="space-y-2">
                {nodes.slice(7, 10).map((node) => {
                  const isSel = selectedNodeId === node.id;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`w-full p-2.5 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                        isSel
                          ? 'bg-teal-700 text-white border-teal-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <span className="text-xs font-semibold truncate">{node.name}</span>
                      <span
                        className={`text-[10px] font-mono truncate ${
                          isSel ? 'text-teal-200' : 'text-slate-400'
                        }`}
                      >
                        {node.protocol}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level 3: Edge-to-Cloud Broker */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Level 3 · Cloud Analytics
              </div>
              <div className="space-y-2">
                {nodes.slice(10, 12).map((node) => {
                  const isSel = selectedNodeId === node.id;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`w-full p-2.5 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                        isSel
                          ? 'bg-teal-700 text-white border-teal-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <span className="text-xs font-semibold truncate">{node.name}</span>
                      <span
                        className={`text-[10px] font-mono truncate ${
                          isSel ? 'text-teal-200' : 'text-slate-400'
                        }`}
                      >
                        {node.protocol}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level 4: Operation Portal */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Level 4 · Digital Twin HMI
              </div>
              <div className="space-y-2">
                {nodes.slice(12, 13).map((node) => {
                  const isSel = selectedNodeId === node.id;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`w-full p-2.5 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                        isSel
                          ? 'bg-teal-700 text-white border-teal-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <span className="text-xs font-semibold truncate">{node.name}</span>
                      <span
                        className={`text-[10px] font-mono truncate ${
                          isSel ? 'text-teal-200' : 'text-slate-400'
                        }`}
                      >
                        {node.protocol}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Node Detailed Architecture Sheet */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                {selectedNode.name}
              </h4>
              <span className="text-xs font-mono text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-950/80 px-2 py-0.5 rounded">
                Twin Dimension: {selectedNode.digitalTwinRole}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {selectedNode.description}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 uppercase block">Deterministic Latency</span>
            <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
              {selectedNode.cycleTime}
            </span>
          </div>
        </div>

        {/* Detailed Spec Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Inputs:
            </span>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-0.5 font-mono text-[11px]">
              {selectedNode.inputs.map((inp, idx) => (
                <li key={idx}>{inp}</li>
              ))}
            </ul>
          </div>

          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Outputs:
            </span>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-0.5 font-mono text-[11px]">
              {selectedNode.outputs.map((out, idx) => (
                <li key={idx}>{out}</li>
              ))}
            </ul>
          </div>

          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Sample Data Payload / Protocol Word:
            </span>
            <div className="p-2.5 rounded-lg bg-slate-900 text-teal-300 font-mono text-[11px] break-all border border-slate-800">
              {selectedNode.examplePayload}
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Comparison Matrix & Edge vs Cloud Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Protocol Matrix */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            Industrial Protocol Architectural Roles
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 uppercase">
                  <th className="py-2 px-2">Protocol</th>
                  <th className="py-2 px-2">Target Layer</th>
                  <th className="py-2 px-2">Latency</th>
                  <th className="py-2 px-2">Key Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                <tr>
                  <td className="py-2 px-2 font-bold font-mono text-teal-700 dark:text-teal-400">PROFINET</td>
                  <td className="py-2 px-2">Fieldbus (PLC ↔ I/O)</td>
                  <td className="py-2 px-2 font-mono">&lt; 1 ms</td>
                  <td className="py-2 px-2 text-slate-600 dark:text-slate-300">Deterministic real-time closed-loop machine control</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-bold font-mono text-teal-700 dark:text-teal-400">OPC UA</td>
                  <td className="py-2 px-2">Vertical OT Integration</td>
                  <td className="py-2 px-2 font-mono">100 - 500 ms</td>
                  <td className="py-2 px-2 text-slate-600 dark:text-slate-300">Semantic object modeling & cross-vendor standard (IEC 62541)</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-bold font-mono text-teal-700 dark:text-teal-400">MQTT over TLS</td>
                  <td className="py-2 px-2">Edge to Cloud WAN</td>
                  <td className="py-2 px-2 font-mono">1 - 5 s</td>
                  <td className="py-2 px-2 text-slate-600 dark:text-slate-300">Ultra-lightweight pub/sub messaging over low-bandwidth links</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Edge vs Cloud */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            Edge Computing vs. Cloud Twin Analytics
          </h4>
          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white block">
                Industrial Edge Computing (Local IPC Architecture)
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                Executes high-frequency vibration FFTs (20 kHz sampling), immediate trip interlocks, and local ONNX anomaly models. Operates autonomously without WAN dependence, guaranteeing plant data sovereignty.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white block">
                Cloud IoT Analytics Hub (Cloud Architecture Reference)
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                Maintains multi-year plant historians, fleet-wide degradation benchmark curves, RUL neural network training pipelines, and integration with enterprise maintenance scheduling.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Industrial Software Ecosystem Reference Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
        <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
          Industrial Digital Twin Software Ecosystem (Architecture Reference)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="font-bold text-teal-700 dark:text-teal-400 block">CAD / CAE Product Design</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
              3D CAD product modeling, finite element analysis (FEA), fluid dynamics, and product lifecycle management (PLM) single-source-of-truth.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="font-bold text-teal-700 dark:text-teal-400 block">Kinematics & Virtual Commissioning</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
              Production line kinematics simulation, PLC programming (Ladder / SCL), hardware configuration, and virtual commissioning before physical steel is cut.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="font-bold text-teal-700 dark:text-teal-400 block">PLC Automation & SCADA / HMI</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
              Deterministic real-time machine execution, safety controller interlocks, and modern web-native SCADA / HMI visualization.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="font-bold text-teal-700 dark:text-teal-400 block">Industrial Edge Runtime</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
              Containerized application deployment directly beside the PLC for millisecond-level vibration AI inference and edge data processing.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="font-bold text-teal-700 dark:text-teal-400 block">Cloud IoT Platform</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
              Cloud-native Industrial IoT platform aggregating fleet performance, predictive maintenance analytics, and carbon footprint telemetry.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="font-bold text-teal-700 dark:text-teal-400 block">Closed-Loop Twin Feedback</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
              Operational wear telemetry feeds back into CAD and engineering models to optimize the next design generation of motor bearings and impellers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
