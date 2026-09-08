import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Copy,
  Eye,
  Pencil,
  ArrowRight,
  Building2,
  Sparkles,
  Calendar,
  DollarSign,
  Send,
  X,
  FileCheck,
  ChevronLeft,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Quotation, OrderItem } from '../types';
import { ProductImage } from './ProductImage';

export const QuotationsView: React.FC = () => {
  const {
    quotations,
    customers,
    products,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    convertQuotationToOrder,
    getPriceForCustomer,
    currentUser,
  } = useStore();

  const [mode, setMode] = useState<'list' | 'create' | 'view'>('list');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(quotations[0] || null);
  const [editingQuotationId, setEditingQuotationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // New / Edit Quotation Form State
  const [quoteNumber, setQuoteNumber] = useState(`Q-0000${quotations.length + 1}`);
  const [headline, setHeadline] = useState('Quotation for Sports & Athletic Gear');
  const [reference, setReference] = useState(`PO-REQ-${Date.now().toString().slice(-4)}`);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [validDays, setValidDays] = useState(30);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('Institutional quotation valid for 30 days. Includes standard replacement warranty.');
  const [terms, setTerms] = useState('1. 50% advance with Purchase Order.\n2. Delivery within 7-10 business days.\n3. Taxes as applicable by GST regulations.');

  const [items, setItems] = useState<
    {
      productId: string;
      productName: string;
      sku: string;
      price: number;
      quantity: number;
      gstPercent: number;
    }[]
  >([
    {
      productId: products[0]?.id || 'p1',
      productName: products[0]?.name || 'Ronix Kashmir Willow Pro Bat',
      sku: products[0]?.sku || 'RNX-BAT-01',
      price: products[0]?.b2bPrice || 1450,
      quantity: 20,
      gstPercent: products[0]?.gstPercent || 18,
    },
  ]);

  // Derived Client
  const selectedCust = customers.find((c) => c.id === selectedCustomerId);

  // Calculations
  const calculatedItems: OrderItem[] = items.map((it) => {
    const prod = products.find((p) => p.id === it.productId);
    const itemSubtotal = it.price * it.quantity;
    const gstAmt = (itemSubtotal * it.gstPercent) / 100;
    return {
      productId: it.productId,
      productName: it.productName,
      sku: it.sku,
      image: prod?.image || (it as any).image || '',
      price: it.price,
      quantity: it.quantity,
      subtotal: itemSubtotal,
      gstPercent: it.gstPercent,
      gstAmount: gstAmt,
      total: itemSubtotal + gstAmt,
    };
  });

  const subtotal = calculatedItems.reduce((acc, i) => acc + i.subtotal, 0);
  const totalGst = calculatedItems.reduce((acc, i) => acc + (i.gstAmount || 0), 0);
  const grandTotal = Math.max(0, subtotal - discountAmount + totalGst);

  // Filtered Quotations
  const filteredQuotations = quotations.filter((q) => {
    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.headline && q.headline.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleAddItem = () => {
    const defaultProd = products[0];
    if (!defaultProd) return;
    setItems([
      ...items,
      {
        productId: defaultProd.id,
        productName: defaultProd.name,
        sku: defaultProd.sku,
        price: defaultProd.b2bPrice,
        quantity: 10,
        gstPercent: defaultProd.gstPercent || 18,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const pricing = getPriceForCustomer(productId, selectedCustomerId, items[index].quantity);

    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      price: pricing.unitPrice,
      gstPercent: prod.gstPercent || 18,
    };
    setItems(newItems);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const quantity = Math.max(1, qty);
    const item = items[index];
    const pricing = getPriceForCustomer(item.productId, selectedCustomerId, quantity);

    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      quantity,
      price: pricing.unitPrice,
    };
    setItems(newItems);
  };

  const handlePriceChange = (index: number, price: number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      price: Math.max(0, price),
    };
    setItems(newItems);
  };

  const handleStartEdit = (quote: Quotation) => {
    if (quote.status === 'Converted') {
      alert('This quotation has already been converted to an order and cannot be modified.');
      return;
    }
    setEditingQuotationId(quote.id);
    setQuoteNumber(quote.quoteNumber);
    setHeadline(quote.headline || 'Quotation for Sports & Athletic Gear');
    setReference(quote.reference || `PO-REQ-${Date.now().toString().slice(-4)}`);
    setSelectedCustomerId(quote.customerId || customers[0]?.id || '');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setValidDays(30);
    setDiscountAmount(quote.discountAmount || 0);
    setNotes(quote.notes || '');
    setTerms(quote.terms || '');
    if (quote.items && quote.items.length > 0) {
      setItems(
        quote.items.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          sku: it.sku,
          price: it.price,
          quantity: it.quantity,
          gstPercent: it.gstPercent || 18,
        }))
      );
    }
    setSelectedQuotation(quote);
    setMode('create');
  };

  const handleSaveQuotation = (status: Quotation['status'] = 'Sent') => {
    const validUntilDate = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    if (editingQuotationId) {
      updateQuotation(editingQuotationId, {
        headline,
        reference,
        customerId: selectedCustomerId,
        customerName: selectedCust?.contactPerson || 'Purchasing Officer',
        organizationName: selectedCust?.name || selectedCust?.organizationName || 'Client Institution',
        contactPerson: selectedCust?.contactPerson || 'Sports Incharge',
        phone: selectedCust?.phone || '',
        email: selectedCust?.email || '',
        billingAddress: selectedCust?.billingAddress || 'Default Address',
        shippingAddress: selectedCust?.shippingAddress || selectedCust?.billingAddress || '',
        clientGstNumber: selectedCust?.gstNumber || '',
        items: calculatedItems,
        subtotal,
        discountAmount: Number(discountAmount),
        gstTotal: totalGst,
        total: grandTotal,
        status: status === 'Draft' ? 'Draft' : 'Sent',
        notes,
        terms,
      });

      const updatedQuote: Quotation = {
        ...selectedQuotation,
        id: editingQuotationId,
        quoteNumber,
        headline,
        reference,
        customerId: selectedCustomerId,
        customerName: selectedCust?.contactPerson || 'Purchasing Officer',
        organizationName: selectedCust?.name || selectedCust?.organizationName || 'Client Institution',
        contactPerson: selectedCust?.contactPerson || 'Sports Incharge',
        phone: selectedCust?.phone || '',
        email: selectedCust?.email || '',
        billingAddress: selectedCust?.billingAddress || 'Default Address',
        shippingAddress: selectedCust?.shippingAddress || selectedCust?.billingAddress || '',
        clientGstNumber: selectedCust?.gstNumber || '',
        items: calculatedItems,
        subtotal,
        discountAmount: Number(discountAmount),
        gstTotal: totalGst,
        total: grandTotal,
        status: status === 'Draft' ? 'Draft' : 'Sent',
        notes,
        terms,
      } as Quotation;

      setSelectedQuotation(updatedQuote);
      setEditingQuotationId(null);
      setMode('list');
      return;
    }

    const newQuote = createQuotation({
      quoteNumber,
      headline,
      reference,
      currency: 'INR',
      customerId: selectedCustomerId,
      customerName: selectedCust?.contactPerson || 'Purchasing Officer',
      organizationName: selectedCust?.name || selectedCust?.organizationName || 'Client Institution',
      contactPerson: selectedCust?.contactPerson || 'Sports Incharge',
      phone: selectedCust?.phone || '',
      email: selectedCust?.email || '',
      billingAddress: selectedCust?.billingAddress || 'Default Address',
      shippingAddress: selectedCust?.shippingAddress || selectedCust?.billingAddress || '',
      clientGstNumber: selectedCust?.gstNumber || '',
      date: new Date(issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      validUntil: validUntilDate,
      items: calculatedItems,
      subtotal,
      discountAmount: Number(discountAmount),
      gstTotal: totalGst,
      total: grandTotal,
      status,
      notes,
      terms,
    });

    setSelectedQuotation(newQuote);
    setMode('list');
  };

  const handleConvert = (quoteId: string) => {
    const result = convertQuotationToOrder(quoteId);
    if (result.success) {
      alert(`Success! Quotation has been converted to B2B Order ${result.order?.orderNumber}`);
    } else {
      alert(`Could not convert quotation: ${result.error}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#E31B23]" />
            <h2 className="text-lg font-black tracking-tight text-[#111827]">
              QUOTATIONS & PROPOSALS
            </h2>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Generate formal price estimates, configure tier discounts, and convert to confirmed orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {mode !== 'list' && (
            <button
              onClick={() => setMode('list')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Quotes</span>
            </button>
          )}

          {mode === 'list' && (
            <button
              onClick={() => {
                setEditingQuotationId(null);
                setQuoteNumber(`Q-0000${quotations.length + 1}`);
                setHeadline('Quotation for Sports & Athletic Gear');
                setReference(`PO-REQ-${Date.now().toString().slice(-4)}`);
                setDiscountAmount(0);
                setNotes('Institutional quotation valid for 30 days. Includes standard replacement warranty.');
                setTerms('1. 50% advance with Purchase Order.\n2. Delivery within 7-10 business days.\n3. Taxes as applicable by GST regulations.');
                setMode('create');
              }}
              className="px-4 py-2.5 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Quotation</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode 1: List View */}
      {mode === 'list' && (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">Total Quotations</span>
              <span className="text-lg font-black text-slate-900">{quotations.length}</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-[#6B7280] font-medium block">Total Quoted Value</span>
              <span className="text-lg font-black text-[#E31B23]">
                ₹ {quotations.reduce((acc, q) => acc + q.total, 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">Converted to Orders</span>
              <span className="text-lg font-black text-emerald-600">
                {quotations.filter((q) => q.status === 'Converted').length}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">Pending Decision</span>
              <span className="text-lg font-black text-amber-600">
                {quotations.filter((q) => q.status === 'Sent' || q.status === 'Draft').length}
              </span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'Draft', 'Sent', 'Accepted', 'Converted'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#E31B23] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-[#FFF1F2] hover:text-[#E31B23]'
                  }`}
                >
                  {st === 'ALL' ? 'All Quotes' : st}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quote #, customer, headline..."
                className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E31B23] w-full sm:w-72"
              />
            </div>
          </div>

          {/* Quotations Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Quote #</th>
                    <th className="py-3 px-4">Customer & Institution</th>
                    <th className="py-3 px-4">Issue / Valid Date</th>
                    <th className="py-3 px-4">Items Summary</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQuotations.map((quote) => (
                    <tr key={quote.id} className="hover:bg-[#FFF1F2]/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#E31B23]">
                        {quote.quoteNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{quote.organizationName}</div>
                        <div className="text-[11px] text-slate-500">{quote.customerName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{quote.date}</div>
                        <div className="text-[10px] text-slate-400">Valid: {quote.validUntil}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700">
                          {quote.items.length} item{quote.items.length > 1 ? 's' : ''}
                        </span>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">
                          {quote.items.map((i) => i.productName).join(', ')}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900">
                        ₹ {quote.total.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            quote.status === 'Converted'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : quote.status === 'Accepted'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : quote.status === 'Sent'
                              ? 'bg-[#FFF1F2] text-[#E31B23] border-red-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {quote.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedQuotation(quote);
                              setMode('view');
                            }}
                            title="View / Print Document"
                            className="p-1.5 text-slate-500 hover:text-[#E31B23] hover:bg-[#FFF1F2] rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleStartEdit(quote)}
                            title={quote.status === 'Converted' ? 'Cannot edit converted quotation' : 'Edit Quotation'}
                            disabled={quote.status === 'Converted'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              quote.status === 'Converted'
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-500 hover:text-[#E31B23] hover:bg-[#FFF1F2]'
                            }`}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {quote.status !== 'Converted' && (
                            <button
                              onClick={() => handleConvert(quote.id)}
                              title="Convert to Confirmed B2B Order"
                              className="px-2.5 py-1 bg-[#FFF1F2] hover:bg-red-100 text-[#E31B23] border border-red-200 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>Convert</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm(`Delete quotation ${quote.quoteNumber}?`)) {
                                deleteQuotation(quote.id);
                              }
                            }}
                            title="Delete Quotation"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredQuotations.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No quotations found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Create / Edit Quotation Mode (Form on Left + Live Document Preview on Right) */}
      {(mode === 'create' || mode === 'view') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Form Inputs (Columns 1 to 5) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {editingQuotationId ? `Edit Quotation: ${quoteNumber}` : 'Create New Quotation'}
                </h3>
                <p className="text-[11px] text-slate-400">Configure client details, products, and prices</p>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-1 bg-[#FFF1F2] text-[#E31B23] border border-red-200 rounded-md">
                {quoteNumber}
              </span>
            </div>

            {/* Quotation Header Details */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Quotation Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Quotation for Cricket & Athletic Equipment"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#E31B23] focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quotation #</label>
                  <input
                    type="text"
                    value={quoteNumber}
                    onChange={(e) => setQuoteNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Reference Code</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  />
                </div>
              </div>

              {/* Client Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Customer / Client</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type} • {c.priceTier || 'Standard'} Tier)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    value={validDays}
                    onChange={(e) => setValidDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="font-bold text-slate-700 text-xs">Products / Line Items</label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-2.5 py-1 bg-[#FFF1F2] text-[#E31B23] hover:bg-red-100 border border-red-200 font-bold text-[11px] rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (B2B: ₹{p.b2bPrice})
                          </option>
                        ))}
                      </select>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium block">Qty</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium block">Rate (₹)</span>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium block">GST %</span>
                        <input
                          type="number"
                          value={item.gstPercent}
                          disabled
                          className="w-full px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discount & Terms */}
            <div className="pt-2 border-t border-slate-100 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Special Discount (₹)</label>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#E31B23] focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes / Warranty</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Terms & Conditions</label>
                <textarea
                  rows={2}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                />
              </div>
            </div>

            {/* Save Buttons */}
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => handleSaveQuotation('Draft')}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSaveQuotation('Sent')}
                className="flex-1 py-2.5 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {editingQuotationId ? 'Save Quotation Updates' : 'Save & Issue Quote'}
              </button>
            </div>
          </div>

          {/* Right Side: Live Printable Document Preview (Columns 6 to 12) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between max-h-[85vh] overflow-y-auto print:m-0 print:p-0 print:border-none print:shadow-none">
            <div>
              {/* Document Actions Bar */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Printable Document Preview
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#FFF1F2] text-[#E31B23] border border-red-200 rounded-full">
                    Live Preview
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {selectedQuotation && selectedQuotation.status !== 'Converted' && (
                    <button
                      onClick={() => handleStartEdit(selectedQuotation)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-[#FFF1F2] hover:text-[#E31B23] text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Quote</span>
                    </button>
                  )}
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / PDF</span>
                  </button>
                  <button
                    onClick={() => handleSaveQuotation('Sent')}
                    className="px-3.5 py-1.5 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm Quote</span>
                  </button>
                </div>
              </div>

              {/* Printable Document Paper */}
              <div className="space-y-6 text-slate-800">
                {/* Letterhead */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-[#E31B23] rounded-lg flex items-center justify-center text-white font-black text-xs shadow-xs">
                        R
                      </div>
                      <h1 className="text-xl font-black tracking-tight text-[#111827]">
                        RONIX SPORTS PVT LTD
                      </h1>
                    </div>
                    <p className="text-xs text-[#E31B23] font-bold mt-1">
                      Premier Sports Equipment & Institutional Supplier
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Plot 42, MIDC Industrial Area, Andheri East, Mumbai 400093
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      GSTIN: 27AAACR4829K1Z5 | contact@ronixsports.com | +91 22 8900 1200
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black tracking-tight text-slate-900 block">
                      QUOTATION
                    </span>
                    <span className="font-mono text-sm font-bold text-[#E31B23] block">
                      {quoteNumber}
                    </span>
                    <span className="text-xs text-slate-400 mt-1 block">Ref: {reference}</span>
                  </div>
                </div>

                {/* Headline Banner */}
                <div className="p-2.5 bg-[#FFF1F2] rounded-xl border border-red-200 text-xs font-bold text-[#E31B23]">
                  {headline}
                </div>

                {/* Metadata & Client Info Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Quotation Issued To
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {selectedCust?.name || 'Institutional Client'}
                    </h4>
                    <p className="text-slate-600 mt-0.5">Attn: {selectedCust?.contactPerson || 'Purchasing Department'}</p>
                    <p className="text-slate-500">{selectedCust?.phone} • {selectedCust?.email}</p>
                    {selectedCust?.gstNumber && (
                      <p className="font-mono text-[11px] text-slate-700 mt-1">GST: {selectedCust.gstNumber}</p>
                    )}
                    <p className="text-slate-500 text-[11px] mt-0.5">{selectedCust?.billingAddress}</p>
                  </div>

                  <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Timeline & Currency
                      </span>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Date of Issue:</span>
                          <span className="font-bold text-slate-800">{issueDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Valid Until:</span>
                          <span className="font-bold text-[#DC2626]">
                            {new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Price Tier Applied:</span>
                          <span className="font-bold text-amber-700">{selectedCust?.priceTier || 'Standard'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Currency:</span>
                          <span className="font-bold text-slate-800">INR (₹)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">#</th>
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3 font-mono">SKU</th>
                        <th className="py-2.5 px-3 text-right">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                        <th className="py-2.5 px-3 text-right">GST %</th>
                        <th className="py-2.5 px-3 text-right">Line Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {calculatedItems.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{it.productName}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{it.sku}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-800">{it.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                            {it.price.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-500">{it.gstPercent}%</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {it.subtotal.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary & Calculations Box */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
                  <div className="sm:w-1/2 space-y-2 text-xs text-slate-600">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800 block mb-1 text-[11px]">Notes & Warranties</span>
                      <p className="text-[11px] text-slate-600 whitespace-pre-line">{notes}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800 block mb-1 text-[11px]">Terms & Conditions</span>
                      <p className="text-[11px] text-slate-600 whitespace-pre-line">{terms}</p>
                    </div>
                  </div>

                  <div className="sm:w-5/12 space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                      <span>Subtotal (Untaxed):</span>
                      <span className="font-bold text-slate-900">₹ {subtotal.toLocaleString('en-IN')}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between py-1 border-b border-slate-100 text-[#E31B23]">
                        <span>Special Discount:</span>
                        <span className="font-bold">- ₹ {Number(discountAmount).toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                      <span>GST Tax Total:</span>
                      <span className="font-bold text-slate-900">₹ {totalGst.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between py-2.5 border-t-2 border-slate-900 text-sm font-black text-slate-900">
                      <span>Grand Total (INR):</span>
                      <span className="text-[#E31B23] text-base font-black">₹ {grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Bank Details and Signatures */}
                <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-[11px] text-slate-500">
                  <div>
                    <span className="font-bold text-slate-800 block mb-0.5">Banking Information for NEFT/RTGS</span>
                    <p>Bank: HDFC Bank Ltd • Current A/C: 50200039201920</p>
                    <p>IFSC Code: HDFC0000128 • Branch: Andheri East, Mumbai</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800 block mb-8">For Ronix Sports Pvt Ltd</span>
                    <span className="border-t border-slate-400 pt-1 px-4 inline-block font-medium text-slate-600">
                      Authorized Signatory
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
