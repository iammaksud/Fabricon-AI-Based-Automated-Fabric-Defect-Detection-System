import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

const NotFound = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-center">
      <h1 className="display-4 fw-bold" style={{ color: 'var(--fc-primary)' }}>404</h1>
      <p className="text-muted mb-3">Page not found.</p>
      <Link to={ROUTES.DASHBOARD} className="btn btn-primary">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;