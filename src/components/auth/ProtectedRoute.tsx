import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import type { UserRole } from "../../types/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // 역할이 맞지 않으면 해당 역할의 대시보드로 리다이렉트
    if (user.role === "family") {
      return <Navigate to="/" replace />;
    } else {
      return <Navigate to="/provider/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
