import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  ArrowDownLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface PaymentsViewProps {
  onOpenRecordPaymentModal: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ onOpenRecordPaymentModal }) => {
  const { payments, customers } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = payments.filter((p) => {
    return (
      p.paymentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.method.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[#111827] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#E31B23]" />
            <span>PAYMENTS & FINANCIAL SETTLEMENTS</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FFF1F2] text-[#E31B23] border border-red-200 px-2 py-0.5 rounded-full">
              Live Reconciliation
            </span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Track bank NEFT, UPI transfers, cheques, and credit ledger settlements.
          </p>
        </div>

        <button
          onClick={onOpenRecordPaymentModal}
          className="px-4 py-2.5 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Collected</span>
          <h3 className="text-xl font-black text-[#E31B23] mt-1">
            ₹ {(totalCollected ?? 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">Direct Bank & POS</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Transactions</span>
          <h3 className="text-xl font-black text-slate-900 mt-1">{payments.length}</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">All verified</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Pending Receivables</span>
          <h3 className="text-xl font-black text-[#E31B23] mt-1">₹ 6,35,200</h3>
          <p className="text-[11px] text-amber-600 font-bold mt-1">12 Invoices Due</p>
        </div>
      </div>

      {/* Payment Transactions Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Payment History</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search payment..."
              className="pl-7 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs w-48 focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
            />
          </div>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Receipt / Payment ID</th>
                <th className="py-2.5 px-3">Customer / Organization</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Reference / Txn ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-[#FFF1F2]/30 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#E31B23]">{p.paymentNumber}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{p.customerName}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{p.date}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700">
                      {p.method}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-black text-slate-900">
                    ₹ {(p.amount ?? 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{p.transactionRef || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
