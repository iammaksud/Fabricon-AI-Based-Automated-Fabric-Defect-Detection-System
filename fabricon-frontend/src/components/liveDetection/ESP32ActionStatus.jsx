import {
  MdOutlineSettingsInputAntenna,
  MdOutlinePrecisionManufacturing,
  MdOutlineBolt,
} from 'react-icons/md';

const ESP32ActionStatus = ({ result, isCameraActive }) => {
  const isDefect = isCameraActive && result?.status === 'DEFECT';

  const lastAction = !isCameraActive
    ? 'System Idle'
    : isDefect
    ? 'Reject Fabric'
    : 'No Action';

  const servoState = isDefect ? 'ACTIVATED' : 'READY';

  return (
    <div className="fc-panel">
      <div className="fc-panel-title">ESP32 Action Status</div>

      <div className="fc-esp32-grid">
        <div className="fc-esp32-item">
          <div className="fc-hardware-icon fc-hardware-icon-ok">
            <MdOutlineSettingsInputAntenna size={20} />
          </div>
          <div className="fc-hardware-info">
            <span className="fc-hardware-label">ESP32</span>
            <span className="fc-status-pill fc-status-ok">Connected</span>
          </div>
        </div>

        <div className="fc-esp32-item">
          <div
            className={`fc-hardware-icon ${
              isDefect ? 'fc-hardware-icon-down' : 'fc-hardware-icon-ok'
            }`}
          >
            <MdOutlinePrecisionManufacturing size={20} />
          </div>
          <div className="fc-hardware-info">
            <span className="fc-hardware-label">Servo</span>
            <span
              className={`fc-status-pill ${
                isDefect ? 'fc-status-danger' : 'fc-status-ok'
              }`}
            >
              {servoState}
            </span>
          </div>
        </div>

        <div className="fc-esp32-item">
          <div
            className={`fc-hardware-icon ${
              isDefect ? 'fc-hardware-icon-down' : 'fc-hardware-icon-ok'
            }`}
          >
            <MdOutlineBolt size={20} />
          </div>
          <div className="fc-hardware-info">
            <span className="fc-hardware-label">Last Action</span>
            <span
              className={`fc-status-pill ${
                isDefect
                  ? 'fc-status-danger'
                  : isCameraActive
                  ? 'fc-status-ok'
                  : 'fc-status-idle'
              }`}
            >
              {lastAction}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ESP32ActionStatus;