import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  History,
  Lock,
  Filter,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AuditTrailView: React.FC = () => {
  const { auditLogs } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter((log) => {
    return (
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.module || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[#111827] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#E31B23]" />
            <span>IMMUTABLE SYSTEM AUDIT TRAIL</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FFF1F2] text-[#E31B23] border border-red-200 px-2 py-0.5 rounded-full">
              Tamper Proof
            </span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Every inventory stock adjustment, price change, order placement, and user sign-in is cryptographically logged.
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Activity Log ({auditLogs.length} Events)</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by user, action, entity..."
              className="pl-7 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs w-56 focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
            />
          </div>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor / User</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FFF1F2]/30 transition-colors">
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block">{log.user}</span>
                    <span className="text-[10px] text-[#E31B23] font-medium">{log.role}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        log.action.includes('RESERVE') || log.action.includes('ORDER')
                          ? 'bg-[#FFF1F2] text-[#E31B23] border border-red-200'
                          : log.action.includes('ADJUST')
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700 font-semibold">{log.module || log.referenceId || 'System'}</td>
                  <td className="py-3 px-3 text-slate-600 font-medium">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Log records are immutable and stored in compliance with Indian ERP financial auditing standards.
          </p>
        </div>
      </div>
    </div>
  );
};
