import {
  MdOutlineSettingsInputAntenna,
  MdOutlineLan,
  MdOutlinePrecisionManufacturing,
  MdOutlineHistoryToggleOff,
} from 'react-icons/md';

const STATUS_TONE = {
  CONNECTED: 'fc-status-ok',
  DISCONNECTED: 'fc-status-danger',
  WARNING: 'fc-status-warning',
};

const SERVO_TONE = {
  READY: 'fc-status-ok',
  ACTIVATED: 'fc-status-warning',
  OFFLINE: 'fc-status-danger',
};

const ESP32StatusCard = ({ data, onStatusChange, updating }) => {
  const tone = STATUS_TONE[data.connectionStatus] || 'fc-status-idle';
  const servoTone = SERVO_TONE[data.servoStatus] || 'fc-status-idle';
  const isConnected = data.connectionStatus === 'CONNECTED';

  return (
    <div className="fc-panel fc-settings-card">
      <div className="fc-settings-card-header">
        <div className={`fc-settings-icon ${isConnected ? 'fc-settings-icon-ok' : 'fc-settings-icon-down'}`}>
          <MdOutlineSettingsInputAntenna size={22} />
        </div>
        <div>
          <div className="fc-panel-title mb-0">ESP32 Hardware</div>
          <span className={`fc-status-pill ${tone} mt-1`}>
            {isConnected && <span className="fc-pulse-dot me-1" />}
            {data.connectionStatus}
          </span>
          {onStatusChange && (
            <select
              className="form-select form-select-sm mt-2"
              value={data.connectionStatus}
              disabled={updating}
              onChange={(e) => onStatusChange(e.target.value)}
              aria-label="Update ESP32 connection status"
            >
              <option value="CONNECTED">CONNECTED</option>
              <option value="DISCONNECTED">DISCONNECTED</option>
            </select>
          )}
        </div>
      </div>

      <div className="fc-settings-info-list">
        <div className="fc-settings-info-row">
          <span className="fc-settings-info-label">
            <MdOutlineLan size={16} /> IP Address
          </span>
          <span className="fc-settings-info-value fc-mono">{data.ipAddress}</span>
        </div>
        <div className="fc-settings-info-row">
          <span className="fc-settings-info-label">
            <MdOutlinePrecisionManufacturing size={16} /> Servo Motor
          </span>
          <span className={`fc-status-pill ${servoTone}`}>{data.servoStatus}</span>
        </div>
        <div className="fc-settings-info-row">
          <span className="fc-settings-info-label">
            <MdOutlineHistoryToggleOff size={16} /> Last Command
          </span>
          <span className="fc-settings-info-value">{data.lastCommand}</span>
        </div>
      </div>
    </div>
  );
};

export default ESP32StatusCard;