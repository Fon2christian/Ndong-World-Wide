import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import axios from 'axios';
import type { Admin, LoginCredentials, RegisterFormData, AuthResponse } from '../types';
import { useInactivityTimeout } from '../hooks/useInactivityTimeout';

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  inactivityLogout: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  clearInactivityFlag: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const TOKEN_KEY = 'admin_token';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inactivityLogout, setInactivityLogout] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await axios.get<{ admin: Admin }>(`${API_URL}/api/admin/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Check if token is still current AFTER async call (detect changes during request)
      const currentToken = localStorage.getItem(TOKEN_KEY);
      if (currentToken === token) {
        setAdmin(response.data.admin);
      }
    } catch (error) {
      // Check if token is still current AFTER async call (detect changes during request)
      const currentToken = localStorage.getItem(TOKEN_KEY);
      if (currentToken === token) {
        localStorage.removeItem(TOKEN_KEY);
        setAdmin(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await axios.post<AuthResponse>(`${API_URL}/api/admin/login`, credentials);
    const { token, admin: adminData } = response.data;
    localStorage.setItem(TOKEN_KEY, token);
    setAdmin(adminData);
    setIsLoading(false); // Ensure loading state is cleared after successful login
  }, []);

  const register = useCallback(async (data: RegisterFormData) => {
    const response = await axios.post<AuthResponse>(`${API_URL}/api/admin/register`, data);
    const { token, admin: adminData } = response.data;
    localStorage.setItem(TOKEN_KEY, token);
    setAdmin(adminData);
    setIsLoading(false); // Ensure loading state is cleared after successful registration
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
  }, []);

  const handleInactivityLogout = useCallback(() => {
    setInactivityLogout(true);
    logout();
  }, [logout]);

  const clearInactivityFlag = useCallback(() => {
    setInactivityLogout(false);
  }, []);

  // Auto-logout after 30 minutes of inactivity
  useInactivityTimeout({
    timeout: 30 * 60 * 1000, // 30 minutes in milliseconds
    onTimeout: handleInactivityLogout,
    enabled: !!admin, // Only track inactivity when user is logged in
  });

  const value = useMemo(() => ({
    admin,
    isAuthenticated: !!admin,
    isLoading,
    inactivityLogout,
    login,
    register,
    logout,
    clearInactivityFlag
  }), [admin, isLoading, inactivityLogout, login, register, logout, clearInactivityFlag]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
