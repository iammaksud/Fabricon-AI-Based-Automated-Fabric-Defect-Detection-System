import {
  MdOutlineVideocam,
  MdOutlineHighQuality,
  MdOutlineSpeed,
} from 'react-icons/md';

// Maps status to pill tone + whether the pulse/glow animation should play
const STATUS_TONE = {
  ONLINE: 'fc-status-ok',
  OFFLINE: 'fc-status-danger',
  WARNING: 'fc-status-warning',
};

const CameraStatusCard = ({ data, onStatusChange, updating }) => {
  const tone = STATUS_TONE[data.status] || 'fc-status-idle';
  const isOnline = data.status === 'ONLINE';

  return (
    <div className="fc-panel fc-settings-card">
      <div className="fc-settings-card-header">
        <div className={`fc-settings-icon ${isOnline ? 'fc-settings-icon-ok' : 'fc-settings-icon-down'}`}>
          <MdOutlineVideocam size={22} />
        </div>
        <div>
          <div className="fc-panel-title mb-0">Camera</div>
          <span className={`fc-status-pill ${tone} mt-1`}>
            {isOnline && <span className="fc-pulse-dot me-1" />}
            {data.status}
          </span>
          {onStatusChange && (
            <select
              className="form-select form-select-sm mt-2"
              value={data.status}
              disabled={updating}
              onChange={(e) => onStatusChange(e.target.value)}
              aria-label="Update camera status"
            >
              <option value="ONLINE">ONLINE</option>
              <option value="OFFLINE">OFFLINE</option>
            </select>
          )}
        </div>
      </div>

      <div className="fc-settings-info-list">
        <div className="fc-settings-info-row">
          <span className="fc-settings-info-label">
            <MdOutlineVideocam size={16} /> Device
          </span>
          <span className="fc-settings-info-value">{data.deviceName}</span>
        </div>
        <div className="fc-settings-info-row">
          <span className="fc-settings-info-label">
            <MdOutlineHighQuality size={16} /> Resolution
          </span>
          <span className="fc-settings-info-value fc-mono">{data.resolution}</span>
        </div>
        <div className="fc-settings-info-row">
          <span className="fc-settings-info-label">
            <MdOutlineSpeed size={16} /> Frame Rate
          </span>
          <span className="fc-settings-info-value fc-mono">{data.fps} FPS</span>
        </div>
      </div>
    </div>
  );
};

export default CameraStatusCard;