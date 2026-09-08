import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  X,
  Trash2,
  ArrowUpRight,
  Receipt,
  ShoppingCart,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Customer } from '../types';

export const CustomersView: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, invoices, quotations, b2bOrders, setActiveTab } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'B2B' | 'B2C'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // New Customer Form State
  const [newCust, setNewCust] = useState({
    name: '',
    type: 'B2B' as 'B2B' | 'B2C',
    organizationType: 'College / University',
    email: '',
    phone: '',
    contactPerson: '',
    priceTier: 'Gold' as 'Standard' | 'Silver' | 'Gold' | 'Platinum' | 'Custom',
    creditLimit: 500000,
    creditDays: 30,
    gstNumber: '27AABCR1234F1Z0',
    billingAddress: 'Mumbai, Maharashtra',
    shippingAddress: 'Mumbai, Maharashtra',
    notes: 'Premier institutional partner',
  });

  const filteredCustomers = customers.filter((cust) => {
    const matchesType = filterType === 'ALL' || cust.type === filterType;
    const matchesSearch =
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cust.email && cust.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cust.phone && cust.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cust.gstNumber && cust.gstNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name) return;

    addCustomer({
      name: newCust.name,
      type: newCust.type,
      organizationName: newCust.type === 'B2B' ? newCust.name : undefined,
      organizationType: newCust.type === 'B2B' ? (newCust.organizationType as any) : undefined,
      email: newCust.email,
      phone: newCust.phone,
      contactPerson: newCust.contactPerson,
      priceTier: newCust.priceTier,
      creditLimit: Number(newCust.creditLimit),
      creditDays: Number(newCust.creditDays),
      outstandingBalance: 0,
      availableCredit: Number(newCust.creditLimit),
      gstNumber: newCust.gstNumber,
      billingAddress: newCust.billingAddress,
      shippingAddress: newCust.shippingAddress || newCust.billingAddress,
      notes: newCust.notes,
      authorizedUsers: [newCust.contactPerson],
      customPricing: {},
      status: 'Active',
    });

    setIsAddModalOpen(false);
    setNewCust({
      name: '',
      type: 'B2B',
      organizationType: 'College / University',
      email: '',
      phone: '',
      contactPerson: '',
      priceTier: 'Gold',
      creditLimit: 500000,
      creditDays: 30,
      gstNumber: '27AABCR1234F1Z0',
      billingAddress: 'Mumbai, Maharashtra',
      shippingAddress: 'Mumbai, Maharashtra',
      notes: '',
    });
  };

  const customerInvoices = selectedCustomer ? invoices.filter((i) => i.customerName === selectedCustomer.name || i.organizationName === selectedCustomer.name || i.customerId === selectedCustomer.id) : [];
  const customerQuotations = selectedCustomer ? quotations.filter((q) => q.customerId === selectedCustomer.id || q.organizationName === selectedCustomer.name) : [];
  const customerOrders = selectedCustomer ? b2bOrders.filter((o) => o.organizationId === selectedCustomer.id || o.organizationName === selectedCustomer.name) : [];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[#111827] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#E31B23]" />
            <span>CUSTOMERS & INSTITUTION DIRECTORY</span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Manage institutional client contracts, price tier assignments, and credit limits.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Institution / Customer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(['ALL', 'B2B', 'B2C'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-[#E31B23] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-[#FFF1F2] hover:text-[#E31B23]'
              }`}
            >
              {type === 'ALL' ? `All (${customers.length})` : type === 'B2B' ? `B2B Institutions (${customers.filter(c => c.type === 'B2B').length})` : `B2C Retail (${customers.filter(c => c.type === 'B2C').length})`}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search institution, contact, phone, GST..."
            className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E31B23] w-full sm:w-72"
          />
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => (
          <div
            key={cust.id}
            onClick={() => setSelectedCustomer(cust)}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-red-300 transition-all flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    cust.type === 'B2B'
                      ? 'bg-[#FFF1F2] text-[#E31B23] border border-red-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {cust.type === 'B2B' ? cust.organizationType || 'B2B Account' : 'B2C Retail'}
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  {cust.priceTier || 'Standard'} Tier
                </span>
              </div>

              <h3 className="text-sm font-black text-slate-900 mt-2 group-hover:text-[#E31B23] transition-colors">
                {cust.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Contact: {cust.contactPerson}</p>

              {/* Contact details */}
              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{cust.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{cust.email}</span>
                </div>
                {cust.gstNumber && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-[11px] font-bold">{cust.gstNumber}</span>
                  </div>
                )}
              </div>

              {/* Financials / Credit Limit */}
              {cust.type === 'B2B' && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Credit Limit:</span>
                    <span className="font-bold text-slate-900">
                      ₹ {(cust.creditLimit ?? 0).toLocaleString('en-IN')} ({cust.creditDays ?? 30}d)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Outstanding:</span>
                    <span className="font-bold text-[#DC2626]">
                      ₹ {(cust.outstandingBalance ?? Math.max(0, (cust.creditLimit || 0) - (cust.availableCredit || 0))).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Available Credit:</span>
                    <span className="font-bold text-emerald-600">
                      ₹ {(cust.availableCredit ?? 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Orders: {cust.totalOrders || 0}</span>
              <span className="text-[#E31B23] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>View Details</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">{selectedCustomer.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#FFF1F2] text-[#E31B23] border border-red-200 rounded-full">
                    {selectedCustomer.type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedCustomer.organizationType || 'Retail Client'} • Tier: {selectedCustomer.priceTier || 'Standard'}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[11px] text-slate-500 font-medium block">Credit Limit</span>
                <span className="text-sm font-black text-slate-900">
                  ₹ {(selectedCustomer.creditLimit || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[11px] text-slate-500 font-medium block">Available Credit</span>
                <span className="text-sm font-black text-emerald-600">
                  ₹ {(selectedCustomer.availableCredit || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[11px] text-slate-500 font-medium block">Total Spend</span>
                <span className="text-sm font-black text-[#E31B23]">
                  ₹ {(selectedCustomer.totalSpend || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Contact & Address Details */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50/50 p-4 rounded-2xl border border-slate-100 mb-4">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Primary Contact</span>
                <p className="text-slate-900 font-medium">{selectedCustomer.contactPerson}</p>
                <p className="text-slate-500">{selectedCustomer.phone}</p>
                <p className="text-slate-500">{selectedCustomer.email}</p>
              </div>
              <div>
                <span className="font-bold text-slate-700 block mb-1">Tax & Location</span>
                <p className="text-slate-900 font-mono">GST: {selectedCustomer.gstNumber || 'N/A'}</p>
                <p className="text-slate-500 mt-1">Billing: {selectedCustomer.billingAddress || 'Default Address'}</p>
              </div>
            </div>

            {/* Activity Lists (Quotations & Invoices) */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Related Documents</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedCustomer(null);
                      setActiveTab('quotations');
                    }}
                    className="px-2.5 py-1 bg-[#FFF1F2] text-[#E31B23] hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    + New Quote
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCustomer(null);
                      setActiveTab('invoices');
                    }}
                    className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    + New Invoice
                  </button>
                </div>
              </div>

              {customerInvoices.length > 0 ? (
                <div className="space-y-1.5">
                  {customerInvoices.map((inv) => (
                    <div key={inv.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</span>
                        <span className="text-slate-500 ml-2">({inv.date})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900">₹{inv.total.toLocaleString('en-IN')}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          inv.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {inv.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No previous invoices on record for this customer.</p>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${selectedCustomer.name}?`)) {
                    deleteCustomer(selectedCustomer.id);
                    setSelectedCustomer(null);
                  }
                }}
                className="px-3 py-2 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Customer</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Add New Customer / Institution</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Create an institutional client profile with custom credit terms and pricing.
                </p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Institution / Client Name</label>
                <input
                  type="text"
                  required
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  placeholder="e.g. Loyola Degree College"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#E31B23] focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Customer Type</label>
                  <select
                    value={newCust.type}
                    onChange={(e) => setNewCust({ ...newCust, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  >
                    <option value="B2B">B2B Institutional</option>
                    <option value="B2C">B2C Retail</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Price Tier</label>
                  <select
                    value={newCust.priceTier}
                    onChange={(e) => setNewCust({ ...newCust, priceTier: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Silver">Silver (5% Off)</option>
                    <option value="Gold">Gold (10% Off)</option>
                    <option value="Platinum">Platinum (15% Off)</option>
                  </select>
                </div>
              </div>

              {newCust.type === 'B2B' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Organization Type</label>
                  <select
                    value={newCust.organizationType}
                    onChange={(e) => setNewCust({ ...newCust, organizationType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  >
                    <option value="College / University">College / University</option>
                    <option value="Sports Academy">Sports Academy</option>
                    <option value="School & Board">School & Board</option>
                    <option value="Cricket Club">Cricket Club</option>
                    <option value="Corporate Sports Team">Corporate Sports Team</option>
                    <option value="Government Sports Body">Government Sports Body</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={newCust.contactPerson}
                    onChange={(e) => setNewCust({ ...newCust, contactPerson: e.target.value })}
                    placeholder="Sports Director / Officer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={newCust.phone}
                    onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newCust.email}
                  onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                  placeholder="sports@institution.edu"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={newCust.creditLimit}
                    onChange={(e) => setNewCust({ ...newCust, creditLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#E31B23] focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">GST Number</label>
                  <input
                    type="text"
                    value={newCust.gstNumber}
                    onChange={(e) => setNewCust({ ...newCust, gstNumber: e.target.value })}
                    placeholder="27ABCDE1234F1Z5"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Billing & Shipping Address</label>
                <input
                  type="text"
                  value={newCust.billingAddress}
                  onChange={(e) => setNewCust({ ...newCust, billingAddress: e.target.value, shippingAddress: e.target.value })}
                  placeholder="Address, City, State, PIN"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                />
              </div>

              <div className="mt-5 flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
