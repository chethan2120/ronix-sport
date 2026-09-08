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
  Circle,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activeTab, setActiveTab, currentUser, setCurrentUser, users } = useStore();
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Main navigation items ordered per user specification
  const primaryNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'b2b-orders', label: 'B2B Orders', icon: ShoppingCart },
    { id: 'quotations', label: 'Quotations', icon: FileSpreadsheet },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'b2c-pos', label: 'POS / Counter Sales', icon: Receipt },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'storefront', label: 'Customer Storefront', icon: Store, isNew: true },
  ];

  // Secondary management items
  const secondaryNavItems = [
    { id: 'pricing', label: 'B2B Price Tiers', icon: Tag },
    { id: 'payments', label: 'Payment Ledger', icon: CreditCard },
    { id: 'audit-trail', label: 'Audit Trail', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const navigate = useNavigate();

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

  const handleSwitchUser = () => {
    // Cycle through available users (Staff -> Admin -> B2B Buyer)
    const currentIndex = users.findIndex((u) => u.id === currentUser.id);
    const nextIndex = (currentIndex + 1) % users.length;
    setCurrentUser(users[nextIndex]);
  };

  return (
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
          onClick={() => handleNavClick('dashboard')}
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
              SPORTS EQUIPMENT CRM
            </span>
          </div>
        </div>

        {/* Professional Enterprise/Pro Badge */}
        <span className="px-2 py-0.5 rounded-md bg-[#FFF1F2] text-[#E31B23] border border-red-200 font-black text-[9px] uppercase tracking-wider shrink-0">
          PRO
        </span>
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

        {/* Secondary section */}
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
      </div>

      {/* Bottom of Sidebar: Staff profile + Online status + Direct Store button */}
      <div className="p-3 border-t border-slate-100 bg-[#F8F9FA] space-y-2.5">
        {/* Direct Button: [ View Customer Store ↗ ] */}
        <button
          id="btn-view-customer-store"
          onClick={() => handleNavClick('storefront')}
          className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-[#FFF1F2] border border-slate-200 hover:border-red-200 text-slate-800 hover:text-[#E31B23] font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
        >
          <div className="flex items-center gap-2">
            <Store className="w-3.5 h-3.5 text-[#E31B23]" />
            <span>Customer Store</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E31B23]" />
        </button>

        {/* Staff User Profile Card */}
        <div
          id="user-profile-footer"
          onClick={handleSwitchUser}
          className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-red-200 cursor-pointer transition-all shadow-2xs"
          title="Click to switch active role / user"
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-[#E31B23] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs">
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              {/* Quick status indicator (Online / Offline) */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
            </div>

            <div className="overflow-hidden min-w-0">
              <p className="text-[#111827] text-xs font-bold truncate">
                {currentUser.name}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 truncate font-medium">
                  {currentUser.role === 'Admin'
                    ? 'Store Admin'
                    : currentUser.role === 'Staff'
                    ? 'Store Staff'
                    : 'B2B Buyer'}
                </span>
                <span className="text-[9px] text-emerald-600 font-bold">
                  &bull; Online
                </span>
              </div>
            </div>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        </div>
      </div>
    </aside>
  );
};
