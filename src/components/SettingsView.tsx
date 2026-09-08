import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Sliders,
  Database,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Printer,
  FileCheck,
  HardDrive,
  Info,
  ToggleLeft,
  ToggleRight,
  Store,
  Receipt,
  RotateCcw,
  UserPlus,
  Users,
  Key,
  UserX,
  UserCheck,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { AppRole, UserProfile } from '../types';

export const SettingsView: React.FC = () => {
  const {
    isDemoMode,
    toggleDemoMode,
    resetDemoData,
    products,
    customers,
    invoices,
    quotations,
    b2bOrders,
    b2cSales,
    payments,
    auditLogs,
    currentWarehouse,
  } = useStore();

  const {
    profile: currentUserProfile,
    allProfiles,
    adminCreateStaffUser,
    adminUpdateUser,
    adminResetUserPassword,
    adminToggleUserStatus,
  } = useAuth();

  const [companyName, setCompanyName] = useState('Ronix Sports Pvt Ltd');
  const [gstin, setGstin] = useState('29AABCR8842K1Z9');
  const [address, setAddress] = useState('Brigade Sports Hub, MG Road, Bengaluru, KA - 560001');
  const [supportEmail, setSupportEmail] = useState('support@ronixsports.com');
  const [salesPhone, setSalesPhone] = useState('+91 98765 43210');
  const [autoPrintPOS, setAutoPrintPOS] = useState(true);
  const [thermalPaperWidth, setThermalPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // User Management Modal States
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<AppRole>('stock');
  const [newTempPassword, setNewTempPassword] = useState('');
  const [userActionError, setUserActionError] = useState<string | null>(null);
  const [userActionSuccess, setUserActionSuccess] = useState<string | null>(null);
  const [userActionLoading, setUserActionLoading] = useState(false);

  // Password Reset Modal State for Admin
  const [resetTargetUser, setResetTargetUser] = useState<UserProfile | null>(null);
  const [adminNewPassword, setAdminNewPassword] = useState('');

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleExportBackup = () => {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        version: 'ronix_sports_crm_db_v1',
        isDemoMode,
        counts: {
          products: products.length,
          customers: customers.length,
          invoices: invoices.length,
          quotations: quotations.length,
          b2bOrders: b2bOrders.length,
          b2cSales: b2cSales.length,
          payments: payments.length,
          auditLogs: auditLogs.length,
        },
        data: {
          products,
          customers,
          invoices,
          quotations,
          b2bOrders,
          b2cSales,
          payments,
        },
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ronix-sports-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Backup export failed:', err);
    }
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setResetConfirmOpen(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserActionError(null);
    setUserActionSuccess(null);
    setUserActionLoading(true);

    const res = await adminCreateStaffUser({
      fullName: newFullName,
      email: newEmail,
      role: newRole,
      tempPassword: newTempPassword,
    });

    setUserActionLoading(false);

    if (res.success) {
      setUserActionSuccess(`User ${newFullName} (${newEmail}) created successfully.`);
      setNewFullName('');
      setNewEmail('');
      setNewRole('stock');
      setNewTempPassword('');
      setTimeout(() => {
        setUserActionSuccess(null);
        setIsAddUserOpen(false);
      }, 1500);
    } else {
      setUserActionError(res.error || 'Failed to create user.');
    }
  };

  const handleToggleRole = async (u: UserProfile) => {
    const targetRole: AppRole = u.role === 'admin' ? 'stock' : 'admin';
    const res = await adminUpdateUser(u.id, { role: targetRole });
    if (!res.success) {
      alert(res.error || 'Failed to change user role');
    }
  };

  const handleToggleStatus = async (u: UserProfile) => {
    const res = await adminToggleUserStatus(u.id);
    if (!res.success) {
      alert(res.error || 'Failed to update user status');
    }
  };

  const handleAdminResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    setUserActionLoading(true);
    const res = await adminResetUserPassword(resetTargetUser.id, adminNewPassword);
    setUserActionLoading(false);
    if (res.success) {
      alert(`Password for ${resetTargetUser.email} has been updated.`);
      setResetTargetUser(null);
      setAdminNewPassword('');
    } else {
      alert(res.error || 'Failed to reset password');
    }
  };

  const isAdmin = currentUserProfile?.role === 'admin';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[#111827] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#E31B23]" />
            <span>SYSTEM SETTINGS & ERP CONFIGURATION</span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Manage demo data visibility, business profile, GST details, user accounts, and data backups.
          </p>
        </div>

        {isSavedNotice && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved</span>
          </div>
        )}
      </div>

      {/* SECTION 1: USER MANAGEMENT & ROLES (ADMIN ONLY) */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#E31B23]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>USER MANAGEMENT & ACCESS ROLES</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#E31B23] border border-red-200">
                    ADMIN CONTROL
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Create and manage staff logins, assign permissions (Admin vs Stock Staff), and control account status.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2 bg-[#E31B23] hover:bg-[#B5121B] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add User</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pl-5">User</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Last Login</th>
                  <th className="p-3.5 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allProfiles.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                          {u.full_name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{u.full_name}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          u.role === 'admin'
                            ? 'bg-red-50 text-[#E31B23] border-red-200'
                            : u.role === 'stock'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-sky-50 text-sky-800 border-sky-200'
                        }`}
                      >
                        {u.role === 'admin' ? (
                          <ShieldCheck className="w-3 h-3 text-[#E31B23]" />
                        ) : u.role === 'stock' ? (
                          <Package className="w-3 h-3 text-amber-600" />
                        ) : (
                          <Users className="w-3 h-3 text-sky-600" />
                        )}
                        <span className="uppercase">{u.role === 'stock' ? 'Stock Staff' : u.role}</span>
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          u.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                      {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                    </td>

                    <td className="p-3.5 text-right pr-5 space-x-1.5">
                      {/* Change Role Button */}
                      {u.email !== 'admin@gmail.com' && u.role !== 'customer' && (
                        <button
                          onClick={() => handleToggleRole(u)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          title="Switch role between Admin & Stock Staff"
                        >
                          Change Role
                        </button>
                      )}

                      {/* Reset Password Button */}
                      <button
                        onClick={() => setResetTargetUser(u)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        title="Admin Reset Password"
                      >
                        Reset Pass
                      </button>

                      {/* Deactivate/Activate Button */}
                      {u.email !== 'admin@gmail.com' && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                            u.status === 'Active'
                              ? 'bg-slate-100 hover:bg-red-50 hover:text-[#E31B23] text-slate-700'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: DEMO MODE & DATA PROTECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#E31B23]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>Demo Sample Data Mode</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isDemoMode
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {isDemoMode ? 'ACTIVE / VISIBLE' : 'OFF / HIDDEN'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Toggle sample catalog products, simulated clients, and sample historical transactions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleDemoMode}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                isDemoMode
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}
            >
              {isDemoMode ? (
                <>
                  <ToggleRight className="w-5 h-5" />
                  <span>Demo Mode: ON</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5" />
                  <span>Demo Mode: OFF</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Data Safety Notice */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-950">
            <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-emerald-900 block text-xs">
                Zero Data-Loss Architecture (Data Safety Protection)
              </span>
              <p className="text-emerald-800 text-[11px] leading-relaxed">
                Toggling Demo Mode OFF does <span className="font-bold underline">NOT</span> delete any real user data.
                Your custom products, customers, tax invoices, quotations, and verified orders remain completely intact in
                browser local storage (`ronix_sports_crm_db_v1`). Only sample mock records are filtered out of view.
              </p>
            </div>
          </div>

          {/* Reset Demo Data Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div>
              <span className="font-bold text-slate-900 block text-xs">Factory Reset Sample Data</span>
              <p className="text-slate-500 text-[11px]">
                Restores the standard 8 Ronix Sports demo inventory items and sample corporate transactions without altering any custom records you created.
              </p>
            </div>
            <button
              onClick={() => setResetConfirmOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-[#FFF1F2] hover:text-[#E31B23] border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Records</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: COMPANY PROFILE & GST DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-[#E31B23]" />
            <h3 className="text-sm font-bold text-slate-900">Legal Business & GST Profile</h3>
          </div>

          <form onSubmit={handleSaveCompany} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Company Legal Entity</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Store / Warehouse Headquarters Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Institutional Sales Phone</label>
                <input
                  type="tel"
                  value={salesPhone}
                  onChange={(e) => setSalesPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save Business Profile
              </button>
            </div>
          </form>
        </div>

        {/* POS Hardware & Printing */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Printer className="w-4 h-4 text-[#E31B23]" />
            <h3 className="text-sm font-bold text-slate-900">POS Slip & Thermal Printer</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Auto-Print Thermal Receipt</span>
                <span className="text-[11px] text-slate-500">Automatically trigger 80mm slip on POS completion</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoPrintPOS(!autoPrintPOS)}
                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  autoPrintPOS ? 'bg-[#E31B23]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    autoPrintPOS ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Receipt Paper Roll Width</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setThermalPaperWidth('80mm')}
                  className={`py-2 text-center rounded-xl font-bold border transition-colors cursor-pointer ${
                    thermalPaperWidth === '80mm'
                      ? 'bg-[#FFF1F2] text-[#E31B23] border-red-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  80mm Standard (POS)
                </button>
                <button
                  type="button"
                  onClick={() => setThermalPaperWidth('58mm')}
                  className={`py-2 text-center rounded-xl font-bold border transition-colors cursor-pointer ${
                    thermalPaperWidth === '58mm'
                      ? 'bg-[#FFF1F2] text-[#E31B23] border-red-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  58mm Compact
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 block text-[11px]">Active Hardware Devices:</span>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>ESC/POS Slip Printer:</span>
                <span className="font-bold text-slate-800">Epson TM-T88VI (USB/LAN)</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Barcode Scanner:</span>
                <span className="font-bold text-slate-800">Honeywell 1400g 2D USB</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Warehouse Hub:</span>
                <span className="font-bold text-slate-800">{currentWarehouse?.name || 'Main Warehouse'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: DATABASE BACKUP & PERSISTENCE SUMMARY */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#E31B23]" />
            <h3 className="text-sm font-bold text-slate-900">Database & Local Persistence</h3>
          </div>
          <button
            onClick={handleExportBackup}
            className="px-3.5 py-1.5 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Database JSON</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Products</span>
            <span className="text-base font-black text-slate-900">{products.length}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Customers</span>
            <span className="text-base font-black text-slate-900">{customers.length}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Invoices</span>
            <span className="text-base font-black text-slate-900">{invoices.length}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Quotations</span>
            <span className="text-base font-black text-slate-900">{quotations.length}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block">B2B Orders</span>
            <span className="text-base font-black text-slate-900">{b2bOrders.length}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block">B2C POS Sales</span>
            <span className="text-base font-black text-slate-900">{b2cSales.length}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Payments</span>
            <span className="text-base font-black text-slate-900">{payments.length}</span>
          </div>
        </div>
      </div>

      {/* ADMIN ADD USER MODAL */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#E31B23]" />
                <h3 className="font-black text-slate-900 text-sm">Create Staff User Account</h3>
              </div>
              <button
                onClick={() => {
                  setIsAddUserOpen(false);
                  setUserActionError(null);
                  setUserActionSuccess(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {userActionError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#E31B23] shrink-0" />
                <span>{userActionError}</span>
              </div>
            )}

            {userActionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{userActionSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  placeholder="Ravi Kumar"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  placeholder="ravi@ronixsports.com"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Role Permission</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AppRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                >
                  <option value="stock">Stock / Inventory Staff (Inventory Only)</option>
                  <option value="admin">Admin (Full CRM Access)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Temporary Password</label>
                <input
                  type="text"
                  required
                  value={newTempPassword}
                  onChange={(e) => setNewTempPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  placeholder="demo123"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userActionLoading}
                  className="px-4 py-2 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {userActionLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN RESET USER PASSWORD MODAL */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#E31B23]" />
                <h3 className="font-black text-slate-900 text-sm">
                  Reset Password for {resetTargetUser.full_name}
                </h3>
              </div>
              <button
                onClick={() => setResetTargetUser(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdminResetPasswordSubmit} className="space-y-3 text-xs">
              <p className="text-slate-600">
                Set a new password for user account <strong className="text-slate-900">{resetTargetUser.email}</strong>:
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={adminNewPassword}
                  onChange={(e) => setAdminNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  placeholder="Enter new password (min 6 chars)"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userActionLoading}
                  className="px-4 py-2 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {userActionLoading ? 'Saving...' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Reset Demo Data */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm">Reset Sample Records?</h4>
                <p className="text-xs text-slate-500">Restore factory sample demo data</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This action will reset the preloaded Ronix Sports demo catalog and transactions to their fresh default state.
              Any custom products, customers, or invoices you have manually created will remain preserved.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
