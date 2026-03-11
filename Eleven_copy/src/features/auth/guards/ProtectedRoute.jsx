import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (user?.isBlock) {
      toast.error("⚠️ Your account has been blocked by admin.");
      logout();
    }
  }, [user, logout]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || user.isBlock) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
