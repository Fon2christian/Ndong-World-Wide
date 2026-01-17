import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AuthContextType {
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo admin credentials (in production, this would be server-side)
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize synchronously from localStorage to prevent redirect on refresh
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("isAdmin") === "true";
  });

  // Keep useEffect for any future side effects or cross-tab sync
  useEffect(() => {
    const adminSession = localStorage.getItem("isAdmin");
    if (adminSession === "true" && !isAdmin) {
      setIsAdmin(true);
    }
  }, [isAdmin]);

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
