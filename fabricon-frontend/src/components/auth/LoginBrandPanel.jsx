import { PiFactoryFill } from 'react-icons/pi';
import {
  MdOutlineVideocam,
  MdOutlineBolt,
  MdOutlineGridView,
} from 'react-icons/md';
import { GiRolledCloth } from 'react-icons/gi';
import { BsCpu } from 'react-icons/bs';
import { APP_NAME } from '../../utils/constants';

const LoginBrandPanel = () => {
  return (
    <div className="fc-login-brand fc-industrial-bg">
      <div className="fc-login-brand-inner">
        <div className="fc-login-brand-logo">
          <div className="fc-login-brand-logo-icon">
            <PiFactoryFill size={26} />
          </div>
          <span className="fc-login-brand-logo-text">{APP_NAME}</span>
        </div>

        <h2 className="fc-login-brand-title">
          AI-Based Automated Fabric Defect Detection System
        </h2>

        <p className="fc-login-brand-desc">
          AI-powered real-time fabric quality inspection and automated defect
          detection.
        </p>

        {/* Visual feature strip: fabric inspection / AI / camera / manufacturing */}
        <div className="fc-login-feature-grid">
          <div className="fc-login-feature">
            <div className="fc-login-feature-icon">
              <GiRolledCloth size={20} />
            </div>
            <span>Fabric Inspection</span>
          </div>
          <div className="fc-login-feature">
            <div className="fc-login-feature-icon">
              <BsCpu size={18} />
            </div>
            <span>AI Detection Engine</span>
          </div>
          <div className="fc-login-feature">
            <div className="fc-login-feature-icon">
              <MdOutlineVideocam size={20} />
            </div>
            <span>Live Camera Feed</span>
          </div>
          <div className="fc-login-feature">
            <div className="fc-login-feature-icon">
              <MdOutlineBolt size={20} />
            </div>
            <span>ESP32 Automation</span>
          </div>
        </div>

        <div className="fc-login-status-strip">
          <span className="fc-pulse-dot" />
          <span>AI Inspection Engine — Standing By</span>
        </div>
      </div>

      {/* Decorative grid/scan overlay to reinforce the IoT control-panel feel */}
      <div className="fc-login-scan-line" />
      <MdOutlineGridView className="fc-login-corner-icon" size={140} />
    </div>
  );
};

export default LoginBrandPanel;
