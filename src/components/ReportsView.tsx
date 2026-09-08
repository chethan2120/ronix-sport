import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Package,
  CircleDollarSign,
  Download,
  Calendar,
  Building2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { InventoryItem } from '../types';

export const ReportsView: React.FC = () => {
  const { products, inventory, b2bOrders, b2cSales, invoices } = useStore();

  const inventoryList = Object.values(inventory) as InventoryItem[];
  const totalInventoryValuation: number = inventoryList.reduce((sum: number, item: InventoryItem) => {
    const p = products.find((prod) => prod.id === item.productId);
    return sum + (item.onHand || 0) * (p?.costPrice || 1000);
  }, 0);

  const totalB2BRevenue = b2bOrders.reduce((sum, o) => sum + o.total, 0);
  const totalB2CRevenue = b2cSales.reduce((sum, s) => sum + s.total, 0);
  const grandTotalRevenue = totalB2BRevenue + totalB2CRevenue;

  const b2bPct = grandTotalRevenue > 0 ? Math.round((totalB2BRevenue / grandTotalRevenue) * 100) : 0;
  const b2cPct = grandTotalRevenue > 0 ? (100 - b2bPct) : 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[#111827] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#E31B23]" />
            <span>EXECUTIVE REPORTS & ANALYTICS</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FFF1F2] text-[#E31B23] border border-red-200 px-2 py-0.5 rounded-full">
              Live Ledger
            </span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Channel breakdown, product velocity, inventory valuation, and GST liability.
          </p>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total B2B Pipeline</span>
          <h3 className="text-xl font-black text-[#E31B23] mt-1">
            ₹ {(totalB2BRevenue ?? 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-[#E31B23] font-bold mt-1">{b2bOrders.length} Institutional Orders</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Retail B2C Sales</span>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            ₹ {(totalB2CRevenue ?? 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-600 font-bold mt-1">{b2cSales.length} Walk-in Transactions</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Live Inventory Asset</span>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            ₹ {(totalInventoryValuation ?? 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-600 font-bold mt-1">Cost Valuation Basis</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">GST Output Collected</span>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            ₹ {Math.round((grandTotalRevenue || 0) * 0.18).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">18% Standard Rate</p>
        </div>
      </div>

      {/* Breakdown grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Fast Moving Equipment */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Top Performing Products</h3>
          <div className="space-y-3">
            {products.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                No products found in catalog.
              </div>
            ) : (
              products.slice(0, 4).map((p, i) => (
                <div key={p.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-[#FFF1F2] text-[#E31B23] text-xs font-black flex items-center justify-center border border-red-200">
                      #{i + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                      <p className="text-[11px] text-slate-500">{p.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-[#E31B23]">
                      ₹ {(p.retailPrice ?? 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Channel Revenue Comparison */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Channel Revenue Split</h3>
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#E31B23]">B2B Institutional ({b2bPct}%)</span>
                  <span>₹ {(totalB2BRevenue ?? 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#E31B23] rounded-full" style={{ width: `${b2bPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">B2C Retail Walk-in ({b2cPct}%)</span>
                  <span>₹ {(totalB2CRevenue ?? 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-700 rounded-full" style={{ width: `${b2cPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
            Automated sync with Ronix Sports Central Ledger.
          </div>
        </div>
      </div>
    </div>
  );
};
