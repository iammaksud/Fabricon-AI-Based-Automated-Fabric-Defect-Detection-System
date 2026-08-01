import { NavLink } from 'react-router-dom';
import {
  MdOutlineDashboard,
  MdOutlineVideocam,
  MdOutlineHistory,
  MdOutlineSettings,
  MdLogout,
  MdClose,
} from 'react-icons/md';
import { PiFactoryFill } from 'react-icons/pi';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES, APP_NAME } from '../../utils/constants';

const navItems = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: MdOutlineDashboard },
  { path: ROUTES.LIVE_DETECTION, label: 'Live Detection', icon: MdOutlineVideocam },
  { path: ROUTES.HISTORY, label: 'History', icon: MdOutlineHistory },
  { path: ROUTES.SETTINGS, label: 'Settings', icon: MdOutlineSettings },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  return (
    <>
      {/* Backdrop for mobile — closes sidebar on outside tap */}
      {isOpen && (
        <div
          className="fc-sidebar-backdrop d-lg-none"
          onClick={onClose}
        />
      )}

      <aside className={`fc-sidebar ${isOpen ? 'fc-sidebar-open' : ''}`}>
        <div className="fc-sidebar-brand">
          <div className="fc-sidebar-brand-icon">
            <PiFactoryFill size={22} />
          </div>
          <div className="fc-sidebar-brand-text">
            <span className="fc-sidebar-brand-name">{APP_NAME}</span>
            <span className="fc-sidebar-brand-sub">Defect Detection</span>
          </div>
          <button className="fc-sidebar-close d-lg-none" onClick={onClose}>
            <MdClose size={20} />
          </button>
        </div>

        <nav className="fc-sidebar-nav">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `fc-sidebar-link ${isActive ? 'fc-sidebar-link-active' : ''}`
              }
              onClick={onClose}
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="fc-sidebar-footer">
          <button className="fc-sidebar-link fc-sidebar-logout" onClick={logout}>
            <MdLogout size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;