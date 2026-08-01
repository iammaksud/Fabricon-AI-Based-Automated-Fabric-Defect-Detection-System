import {
  MdOutlineCloudDone,
  MdOutlineTimer,
  MdOutlinePsychology,
} from 'react-icons/md';

const STATUS_TONE = {
  ACTIVE: 'fc-status-ok',
  OFFLINE: 'fc-status-danger',
  WARNING: 'fc-status-warning',
};

const AIApiStatusCard = ({ data, onStatusChange, updating }) => {
  const tone = STATUS_TONE[data.status] || 'fc-status-idle';
  const isActive = data.status === 'ACTIVE';

  return (
    <div className="fc-panel fc-settings-card">
      <div className="fc-settings-card-header">
        <div className={`fc-settings-icon ${isActive ? 'fc-settings-icon-ok' : 'fc-settings-icon-down'}`}>
          <MdOutlinePsychology size={22} />
        </div>
        <div>
          <div className="fc-panel-title mb-0">AI Detection API</div>
          <span className={`fc-status-pill ${tone} mt-1`}>
            {isActive && <span className="fc-pulse-dot me-1" />}
            {data.status}
          </span>
          {onStatusChange && (
            <select
              className="form-select form-select-sm mt-2"
              value={data.status}
              disabled={updating}
              onChange={(e) => onStatusChange(e.target.value)}
              aria-label="Update AI API status"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="OFFLINE">OFFLINE</option>
            </select>
          )}
        </div>
      </div>

      <div className="fc-settings-info-list">
        <div className="fc-settings-info-row">
          <span className="fc-settings-info-label">
            <MdOutlineCloudDone size={16} /> AI Service
          </span>
          <span className="fc-settings-info-value">{data.serviceName}</span>
        </div>
        <div className="fc-settings-info-row">
          <span className="fc-settings-info-label">
            <MdOutlineTimer size={16} /> Response Time
          </span>
          <span className="fc-settings-info-value fc-mono">
            {data.responseTime}ms
          </span>
        </div>
        <div className="fc-settings-info-row">
          <span className="fc-settings-info-label">
            <MdOutlinePsychology size={16} /> Model Status
          </span>
          <span className="fc-settings-info-value">{data.modelStatus}</span>
        </div>
      </div>
    </div>
  );
};

export default AIApiStatusCard;