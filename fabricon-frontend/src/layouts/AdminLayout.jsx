import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Topbar from '../components/common/Topbar';
import { ROUTES } from '../utils/constants';

// Maps route path -> readable page title shown in Topbar
const PAGE_TITLES = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.LIVE_DETECTION]: 'Live Detection',
  [ROUTES.HISTORY]: 'Detection History',
  [ROUTES.SETTINGS]: 'System Settings',
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] || 'Fabricon';

  return (
    <div className="fc-app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="fc-main">
        <Topbar title={pageTitle} onMenuClick={() => setSidebarOpen(true)} />
        <main className="fc-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;