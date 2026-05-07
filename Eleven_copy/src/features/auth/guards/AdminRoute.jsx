// src/Pages/Auth/AdminRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not logged in
  if (!user || !user.id) {
    return <Navigate to="/login" replace />;
  }

  // If user is not admin
  if (user.role?.toLowerCase() !== 'admin') {
    
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};


export default AdminRoute;
