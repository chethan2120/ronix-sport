import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  FileSpreadsheet,
  FileText,
  Users,
  Receipt,
  BarChart3,
  Store,
  Tag,
  CreditCard,
  History,
  Settings,
  ExternalLink,
  ChevronRight,
  Building2,
  LogOut,
  Lock,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { PasswordChangeModal } from './auth/PasswordChangeModal';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    activeTab,
    setActiveTab,
    currentWarehouse,
    setCurrentWarehouse,
    warehouses,
    isDemoMode,
    toggleDemoMode,
  } = useStore();

  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // If customer role, do NOT render full CRM sidebar
  if (profile?.role === 'customer') {
    return null;
  }

  const role = profile?.role || 'admin';

  // Primary navigation items filtered by role
  const allPrimaryNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { id: 'products', label: 'Products', icon: Package, roles: ['admin', 'stock'] },
    { id: 'inventory', label: 'Inventory', icon: Boxes, roles: ['admin', 'stock'] },
    { id: 'b2b-orders', label: 'B2B Orders', icon: ShoppingCart, roles: ['admin'] },
    { id: 'quotations', label: 'Quotations', icon: FileSpreadsheet, roles: ['admin'] },
    { id: 'invoices', label: 'Invoices', icon: FileText, roles: ['admin'] },
    { id: 'customers', label: 'Customers', icon: Users, roles: ['admin'] },
    { id: 'b2c-pos', label: 'POS / Counter Sales', icon: Receipt, roles: ['admin'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['admin'] },
    { id: 'storefront', label: 'Customer Storefront', icon: Store, isNew: true, roles: ['admin'] },
  ];

  // Secondary management items filtered by role
  const allSecondaryNavItems = [
    { id: 'pricing', label: 'B2B Price Tiers', icon: Tag, roles: ['admin'] },
    { id: 'payments', label: 'Payment Ledger', icon: CreditCard, roles: ['admin'] },
    { id: 'audit-trail', label: 'Audit Trail', icon: History, roles: ['admin'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin'] },
  ];

  const primaryNavItems = allPrimaryNavItems.filter((item) => item.roles.includes(role));
  const secondaryNavItems = allSecondaryNavItems.filter((item) => item.roles.includes(role));

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (setMobileOpen) setMobileOpen(false);
    if (tabId === 'dashboard') {
      navigate('/dashboard');
    } else if (tabId === 'storefront') {
      navigate('/store');
    } else {
      navigate(`/${tabId}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <aside
        id="main-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-[240px] bg-white text-slate-700 flex flex-col h-full shrink-0 border-r border-slate-200 shadow-sm transition-transform duration-300 ease-in-out select-none lg:static ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand & Logo Header */}
        <div className="p-4.5 border-b border-slate-100 flex items-center justify-between">
          <div
            id="brand-logo-btn"
            onClick={() => handleNavClick(role === 'stock' ? 'inventory' : 'dashboard')}
            className="flex items-center space-x-3 cursor-pointer group flex-1 min-w-0"
          >
            {/* Logo badge with Red branding */}
            <div className="w-10 h-10 bg-[#E31B23] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xs group-hover:bg-[#B5121B] transition-colors shrink-0">
              R
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[#111827] font-black text-sm tracking-tight block leading-tight group-hover:text-[#E31B23] transition-colors">
                  RONIX <span className="text-[#E31B23]">SPORTS</span>
                </span>
              </div>
              <span className="text-[9px] text-[#6B7280] font-bold tracking-wider uppercase block truncate">
                {role === 'stock' ? 'STOCK PORTAL' : 'SPORTS EQUIPMENT CRM'}
              </span>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-md bg-[#FFF1F2] text-[#E31B23] border border-red-200 font-black text-[9px] uppercase tracking-wider shrink-0">
            {role.toUpperCase()}
          </span>
        </div>

        {/* Mobile Controls Section: Branch & Demo Mode */}
        <div className="px-3 py-2 bg-[#F8F9FA] border-b border-slate-200 lg:hidden space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
              <Building2 className="w-3.5 h-3.5 text-[#E31B23]" />
              <span>Branch</span>
            </div>
            <select
              value={currentWarehouse.id}
              onChange={(e) => {
                const wh = warehouses.find((w) => w.id === e.target.value);
                if (wh) setCurrentWarehouse(wh);
              }}
              className="text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#E31B23]"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Demo Data</span>
            <button
              onClick={toggleDemoMode}
              className={`px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDemoMode
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>{isDemoMode ? 'Demo ON' : 'Demo OFF'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Primary Items */}
          <nav className="space-y-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (item.id === 'storefront' && (activeTab === 'store' || activeTab === 'storefront'));
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between cursor-pointer text-left transition-all text-xs font-bold ${
                    isActive
                      ? 'bg-[#FFF1F2] text-[#E31B23] border-l-4 border-[#E31B23] shadow-2xs'
                      : 'text-[#111827] hover:bg-slate-50 hover:text-[#E31B23]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-[#E31B23]' : 'text-slate-400 group-hover:text-[#E31B23]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.isNew && (
                    <span className="px-1.5 py-0.2 rounded bg-[#E31B23] text-white text-[9px] font-black tracking-wider uppercase shadow-2xs">
                      NEW
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Secondary section (Admin Only) */}
          {secondaryNavItems.length > 0 && (
            <div>
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                System & Finance
              </span>
              <nav className="space-y-0.5">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav-${item.id}`}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full px-3 py-2 rounded-xl flex items-center space-x-2.5 cursor-pointer text-left transition-all text-xs font-semibold ${
                        isActive
                          ? 'bg-[#FFF1F2] text-[#E31B23] border-l-4 border-[#E31B23]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-[#E31B23]'
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? 'text-[#E31B23]' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Bottom of Sidebar: Staff profile + Change Password & Logout */}
        <div className="p-3 border-t border-slate-100 bg-[#F8F9FA] space-y-2">
          {role === 'admin' && (
            <button
              id="btn-view-customer-store"
              onClick={() => handleNavClick('storefront')}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#FFF1F2] border border-slate-200 text-slate-800 hover:text-[#E31B23] font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-2">
                <Store className="w-3.5 h-3.5 text-[#E31B23]" />
                <span>Customer Store</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E31B23]" />
            </button>
          )}

          {/* User Profile Card */}
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#E31B23] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs">
                  {profile?.full_name
                    ? profile.full_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    : 'U'}
                </div>
                <div className="overflow-hidden min-w-0">
                  <p className="text-[#111827] text-xs font-bold truncate">
                    {profile?.full_name || profile?.email}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    {profile?.role === 'admin' ? 'Store Admin' : 'Stock Staff'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 pt-1 border-t border-slate-100">
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer border border-slate-200/80"
                title="Change Password"
              >
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Password</span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-[#E31B23] font-bold text-[11px] rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer border border-red-200"
                title="Sign Out"
              >
                <LogOut className="w-3 h-3 text-[#E31B23]" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};
