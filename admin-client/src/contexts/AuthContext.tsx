import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
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
    // Capture current token once to avoid race conditions throughout this async flow
    const currentTokenAtStart = localStorage.getItem(TOKEN_KEY);
    const isStillCurrent = currentTokenAtStart === token;

    try {
      const response = await axios.get<Admin>(`${API_URL}/api/admin/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Only update state if this token is still current (prevent stale requests from clearing new sessions)
      if (isStillCurrent) {
        setAdmin(response.data);
      }
    } catch (error) {
      // Only clear if this token is still the current one
      if (isStillCurrent) {
        localStorage.removeItem(TOKEN_KEY);
        setAdmin(null);
      }
    } finally {
      // Always clear loading for this verification attempt, regardless of token changes
      // If a fresh login occurred during verification, it will have already set isLoading to false
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    const response = await axios.post<AuthResponse>(`${API_URL}/api/admin/login`, credentials);
    const { token, admin: adminData } = response.data;
    localStorage.setItem(TOKEN_KEY, token);
    setAdmin(adminData);
    setIsLoading(false); // Ensure loading state is cleared after successful login
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{
      admin,
      isAuthenticated: !!admin,
      isLoading,
      login,
      logout
    }}>
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
