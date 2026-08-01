import { MdMenu } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';

const Topbar = ({ title, onMenuClick }) => {
  const { admin } = useAuth();

  // System status placeholder — will later reflect real ESP32/API/camera health
  const systemOnline = true;

  const initials = admin?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AD';

  return (
    <header className="fc-topbar">
      <div className="d-flex align-items-center">
        <button className="fc-topbar-menu-btn d-lg-none" onClick={onMenuClick}>
          <MdMenu size={24} />
        </button>
        <h1 className="fc-topbar-title">{title}</h1>
      </div>

      <div className="fc-topbar-right">
        <div className="fc-topbar-system-status">
          <span
            className={`fc-status-pill ${
              systemOnline ? 'fc-status-ok' : 'fc-status-danger'
            }`}
          >
            {systemOnline ? 'System Online' : 'System Offline'}
          </span>
        </div>

        <div className="fc-topbar-admin">
          <div className="fc-topbar-admin-avatar">{initials}</div>
          <div className="fc-topbar-admin-info d-none d-md-flex">
            <span className="fc-topbar-admin-name">
              {admin?.name || 'Admin'}
            </span>
            <span className="fc-topbar-admin-role">
              {admin?.role || 'ADMIN'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;