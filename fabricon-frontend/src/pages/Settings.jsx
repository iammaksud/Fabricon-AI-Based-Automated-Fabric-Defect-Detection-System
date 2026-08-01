import { useEffect, useState } from 'react';

import CameraStatusCard from '../components/settings/CameraStatusCard';
import AIApiStatusCard from '../components/settings/AIApiStatusCard';
import ESP32StatusCard from '../components/settings/ESP32StatusCard';
import SystemInfoCard from '../components/settings/SystemInfoCard';

import { settingsService } from '../services/settingsService';
import { APP_NAME } from '../utils/constants';

// System info here is static app metadata, not backend-tracked runtime
// status -- there's no equivalent field in /api/settings/status for it.
const systemInfo = {
  application: APP_NAME,
  version: '1.0.0',
  environment: import.meta.env.MODE === 'production' ? 'Production' : 'Development',
};

const Settings = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingKey, setUpdatingKey] = useState(null);
  const [updateError, setUpdateError] = useState('');

  const loadStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await settingsService.getStatus();
      setStatus(data);
    } catch (err) {
      setError(
        err?.response?.data?.detail || 'Could not load system status. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleStatusChange = async (keyName, value) => {
    setUpdatingKey(keyName);
    setUpdateError('');
    try {
      const updated = await settingsService.updateStatus(keyName, value);
      setStatus(updated);
    } catch (err) {
      setUpdateError(
        err?.response?.data?.detail || `Could not update ${keyName}. Please try again.`
      );
    } finally {
      setUpdatingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading system status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fc-panel">
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-0" role="alert">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={loadStatus}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Real backend values, no live camera/ESP32 device yet -- device-level
  // details (resolution, IP, etc.) simply aren't tracked by this API.
  const cameraInfo = {
    deviceName: 'Not available',
    resolution: 'Not available',
    fps: '—',
    status: status.camera_status,
  };

  const aiApiInfo = {
    serviceName: 'Roboflow API',
    responseTime: '—',
    modelStatus: status.ai_status === 'ONLINE' ? 'Model Loaded' : 'Unavailable',
    // AIApiStatusCard expects ACTIVE/OFFLINE; backend uses ONLINE/OFFLINE.
    status: status.ai_status === 'ONLINE' ? 'ACTIVE' : 'OFFLINE',
  };

  const esp32Info = {
    ipAddress: 'Not available',
    connectionStatus: status.esp32_status,
    servoStatus: 'OFFLINE',
    lastCommand: 'Not available',
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h5 className="mb-1">System Configuration</h5>
        <p className="text-muted mb-0" style={{ fontSize: '0.88rem' }}>
          Monitor the connection and health of all Fabricon subsystems.
        </p>
      </div>

      {updateError && (
        <div className="alert alert-danger mb-0" role="alert">
          {updateError}
        </div>
      )}

      <div className="row g-3">
        <div className="col-12 col-lg-4">
          <CameraStatusCard
            data={cameraInfo}
            updating={updatingKey === 'camera_status'}
            onStatusChange={(value) => handleStatusChange('camera_status', value)}
          />
        </div>
        <div className="col-12 col-lg-4">
          <AIApiStatusCard
            data={aiApiInfo}
            updating={updatingKey === 'ai_status'}
            onStatusChange={(value) =>
              handleStatusChange('ai_status', value === 'ACTIVE' ? 'ONLINE' : 'OFFLINE')
            }
          />
        </div>
        <div className="col-12 col-lg-4">
          <ESP32StatusCard
            data={esp32Info}
            updating={updatingKey === 'esp32_status'}
            onStatusChange={(value) => handleStatusChange('esp32_status', value)}
          />
        </div>
      </div>

      <SystemInfoCard data={systemInfo} />
    </div>
  );
};

export default Settings;