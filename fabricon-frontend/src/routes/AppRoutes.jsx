import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';

import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import LiveDetection from '../pages/LiveDetection';
import History from '../pages/History';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';

import { ROUTES } from '../utils/constants';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route path={ROUTES.LOGIN} element={<Login />} />

      {/* Protected admin routes — share AdminLayout (Sidebar + Topbar) */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.LIVE_DETECTION} element={<LiveDetection />} />
        <Route path={ROUTES.HISTORY} element={<History />} />
        <Route path={ROUTES.SETTINGS} element={<Settings />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;