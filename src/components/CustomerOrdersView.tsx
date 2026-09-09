import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  X,
  AlertTriangle,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Package,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CustomerOrder, CustomerOrderStatus } from '../types';
import { ProductImage } from './ProductImage';

export const CustomerOrdersView: React.FC = () => {
  const {
    customerOrders = [],
    updateCustomerOrderStatus,
    products = [],
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);

  // Status List options
  const STATUSES: CustomerOrderStatus[] = [
    'New',
    'Confirmed',
    'Processing',
    'Ready',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];

  // Filtering Orders
  const filteredOrders = useMemo(() => {
    return customerOrders.filter((ord) => {
      if (!ord) return false;

      // Status filter
      if (selectedStatusFilter !== 'All' && ord.status !== selectedStatusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          ord.orderNumber.toLowerCase().includes(q) ||
          ord.customerName.toLowerCase().includes(q) ||
          ord.customerEmail.toLowerCase().includes(q) ||
          (ord.customerPhone || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [customerOrders, selectedStatusFilter, searchQuery]);

  // Counts by status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: customerOrders.length };
    customerOrders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [customerOrders]);

  const handleStatusUpdate = (orderId: string, newStatus: CustomerOrderStatus) => {
    updateCustomerOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[#111827] flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#E31B23]" />
            <span>CUSTOMER ORDERS</span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Manage incoming online customer orders, update order status, and track fulfillment.
          </p>
        </div>

        <div className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
          Total Orders: <span className="text-[#E31B23] font-black">{customerOrders.length}</span>
        </div>
      </div>

      {/* 2. Controls & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order #, Customer Name, Email, Phone..."
              className="w-full pl-10 pr-8 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E31B23] font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
            {['All', ...STATUSES].map((status) => {
              const isActive = selectedStatusFilter === status;
              const count = statusCounts[status] || 0;
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#E31B23] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{status}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Customer Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order No</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4 text-right">Total</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const totalItemsCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* Order No */}
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900 group-hover:text-[#E31B23] transition-colors">
                        {order.orderNumber}
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{order.customerName}</span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-xs">{order.customerEmail}</span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {order.date}
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        <span className="font-bold text-slate-900">{totalItemsCount} Item(s)</span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">
                          {order.items.map((i) => i.productName).join(', ')}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm whitespace-nowrap">
                        ₹{order.total.toLocaleString('en-IN')}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold uppercase">
                          {order.paymentStatus}
                        </span>
                      </td>

                      {/* Order Status Badge & Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value as CustomerOrderStatus)}
                          className={`text-xs font-black rounded-lg px-2.5 py-1 border focus:outline-none cursor-pointer ${
                            order.status === 'New'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : order.status === 'Confirmed' || order.status === 'Processing'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : order.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : order.status === 'Cancelled'
                              ? 'bg-red-50 text-red-800 border-red-200'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 bg-[#E31B23] hover:bg-[#B5121B] text-white rounded-xl text-[11px] font-bold shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1 mx-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Order</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">No customer orders found</h4>
            <p className="text-xs text-slate-500">
              {searchQuery || selectedStatusFilter !== 'All'
                ? 'Try resetting your search or status filter.'
                : 'Customer orders placed via the storefront will appear here immediately.'}
            </p>
          </div>
        )}
      </div>

      {/* 4. ADMIN ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar z-10">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-slate-900">
                    {selectedOrder.orderNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-500">({selectedOrder.date})</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customer Order Details & Item Breakdown
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Status Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Info Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#E31B23]" />
                  <span>Customer Information</span>
                </h4>
                <p className="font-bold text-slate-900 text-sm">{selectedOrder.customerName}</p>
                <p className="text-slate-600 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{selectedOrder.customerEmail}</span>
                </p>
                {selectedOrder.customerPhone && (
                  <p className="text-slate-600 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{selectedOrder.customerPhone}</span>
                  </p>
                )}
                {selectedOrder.shippingAddress && (
                  <p className="text-slate-600 flex items-start gap-1 pt-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                    <span>{selectedOrder.shippingAddress}</span>
                  </p>
                )}
              </div>

              {/* Order Status & Payment Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#E31B23]" />
                  <span>Order Status Control</span>
                </h4>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Order Status
                  </label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value as CustomerOrderStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Payment Status</span>
                  <span className="font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[10px] uppercase">
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Itemized Products List */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Order Items ({selectedOrder.items.length})
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {selectedOrder.items.map((item, idx) => {
                  const fullProd = products.find((p) => p.id === item.productId);

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50"
                    >
                      {/* Product Image */}
                      <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 p-1 flex items-center justify-center">
                        <ProductImage
                          src={item.image || fullProd?.image}
                          category={fullProd?.category}
                          name={item.productName}
                          product={fullProd}
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 truncate">{item.productName}</h5>
                        <p className="text-[10px] text-slate-400 font-mono">
                          SKU: {item.sku} • Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}
                        </p>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-slate-900">
                          ₹{item.subtotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-sm">
              <span className="font-bold text-slate-600 uppercase text-xs">Total Order Value</span>
              <span className="font-black text-slate-900 text-lg">
                ₹{selectedOrder.total.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              {selectedOrder.status !== 'Cancelled' ? (
                <button
                  onClick={() => handleStatusUpdate(selectedOrder.id, 'Cancelled')}
                  className="flex-1 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel Order & Restore Stock
                </button>
              ) : (
                <div className="flex-1 py-2 text-center text-xs font-bold text-red-600 bg-red-50 rounded-xl border border-red-200">
                  Order Cancelled (Stock Restored)
                </div>
              )}

              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
