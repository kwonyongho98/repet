import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import type { UserRole } from "../../types/auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // 역할이 맞지 않으면 해당 역할의 대시보드로 리다이렉트
    if (user.role === "family") {
      return <Navigate to="/home" replace />;
    } else {
      return <Navigate to="/provider/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
