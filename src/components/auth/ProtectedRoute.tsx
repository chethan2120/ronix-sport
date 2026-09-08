import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AppRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#E31B23] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            Loading Ronix Sports CRM...
          </span>
        </div>
      </div>
    );
  }

  // Not logged in -> Redirect to /login
  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = profile.role;

  // Check allowed roles for specific route
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect unauthorized user to their default home route
    if (role === 'stock') {
      return <Navigate to="/inventory" replace />;
    }
    if (role === 'customer') {
      return <Navigate to="/store" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
