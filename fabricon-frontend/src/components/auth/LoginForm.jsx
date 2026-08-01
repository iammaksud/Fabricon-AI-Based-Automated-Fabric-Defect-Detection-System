import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdOutlineEmail,
  MdLockOutline,
  MdVisibility,
  MdVisibilityOff,
  MdErrorOutline,
} from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';

const REMEMBER_KEY = 'fabricon_remember_email';

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    () => localStorage.getItem(REMEMBER_KEY) || ''
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    () => !!localStorage.getItem(REMEMBER_KEY)
  );

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      errors.email = 'Enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validate()) return;

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setFormError(result.message || 'Login failed. Please try again.');
      return;
    }

    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, email.trim());
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }

    navigate(ROUTES.DASHBOARD, { replace: true });
  };

  return (
    <div className="fc-login-form-wrapper">
      <div className="fc-panel fc-login-card">
        <div className="mb-4">
          <h4 className="mb-1">Admin Login</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.88rem' }}>
            Sign in to access the Fabricon control panel.
          </p>
        </div>

        {formError && (
          <div className="fc-login-alert" role="alert">
            <MdErrorOutline size={18} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <div className="input-group fc-login-input-group">
              <span className="input-group-text">
                <MdOutlineEmail size={18} />
              </span>
              <input
                id="email"
                type="email"
                className={`form-control ${
                  fieldErrors.email ? 'is-invalid' : ''
                }`}
                placeholder="admin@fabricon.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>
            {fieldErrors.email && (
              <div className="fc-field-error">{fieldErrors.email}</div>
            )}
          </div>

          {/* Password */}
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-group fc-login-input-group">
              <span className="input-group-text">
                <MdLockOutline size={18} />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-control ${
                  fieldErrors.password ? 'is-invalid' : ''
                }`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="input-group-text fc-login-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <MdVisibilityOff size={18} />
                ) : (
                  <MdVisibility size={18} />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <div className="fc-field-error">{fieldErrors.password}</div>
            )}
          </div>

          {/* Remember me */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <label
                className="form-check-label"
                htmlFor="rememberMe"
                style={{ fontSize: '0.88rem' }}
              >
                Remember me
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 fc-login-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="fc-login-hint">
          Demo credentials — admin@fabricon.com / admin123
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
