import {
  MdOutlineSettingsInputAntenna,
  MdOutlineVideocam,
  MdOutlineCloudDone,
  MdOutlinePrecisionManufacturing,
} from 'react-icons/md';

// Maps hardware status keys to icon + status-pill tone
const HARDWARE_META = {
  esp32: { icon: MdOutlineSettingsInputAntenna },
  camera: { icon: MdOutlineVideocam },
  aiApi: { icon: MdOutlineCloudDone },
  servo: { icon: MdOutlinePrecisionManufacturing },
};

// Statuses that should render as "healthy" (green) pills
const HEALTHY_STATUSES = ['CONNECTED', 'ACTIVE', 'ONLINE', 'READY'];

const ESP32StatusCard = ({ hardwareStatus }) => {
  return (
    <div className="fc-panel h-100">
      <div className="fc-panel-title">Hardware Monitoring</div>

      <div className="fc-hardware-grid">
        {Object.entries(hardwareStatus).map(([key, { label, status }]) => {
          const Icon = HARDWARE_META[key]?.icon || MdOutlineCloudDone;
          const isHealthy = HEALTHY_STATUSES.includes(status);

          return (
            <div className="fc-hardware-item" key={key}>
              <div
                className={`fc-hardware-icon ${
                  isHealthy ? 'fc-hardware-icon-ok' : 'fc-hardware-icon-down'
                }`}
              >
                <Icon size={20} />
              </div>
              <div className="fc-hardware-info">
                <span className="fc-hardware-label">{label}</span>
                <span
                  className={`fc-status-pill ${
                    isHealthy ? 'fc-status-ok' : 'fc-status-danger'
                  }`}
                >
                  {status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ESP32StatusCard;