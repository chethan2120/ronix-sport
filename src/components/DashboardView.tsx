import React, { useState } from 'react';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Clock,
  CircleDollarSign,
  AlertOctagon,
  ArrowRight,
  PlusCircle,
  Zap,
  Lock,
  Shield,
  FileCheck,
  Receipt,
  Boxes,
  Plus,
  Minus,
  CheckCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

import { InventoryItem } from '../types';

interface DashboardViewProps {
  onOpenAddProductModal: () => void;
  onOpenRecordPaymentModal: () => void;
  onOpenInventoryAdjustModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddProductModal,
  onOpenRecordPaymentModal,
  onOpenInventoryAdjustModal,
}) => {
  const {
    setActiveTab,
    inventory,
    products,
    b2bOrders,
    b2cSales,
    payments,
    invoices,
    currentWarehouse,
  } = useStore();

  const [warehouseFilter, setWarehouseFilter] = useState('All Warehouses');

  // Compute live KPI metrics
  const inventoryList = Object.values(inventory || {}) as InventoryItem[];
  const totalOnHand: number = inventoryList.reduce((sum: number, item: InventoryItem) => sum + (item?.onHand || 0), 0);
  const totalReserved: number = inventoryList.reduce((sum: number, item: InventoryItem) => sum + (item?.reserved || 0), 0);
  const totalAvailable: number = Math.max(0, totalOnHand - totalReserved);

  // Calculate live inventory valuation
  const totalInventoryValue = inventoryList.reduce((sum: number, item: InventoryItem) => {
    const prod = products.find((p) => p.id === item.productId);
    return sum + (item?.onHand || 0) * (prod ? prod.costPrice : 0);
  }, 0);

  // Revenue computations
  const totalB2BRevenue = b2bOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalB2CRevenue = b2cSales.reduce((sum, s) => sum + (s.total || 0), 0);
  const grandTotalRevenue = totalB2BRevenue + totalB2CRevenue;

  // Pending payments computation
  const pendingInvoices = invoices.filter((i) => i.paymentStatus === 'Pending' || i.paymentStatus === 'Partial' || i.paymentStatus === 'Unpaid');
  const pendingPaymentsAmount = pendingInvoices.reduce((sum, i) => sum + ((i.total || 0) - (i.paidAmount || 0)), 0);
  const pendingInstitutionsCount = new Set(pendingInvoices.map((i) => i.organizationName || i.customerName)).size;

  // Compute low stock items
  const lowStockItems = products
    .map((prod) => {
      const inv = inventory[prod.id] || { onHand: 0, reserved: 0, available: 0 };
      const avail = Math.max(0, (inv.onHand || 0) - (inv.reserved || 0));
      return {
        product: prod,
        available: avail,
        isLow: avail <= (prod.minStockLevel || 15),
      };
    })
    .filter((item) => item.isLow)
    .slice(0, 5);

  // Donut chart calculations
  const reservedPct = totalOnHand > 0 ? Math.round((totalReserved / totalOnHand) * 100) : 0;
  const availablePct = totalOnHand > 0 ? Math.round((totalAvailable / totalOnHand) * 100) : 0;

  return (
    <div className="grid grid-cols-12 gap-4 animate-in fade-in duration-200">
      {/* 1. TOP 5 BENTO KPI CARDS */}
      <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Card 1: Inventory Value */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-red-200 transition-colors">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">LIVE INVENTORY VALUE</p>
          <p className="text-xl font-black text-[#E31B23] mt-1">₹ {totalInventoryValue.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">{products.length} catalog items</p>
        </div>

        {/* Card 2: B2B Orders */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-red-200 transition-colors">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">B2B ORDERS</p>
          <p className="text-xl font-black text-[#111827] mt-1">{b2bOrders.length}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Institutional orders</p>
        </div>

        {/* Card 3: B2C Sales */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-red-200 transition-colors">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">B2C SALES</p>
          <p className="text-xl font-black text-emerald-600 mt-1">₹ {totalB2CRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">{b2cSales.length} transactions</p>
        </div>

        {/* Card 4: Revenue */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs border-l-4 border-l-[#E31B23] flex flex-col justify-between">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">REVENUE</p>
          <p className="text-xl font-black text-[#111827] mt-1">₹ {grandTotalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">Combined sales total</p>
        </div>

        {/* Card 5: Pending Payments */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs border-l-4 border-l-[#DC2626] flex flex-col justify-between">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PENDING PAYMENTS</p>
          <p className="text-xl font-black text-[#DC2626] mt-1">₹ {pendingPaymentsAmount.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">From {pendingInstitutionsCount} accounts</p>
        </div>
      </div>

      {/* 2. MIDDLE ROW: Inventory Summary Bento & Low Stock Alerts Bento */}
      {/* Bento: Inventory Summary */}
      <div className="col-span-12 lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-black text-slate-900 text-sm tracking-tight flex items-center gap-2">
              <Boxes className="w-4 h-4 text-[#E31B23]" />
              <span>Inventory Summary</span>
            </h3>
            <p className="text-xs text-slate-400">Live multi-warehouse stock allocation</p>
          </div>
          <button
            id="view-inventory-btn"
            onClick={() => setActiveTab('inventory')}
            className="text-xs font-bold text-[#E31B23] hover:text-[#B5121B] hover:underline cursor-pointer uppercase tracking-wide"
          >
            VIEW INVENTORY →
          </button>
        </div>

        <div className="flex flex-col sm:flex-row flex-1 items-center sm:space-x-8 gap-6 py-2">
          {/* Circular Donut Visual */}
          <div className="w-32 h-32 rounded-full border-[10px] border-emerald-500 border-r-slate-200 border-b-[#E31B23] flex flex-col items-center justify-center relative shrink-0 shadow-2xs">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Total Units</p>
              <p className="text-lg font-black text-slate-900">{totalOnHand.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* 3 Metric Columns with Progress Bars */}
          <div className="flex-1 w-full grid grid-cols-3 gap-4 sm:gap-6">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">On Hand</p>
              <p className="text-2xl font-black text-slate-900">{totalOnHand.toLocaleString('en-IN')}</p>
              <div className="h-2 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-slate-700 rounded-full w-full"></div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Reserved</p>
              <p className="text-2xl font-black text-[#E31B23]">{totalReserved.toLocaleString('en-IN')}</p>
              <div className="h-2 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-[#E31B23] rounded-full" style={{ width: `${reservedPct}%` }}></div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Available</p>
              <p className="text-2xl font-black text-emerald-600">{totalAvailable.toLocaleString('en-IN')}</p>
              <div className="h-2 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${availablePct}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-slate-100 gap-2">
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <div className="flex items-center text-xs text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
              Atomic Stock Control Active
            </div>
            <div className="flex items-center text-xs text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#E31B23] mr-2"></span>
              Real-time B2B Sync
            </div>
          </div>
          <p className="text-[10px] text-slate-400 italic">Live reactive database</p>
        </div>
      </div>

      {/* Bento: Low Stock Alerts */}
      <div className="col-span-12 lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="font-black text-slate-900 text-sm tracking-tight flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-[#DC2626]" />
              <span>Low Stock Alerts</span>
            </h3>
            <span className="bg-[#FFF1F2] text-[#DC2626] border border-red-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
              {lowStockItems.length} Alerts
            </span>
          </div>

          <div className="space-y-2.5">
            {lowStockItems.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs rounded-xl bg-slate-50 border border-slate-200">
                No low stock alerts. Stock levels are normal.
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div
                  key={item.product.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    item.available <= 0
                      ? 'bg-red-50/50 border-red-100'
                      : 'bg-amber-50/60 border-amber-100'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.product.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-mono">SKU: {item.product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-black ${item.available <= 0 ? 'text-[#DC2626]' : 'text-amber-600'}`}>
                      {item.available} Left
                    </p>
                    <p className="text-[10px] text-slate-400">Min: {item.product.minStockLevel || 15}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          onClick={() => setActiveTab('inventory')}
          className="w-full mt-4 py-2.5 text-xs font-bold bg-[#E31B23] hover:bg-[#B5121B] transition-colors text-white rounded-xl uppercase tracking-wide shrink-0 cursor-pointer shadow-xs"
        >
          View All Stock Alerts
        </button>
      </div>

      {/* 3. BOTTOM ROW: Recent B2B Orders Bento & Quick Actions Bento */}
      {/* Bento: Recent B2B Orders */}
      <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-black text-slate-900 text-sm tracking-tight flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#E31B23]" />
              <span>Recent B2B Orders</span>
            </h3>
            <p className="text-xs text-slate-400">Latest institutional and academy purchase orders</p>
          </div>
          <button
            onClick={() => setActiveTab('b2b-orders')}
            className="text-xs font-bold text-slate-500 hover:text-[#E31B23] cursor-pointer uppercase tracking-wider"
          >
            FULL HISTORY →
          </button>
        </div>

        <div className="overflow-x-auto">
          {b2bOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No B2B orders found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Organization</th>
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {b2bOrders.slice(0, 5).map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setActiveTab('b2b-orders')}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 font-bold text-slate-900">{order.organizationName}</td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">#{order.orderNumber}</td>
                    <td className="px-5 py-3.5 font-black text-slate-900">₹{(order.total || 0).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          order.status === 'Confirmed' || order.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bento: Quick Actions */}
      <div className="col-span-12 lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="font-black text-slate-900 text-sm tracking-tight mb-1 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#E31B23]" />
            <span>Quick Actions</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Fast-track high-frequency CRM workflows</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 flex-1">
          <button
            id="qa-new-b2b"
            onClick={() => setActiveTab('b2b-orders')}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-red-200 bg-[#FFF1F2] hover:bg-red-100 transition-colors cursor-pointer text-[#E31B23]"
          >
            <ShoppingCart className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold uppercase">New B2B</span>
          </button>

          <button
            id="qa-quick-pos"
            onClick={() => setActiveTab('b2c-pos')}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-red-200 bg-[#FFF1F2] hover:bg-red-100 transition-colors cursor-pointer text-[#E31B23]"
          >
            <Receipt className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold uppercase">Quick POS</span>
          </button>

          <button
            id="qa-add-stock"
            onClick={onOpenInventoryAdjustModal}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-[#FFF1F2]/60 transition-colors cursor-pointer text-slate-700 hover:text-[#E31B23]"
          >
            <Boxes className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold uppercase">Add Stock</span>
          </button>

          <button
            id="qa-customer"
            onClick={() => setActiveTab('customers')}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-[#FFF1F2]/60 transition-colors cursor-pointer text-slate-700 hover:text-[#E31B23]"
          >
            <Package className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold uppercase">Customer</span>
          </button>

          <button
            id="qa-invoice"
            onClick={() => setActiveTab('invoices')}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-[#FFF1F2]/60 transition-colors cursor-pointer text-slate-700 hover:text-[#E31B23]"
          >
            <FileCheck className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold uppercase">Invoice</span>
          </button>

          <button
            id="qa-quote"
            onClick={() => setActiveTab('quotations')}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-[#FFF1F2]/60 transition-colors cursor-pointer text-slate-700 hover:text-[#E31B23]"
          >
            <Plus className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold uppercase">Quote</span>
          </button>
        </div>
      </div>
    </div>
  );
};
