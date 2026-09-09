import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AppRole, UserProfile } from '../../types';
import { Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
  moduleId?: string;
}

export const getFirstAllowedRouteForUser = (
  profile: UserProfile | null,
  hasPermissionFn: (mod: string) => boolean
): string => {
  if (!profile) return '/login';
  if (profile.role === 'admin') return '/dashboard';
  if (profile.role === 'customer') return '/store';

  const staffModulesOrder = [
    'inventory',
    'b2c-pos',
    'products',
    'customer-orders',
    'b2b-orders',
    'quotations',
    'invoices',
    'customers',
    'reports',
    'storefront',
    'pricing',
    'payments',
    'audit-trail',
    'settings',
  ];

  for (const mod of staffModulesOrder) {
    if (hasPermissionFn(mod)) {
      if (mod === 'storefront') return '/store';
      return `/${mod}`;
    }
  }

  return '/store';
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, moduleId }) => {
  const { profile, loading, hasPermission } = useAuth();
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

  // Check module permission if moduleId provided
  if (moduleId && !hasPermission(moduleId)) {
    const fallbackRoute = getFirstAllowedRouteForUser(profile, hasPermission);
    if (fallbackRoute !== location.pathname) {
      return <Navigate to={fallbackRoute} replace />;
    }
    return (
      <div className="min-h-[60vh] bg-[#F8F9FA] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-slate-900">Access Denied</h2>
          <p className="text-xs text-slate-600">
            You do not have permission to access this module. Please contact your system administrator.
          </p>
          <button
            onClick={() => (window.location.href = '/store')}
            className="px-4 py-2 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            Go to Storefront
          </button>
        </div>
      </div>
    );
  }

  // Check allowed roles for specific route
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    const fallbackRoute = getFirstAllowedRouteForUser(profile, hasPermission);
    if (fallbackRoute !== location.pathname) {
      return <Navigate to={fallbackRoute} replace />;
    }
  }

  return <>{children}</>;
};
