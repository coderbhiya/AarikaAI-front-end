import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#09090b]">
        <div className="w-8 h-8 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
      </div>
    );
  }

  // If route requires authentication and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Redirect to login page, saving the attempted location
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If route doesn't require authentication and user is authenticated
  // (e.g., login page when already logged in)
  if (!requireAuth && isAuthenticated) {
    // Redirect to home/dashboard
    return <Navigate to="/index" replace />;
  }

  return <>{children}</>;
};