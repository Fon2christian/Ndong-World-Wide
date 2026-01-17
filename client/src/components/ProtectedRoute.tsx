import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
