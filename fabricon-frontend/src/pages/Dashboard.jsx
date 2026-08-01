import { useEffect, useState } from 'react';
import {
  MdOutlineFactCheck,
  MdOutlineReportProblem,
  MdOutlineGpsFixed,
  MdOutlineDns,
} from 'react-icons/md';

import StatCard from '../components/dashboard/StatCard';
import DetectionChart from '../components/dashboard/DetectionChart';
import ESP32StatusCard from '../components/dashboard/ESP32StatusCard';
import RecentActivityTable from '../components/dashboard/RecentActivityTable';

import { dashboardService } from '../services/dashboardService';

const SYSTEM_STATUS_TONE = {
  OPERATIONAL: 'success',
  DEGRADED: 'warning',
  DOWN: 'danger',
};

// Backend has no single "system status" field -- derive it from the two
// subsystem statuses /api/dashboard/stats does return.
const deriveSystemStatus = (aiStatus, esp32Status) => {
  const aiOnline = aiStatus === 'ONLINE';
  const esp32Connected = esp32Status === 'CONNECTED';
  if (aiOnline && esp32Connected) return 'OPERATIONAL';
  if (!aiOnline && !esp32Connected) return 'DOWN';
  return 'DEGRADED';
};

const formatDateTime = (isoString) => {
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const mapActivityToRow = (item) => ({
  id: `DET-${item.id}`,
  time: formatDateTime(item.created_at),
  defectType: item.defect_type || '—',
  confidence: Number(item.confidence) * 100,
  esp32Action: item.esp32_action || 'No Action',
  status: item.defect_type ? 'DEFECT' : 'OK',
});

// No aggregate "defects by type" endpoint exists yet -- approximate the
// chart from the fetched recent-activity sample rather than lifetime totals.
const buildDefectAnalysis = (activities) => {
  const counts = {};
  activities.forEach((item) => {
    if (item.defect_type) {
      counts[item.defect_type] = (counts[item.defect_type] || 0) + 1;
    }
  });

  const labels = Object.keys(counts);
  const values = labels.map((label) => counts[label]);
  const mostCommon =
    labels.length > 0
      ? labels.reduce((a, b) => (counts[a] >= counts[b] ? a : b))
      : 'None';

  return { labels, counts: values, mostCommon };
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, activityData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivity(50),
      ]);
      setStats(statsData);
      setActivities(activityData);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          'Could not load dashboard data. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fc-panel">
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-0" role="alert">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={loadDashboard}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const detectionAccuracy =
    stats.total_detections > 0
      ? Number(((stats.total_normal / stats.total_detections) * 100).toFixed(1))
      : 0;

  const systemStatus = deriveSystemStatus(stats.ai_status, stats.esp32_status);
  const systemTone = SYSTEM_STATUS_TONE[systemStatus] || 'success';

  const { labels, counts, mostCommon } = buildDefectAnalysis(activities);

  const hardwareStatus = {
    esp32: { label: 'ESP32', status: stats.esp32_status },
    aiApi: { label: 'AI API', status: stats.ai_status },
  };

  const recentDetections = activities.map(mapActivityToRow);

  return (
    <div className="d-flex flex-column gap-4">
      {/* ---------- Statistics Cards ---------- */}
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            icon={MdOutlineFactCheck}
            label="Total Inspections"
            value={stats.total_detections.toLocaleString()}
            tone="primary"
            footnote="Fabric rolls scanned to date"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            icon={MdOutlineReportProblem}
            label="Defects Detected"
            value={stats.total_defects.toLocaleString()}
            tone="danger"
            footnote="Flagged by AI detection engine"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            icon={MdOutlineGpsFixed}
            label="Detection Accuracy"
            value={detectionAccuracy}
            suffix="%"
            tone="success"
            footnote={
              stats.total_detections > 0
                ? 'Share of scans found clean'
                : 'No inspections recorded yet'
            }
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            icon={MdOutlineDns}
            label="System Status"
            value={systemStatus}
            tone={systemTone}
            footnote="Derived from AI + ESP32 status"
          />
        </div>
      </div>

      {/* ---------- AI Defect Analysis + Hardware Monitoring ---------- */}
      <div className="row g-3">
        <div className="col-12 col-xl-8">
          <div className="fc-panel h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="fc-panel-title mb-0">AI Defect Analysis</div>
              <span className="fc-status-pill fc-status-info">
                Most Common (recent): {mostCommon}
              </span>
            </div>
            {labels.length > 0 ? (
              <DetectionChart labels={labels} counts={counts} />
            ) : (
              <p className="text-muted mb-0 py-4 text-center">
                No defects recorded in recent activity yet.
              </p>
            )}
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <ESP32StatusCard hardwareStatus={hardwareStatus} />
        </div>
      </div>

      {recentDetections.length > 0 ? (
        <RecentActivityTable detections={recentDetections} />
      ) : (
        <div className="fc-panel">
          <div className="fc-panel-title">Recent Detection Activity</div>
          <p className="text-muted mb-0 py-3 text-center">
            No detections have been recorded yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;