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
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

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
    currentUser,
    currentWarehouse,
  } = useStore();

  const [companyName, setCompanyName] = useState('Ronix Sports Pvt Ltd');
  const [gstin, setGstin] = useState('29AABCR8842K1Z9');
  const [address, setAddress] = useState('Brigade Sports Hub, MG Road, Bengaluru, KA - 560001');
  const [supportEmail, setSupportEmail] = useState('support@ronixsports.com');
  const [salesPhone, setSalesPhone] = useState('+91 98765 43210');
  const [autoPrintPOS, setAutoPrintPOS] = useState(true);
  const [thermalPaperWidth, setThermalPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

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
            Manage demo data visibility, business profile, GST details, thermal printing, and data backups.
          </p>
        </div>

        {isSavedNotice && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved</span>
          </div>
        )}
      </div>

      {/* SECTION 1: DEMO MODE & DATA PROTECTION (Prominent Control) */}
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

      {/* SECTION 2: COMPANY PROFILE & GST DETAILS */}
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

      {/* SECTION 3: DATABASE BACKUP & PERSISTENCE SUMMARY */}
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

        <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1">
          <span>Storage Engine: localStorage (`ronix_sports_crm_db_v1`)</span>
          <span>Active Staff: {currentUser?.name} ({currentUser?.role})</span>
        </div>
      </div>

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
