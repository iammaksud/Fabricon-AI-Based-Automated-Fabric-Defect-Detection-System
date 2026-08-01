// Dummy data for the Admin Dashboard — shaped to mirror what the FastAPI
// backend + AI detection API will eventually return. Swap for real
// service calls later without changing component props.

export const dashboardStats = {
  totalInspections: 4820,
  defectsDetected: 312,
  detectionAccuracy: 97.4, // percentage
  systemStatus: 'OPERATIONAL', // OPERATIONAL | DEGRADED | DOWN
};

// Defect type distribution for the AI Defect Analysis chart
export const defectAnalysis = {
  labels: ['Hole', 'Stain', 'Knot', 'Broken Thread'],
  counts: [86, 124, 57, 45],
};

export const mostCommonDefect = 'Stain';

// Hardware / subsystem monitoring
export const hardwareStatus = {
  esp32: { label: 'ESP32', status: 'CONNECTED' },
  camera: { label: 'Camera', status: 'ACTIVE' },
  aiApi: { label: 'AI API', status: 'ONLINE' },
  servo: { label: 'Servo Motor', status: 'READY' },
};

// Recent detection activity — most recent first
export const recentDetections = [
  {
    id: 'DET-10231',
    time: '2026-07-26 10:42:15',
    defectType: 'Stain',
    confidence: 96.8,
    esp32Action: 'Reject Triggered',
    status: 'DEFECT',
  },
  {
    id: 'DET-10230',
    time: '2026-07-26 10:41:02',
    defectType: '—',
    confidence: 99.2,
    esp32Action: 'No Action',
    status: 'OK',
  },
  {
    id: 'DET-10229',
    time: '2026-07-26 10:39:48',
    defectType: 'Hole',
    confidence: 94.1,
    esp32Action: 'Reject Triggered',
    status: 'DEFECT',
  },
  {
    id: 'DET-10228',
    time: '2026-07-26 10:38:20',
    defectType: '—',
    confidence: 98.7,
    esp32Action: 'No Action',
    status: 'OK',
  },
  {
    id: 'DET-10227',
    time: '2026-07-26 10:37:05',
    defectType: 'Knot',
    confidence: 91.5,
    esp32Action: 'Reject Triggered',
    status: 'DEFECT',
  },
  {
    id: 'DET-10226',
    time: '2026-07-26 10:35:51',
    defectType: 'Broken Thread',
    confidence: 93.0,
    esp32Action: 'Reject Triggered',
    status: 'DEFECT',
  },
  {
    id: 'DET-10225',
    time: '2026-07-26 10:34:12',
    defectType: '—',
    confidence: 99.5,
    esp32Action: 'No Action',
    status: 'OK',
  },
];