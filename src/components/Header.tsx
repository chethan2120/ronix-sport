import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Bell,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Package,
  CreditCard,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  User,
  LogOut,
  Lock,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { PasswordChangeModal } from './auth/PasswordChangeModal';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const {
    activeTab,
    currentWarehouse,
    setCurrentWarehouse,
    warehouses,
    notifications,
    markNotificationRead,
    clearNotifications,
    setActiveTab,
    isDemoMode,
    toggleDemoMode,
  } = useStore();

  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'b2b-orders':
        return 'B2B Order Flow (3 Clicks)';
      case 'b2c-pos':
        return 'B2C POS Quick Sale Flow';
      case 'products':
        return profile?.role === 'stock' ? 'Product Catalog (View-Only)' : 'Product Management';
      case 'inventory':
        return 'Inventory & Stock Accuracy';
      case 'customers':
        return 'Customer & Institution CRM';
      case 'pricing':
        return 'Pricing & Contract Management';
      case 'invoices':
        return 'Invoices & Billing';
      case 'quotations':
        return 'Quotations & B2B Proposals';
      case 'payments':
        return 'Payments & Transactions';
      case 'reports':
        return 'Sales & Stock Reports';
      case 'audit-trail':
        return 'Audit Trail & Compliance Log';
      case 'settings':
        return 'System & ERP Settings';
      case 'store':
      case 'storefront':
        return 'Ronix Customer Storefront';
      default:
        return 'Ronix Sports CRM';
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between shrink-0 z-30 sticky top-0">
        {/* Left: Mobile Menu & Page Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
          {profile?.role !== 'customer' && (
            <button
              id="mobile-menu-toggle"
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none cursor-pointer shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <h1 id="header-page-title" className="text-base sm:text-xl font-bold text-slate-900 leading-tight truncate">
              {getPageTitle()}
            </h1>
            <p className="text-xs text-slate-400 hidden md:block truncate">
              {currentWarehouse.name} &bull; Sports Equipment ERP
            </p>
          </div>
        </div>

        {/* Right Controls: Branch Selector, Notifications, User Profile */}
        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
          {/* Branch / Warehouse Selector (Desktop/Tablet) */}
          <div className="relative hidden md:block">
            <button
              id="location-selector-btn"
              onClick={() => {
                setShowLocationDropdown(!showLocationDropdown);
                setShowRoleDropdown(false);
                setShowNotifications(false);
              }}
              className="text-right cursor-pointer group flex flex-col items-end py-1"
            >
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">BRANCH</p>
              <p className="text-xs sm:text-sm text-slate-900 font-bold flex items-center gap-1 group-hover:text-[#E31B23] transition-colors">
                <span className="max-w-[120px] sm:max-w-[170px] truncate">{currentWarehouse.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E31B23]" />
              </p>
            </button>

            {showLocationDropdown && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#E31B23]" />
                  <span>Switch Branch Location</span>
                </div>
                <div className="divide-y divide-slate-50 py-1">
                  {warehouses.map((wh) => (
                    <button
                      key={wh.id}
                      id={`select-warehouse-${wh.id}`}
                      onClick={() => {
                        setCurrentWarehouse(wh);
                        setShowLocationDropdown(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-medium flex items-center justify-between hover:bg-[#FFF1F2] transition-colors cursor-pointer ${
                        currentWarehouse.id === wh.id ? 'bg-[#FFF1F2] text-[#E31B23] font-bold' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <span className="block">{wh.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{wh.code}</span>
                      </div>
                      {currentWarehouse.id === wh.id && (
                        <CheckCircle2 className="w-4 h-4 text-[#E31B23]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-7 w-[1px] bg-slate-200 hidden md:block"></div>

          {/* Quick Demo Mode Switcher (Desktop/Tablet) */}
          <button
            id="header-demo-mode-toggle"
            onClick={toggleDemoMode}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold hidden md:flex items-center gap-1.5 transition-all cursor-pointer select-none ${
              isDemoMode
                ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
            }`}
            title={
              isDemoMode
                ? 'Demo Mode is ACTIVE (showing sample data). Click to turn OFF.'
                : 'Demo Mode is OFF (showing real user data). Click to turn ON.'
            }
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isDemoMode ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>
              {isDemoMode ? 'Demo: ON' : 'Demo: OFF'}
            </span>
          </button>

          <div className="h-7 w-[1px] bg-slate-200 hidden md:block"></div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              id="notifications-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowLocationDropdown(false);
                setShowRoleDropdown(false);
              }}
              className="bg-slate-100 p-2 rounded-xl text-slate-600 hover:text-[#E31B23] hover:bg-[#FFF1F2] transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-[#E31B23] text-white text-[9px] font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-[#FFF1F2] text-[#E31B23] border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={clearNotifications}
                    className="text-[11px] text-[#E31B23] hover:underline font-semibold cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-5 text-center text-xs text-slate-400">No new notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.linkTab) {
                            setActiveTab(n.linkTab);
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                          !n.read ? 'bg-red-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {n.type === 'alert' ? (
                            <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                          ) : n.type === 'order' ? (
                            <Package className="w-4 h-4 text-[#E31B23] shrink-0 mt-0.5" />
                          ) : (
                            <CreditCard className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-bold text-slate-800">{n.title}</p>
                            <p className="text-slate-600 mt-0.5 text-[11px]">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 inline-block">{n.time}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-7 w-[1px] bg-slate-200 hidden sm:block"></div>

          {/* User Profile & Account Dropdown */}
          <div className="relative">
            <button
              id="user-profile-btn"
              onClick={() => {
                setShowRoleDropdown(!showRoleDropdown);
                setShowLocationDropdown(false);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#E31B23] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                {profile?.full_name
                  ? profile.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 group-hover:text-[#E31B23] transition-colors leading-tight truncate max-w-[110px]">
                  {profile?.full_name || profile?.email}
                </p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  {profile?.role === 'admin'
                    ? 'Store Admin'
                    : profile?.role === 'stock'
                    ? 'Stock Staff'
                    : 'Customer'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E31B23]" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-slate-100">
                  <span className="block font-bold text-slate-900 text-xs truncate">{profile?.full_name}</span>
                  <span className="block text-[11px] text-slate-500 font-mono truncate">{profile?.email}</span>
                  <span className="mt-1 inline-block px-2 py-0.5 rounded-md bg-red-50 text-[#E31B23] border border-red-200 text-[9px] font-black uppercase tracking-wider">
                    {profile?.role}
                  </span>
                </div>

                <div className="py-1 px-2 space-y-1">
                  <button
                    onClick={() => {
                      setIsPasswordModalOpen(true);
                      setShowRoleDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span>Change Password</span>
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-[#E31B23]" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};
