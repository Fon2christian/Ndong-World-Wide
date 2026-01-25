import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AuthContextType {
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ⚠️ DEMO ONLY - NOT FOR PRODUCTION USE ⚠️
// In production, authentication MUST be handled server-side with proper security:
// - Never store credentials in client-side code
// - Use proper JWT/session tokens
// - Implement rate limiting and brute force protection
// - Hash passwords with bcrypt/argon2
// These environment variables are used ONLY for local development/demo purposes.
const ADMIN_CREDENTIALS = {
  username: import.meta.env.VITE_DEMO_ADMIN_USERNAME || "admin",
  password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD || "admin123",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize synchronously from localStorage to prevent redirect on refresh
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("isAdmin") === "true";
  });

  // Sync state with localStorage on storage events (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "isAdmin") {
        setIsAdmin(e.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (username: string, password: string): boolean => {
    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      setIsAdmin(true);
      localStorage.setItem("isAdmin", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem("isAdmin");
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
