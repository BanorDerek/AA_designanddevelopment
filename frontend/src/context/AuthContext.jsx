import { createContext, useContext, useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('aa_admin_token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('aa_admin_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');

  if (data.requires2FA) {
    return { requires2FA: true, pendingToken: data.pendingToken };
  }

  localStorage.setItem('aa_admin_token', data.token);
  localStorage.setItem('aa_admin_user', JSON.stringify(data.user));
  setToken(data.token);
  setUser(data.user);
  return data;
};

const completeTwoFactorLogin = async (pendingToken, code) => {
  const res = await fetch(`${API_BASE}/auth/2fa/login-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pendingToken, code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Verification failed');

  localStorage.setItem('aa_admin_token', data.token);
  localStorage.setItem('aa_admin_user', JSON.stringify(data.user));
  setToken(data.token);
  setUser(data.user);
  return data;
};

  const logout = () => {
    localStorage.removeItem('aa_admin_token');
    localStorage.removeItem('aa_admin_user');
    setToken(null);
    setUser(null);
  };

  // Wrapper so every admin API call automatically sends the auth header
  // and consistently handles an expired/invalid session.
  const authFetch = useCallback(
    async (path, options = {}) => {
      const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        logout();
        throw new Error('Session expired, please log in again');
      }
      return res;
    },
    [token]
  );

  return (
    <AuthContext.Provider value={{ token, user, login, completeTwoFactorLogin, logout, authFetch, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}