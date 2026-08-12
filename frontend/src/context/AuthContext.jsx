import { useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/auth.js';
import { clearAccessToken, getAccessToken, setAccessToken } from '../api/tokenStore.js';
import { AuthContext } from './authContext.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const endLocalSession = useCallback(() => {
    clearAccessToken();
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!getAccessToken()) {
        setLoading(false);
        return;
      }

      try {
        const data = await authApi.me();
        if (active) setUser(data.user);
      } catch {
        if (active) endLocalSession();
      } finally {
        if (active) setLoading(false);
      }
    }

    restoreSession();
    const handleExpiredSession = () => endLocalSession();
    window.addEventListener('quiz:session-expired', handleExpiredSession);

    return () => {
      active = false;
      window.removeEventListener('quiz:session-expired', handleExpiredSession);
    };
  }, [endLocalSession]);

  const login = useCallback(async (credentials) => {
    const session = await authApi.login(credentials);
    setAccessToken(session.accessToken);
    setUser(session.user);
    return session.user;
  }, []);

  const register = useCallback(async (payload) => {
    const session = await authApi.register(payload);
    setAccessToken(session.accessToken);
    setUser(session.user);
    return session.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      endLocalSession();
    }
  }, [endLocalSession]);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
