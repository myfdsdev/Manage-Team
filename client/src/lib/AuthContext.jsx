import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getToken } from '@/api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({
    id: 'workflow',
    public_settings: {},
  });

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    const token = getToken();

    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      return;
    }

    try {
      setIsLoadingAuth(true);

      const currentUser = await base44.auth.me();

      setUser(currentUser);
      setIsAuthenticated(true);
      setAuthError(null);
      window.dispatchEvent(new Event('app-settings-refresh'));
    } catch (error) {
      console.error('Auth check failed:', error);

      setUser(null);
      setIsAuthenticated(false);

      if (error.status === 401 || error.status === 403) {
        setAuthError({
          type: 'auth_required',
          message: 'Please log in',
        });
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = async (email, password) => {
    const result = await base44.auth.login(email, password);

    setUser(result.user);
    setIsAuthenticated(true);
    setAuthError(null);
    window.dispatchEvent(new Event('app-settings-refresh'));

    return result;
  };

  const googleLogin = async (credential) => {
    const result = await base44.auth.googleLogin(credential);

    setUser(result.user);
    setIsAuthenticated(true);
    setAuthError(null);
    window.dispatchEvent(new Event('app-settings-refresh'));

    return result;
  };

  // Passwordless unlock via the public /join-admin page. If the email already
  // belongs to a real account the backend returns { existing: true } and no
  // token — the caller redirects to normal login instead.
  const joinAdmin = async (name, email, password) => {
    const result = await base44.auth.joinAdmin(name, email, password);

    if (result?.token && result?.user) {
      setUser(result.user);
      setIsAuthenticated(true);
      setAuthError(null);
      window.dispatchEvent(new Event('app-settings-refresh'));
    }

    return result;
  };

  // Accept a team invitation — signs up and gets assigned to the workspace.
  const joinMember = async (payload) => {
    const result = await base44.auth.joinMember(payload);

    if (result?.token && result?.user) {
      setUser(result.user);
      setIsAuthenticated(true);
      setAuthError(null);
      window.dispatchEvent(new Event('app-settings-refresh'));
    }

    return result;
  };

  const register = async (userData) => {
    const result = await base44.auth.register(userData);

    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);

    return result;
  };

  const logout = (shouldRedirect = true) => {
    base44.auth.logout(shouldRedirect ? window.location.origin + '/Welcome' : null);

    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
  };

  const navigateToLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  const checkAppState = () => checkUserAuth();
  const refreshUser = () => checkUserAuth();
  const updateUserState = (nextUser) => {
    setUser(nextUser);
    setIsAuthenticated(Boolean(nextUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        login,
        googleLogin,
        joinAdmin,
        joinMember,
        register,
        logout,
        navigateToLogin,
        checkAppState,
        refreshUser,
        updateUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
