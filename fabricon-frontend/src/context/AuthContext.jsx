import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session (token + admin profile) from localStorage on refresh.
  useEffect(() => {
    const session = authService.getSession();
    if (session?.user) {
      setAdmin(session.user);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const session = await authService.login(email, password);
      setAdmin(session.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Invalid email or password. Please try again.',
      };
    }
  };

  const logout = () => {
    authService.logout();
    setAdmin(null);
  };

  const value = {
    admin,
    isAuthenticated: !!admin,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};