import { MdOutlineAppSettingsAlt, MdOutlineTag, MdOutlineDns } from 'react-icons/md';

const ENV_TONE = {
  Development: 'fc-status-warning',
  Staging: 'fc-status-info',
  Production: 'fc-status-ok',
};

const SystemInfoCard = ({ data }) => {
  const envTone = ENV_TONE[data.environment] || 'fc-status-idle';

  return (
    <div className="fc-panel">
      <div className="fc-panel-title">System Information</div>

      <div className="fc-sysinfo-grid">
        <div className="fc-sysinfo-item">
          <span className="fc-sysinfo-icon">
            <MdOutlineAppSettingsAlt size={20} />
          </span>
          <div>
            <span className="fc-settings-info-label d-block mb-1">Application</span>
            <span className="fc-settings-info-value">{data.application}</span>
          </div>
        </div>

        <div className="fc-sysinfo-item">
          <span className="fc-sysinfo-icon">
            <MdOutlineTag size={20} />
          </span>
          <div>
            <span className="fc-settings-info-label d-block mb-1">Version</span>
            <span className="fc-settings-info-value fc-mono">{data.version}</span>
          </div>
        </div>

        <div className="fc-sysinfo-item">
          <span className="fc-sysinfo-icon">
            <MdOutlineDns size={20} />
          </span>
          <div>
            <span className="fc-settings-info-label d-block mb-1">Environment</span>
            <span className={`fc-status-pill ${envTone}`}>{data.environment}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemInfoCard;