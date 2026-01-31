import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import axios from 'axios';
import type { Admin, LoginCredentials, AuthResponse } from '../types';

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const TOKEN_KEY = 'admin_token';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      const response = await axios.get<Admin>(`${API_URL}/api/admin/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Check if token is still current AFTER async call (detect changes during request)
      const currentToken = localStorage.getItem(TOKEN_KEY);
      if (currentToken === token) {
        setAdmin(response.data);
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

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
  }, []);

  const value = useMemo(() => ({
    admin,
    isAuthenticated: !!admin,
    isLoading,
    login,
    logout
  }), [admin, isLoading, login, logout]);

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
