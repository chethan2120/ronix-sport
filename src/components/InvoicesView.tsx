import React, { useState } from 'react';
import {
  FileText,
  Search,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Send,
  Building2,
  Sparkles,
  DollarSign,
  X,
  CreditCard,
  Trash2,
  FileCheck,
  Pencil,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Invoice, Quotation, OrderItem } from '../types';

export const InvoicesView: React.FC = () => {
  const {
    invoices,
    quotations,
    customers,
    products,
    createInvoice,
    updateInvoice,
    updateInvoiceStatus,
    deleteInvoice,
    recordPayment,
    convertQuotationToOrder,
    setActiveTab,
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'quotations'>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(invoices[0] || null);
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEditInvoiceModalOpen, setIsEditInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Edit Invoice Form State
  const [editInvoiceNumber, setEditInvoiceNumber] = useState('');
  const [editCustomerId, setEditCustomerId] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState<Invoice['paymentStatus']>('Unpaid');
  const [editPaymentMethod, setEditPaymentMethod] = useState<'NEFT' | 'UPI' | 'Cheque' | 'Credit' | 'Cash'>('Credit');
  const [editDueDate, setEditDueDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editItems, setEditItems] = useState<
    {
      productId: string;
      productName: string;
      sku: string;
      price: number;
      quantity: number;
      gstPercent: number;
    }[]
  >([]);

  // New Invoice Form State
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-2025-${(invoices.length + 101).toString()}`);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid' | 'Partial'>('Unpaid');
  const [paymentMethod, setPaymentMethod] = useState<'NEFT' | 'UPI' | 'Cheque' | 'Credit' | 'Cash'>('Credit');
  const [dueDateDays, setDueDateDays] = useState(30);

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
      productName: products[0]?.name || 'Ronix English Willow Bat',
      sku: products[0]?.sku || 'RNX-BAT-01',
      price: products[0]?.b2bPrice || 1450,
      quantity: 10,
      gstPercent: products[0]?.gstPercent || 18,
    },
  ]);

  const selectedCust = customers.find((c) => c.id === selectedCustomerId);

  const filteredInvoices = invoices.filter((inv) => {
    return (
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.organizationName && inv.organizationName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

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
  const grandTotal = subtotal + totalGst;

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
        quantity: 5,
        gstPercent: defaultProd.gstPercent || 18,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    const due = new Date(today.getTime() + dueDateDays * 24 * 60 * 60 * 1000);

    const newInv = createInvoice({
      invoiceNumber,
      orderId: `ORD-${Date.now().toString().slice(-6)}`,
      customerId: selectedCustomerId,
      customerName: selectedCust?.contactPerson || 'Purchasing Officer',
      organizationName: selectedCust?.name || selectedCust?.organizationName || 'Client Institution',
      phone: selectedCust?.phone || '',
      email: selectedCust?.email || '',
      billingAddress: selectedCust?.billingAddress || 'Default Address',
      shippingAddress: selectedCust?.shippingAddress || selectedCust?.billingAddress || 'Default Address',
      gstNumber: selectedCust?.gstNumber || '',
      date: today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      dueDate: due.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      items: calculatedItems,
      subtotal,
      gstTotal: totalGst,
      total: grandTotal,
      paidAmount: paymentStatus === 'Paid' ? grandTotal : 0,
      balanceDue: paymentStatus === 'Paid' ? 0 : grandTotal,
      paymentStatus,
      paymentMethod,
      orderType: 'B2B',
    });

    setSelectedInvoice(newInv);
    setIsNewInvoiceModalOpen(false);
  };

  const handleStartEdit = (inv: Invoice) => {
    setEditingInvoice(inv);
    setEditInvoiceNumber(inv.invoiceNumber);
    setEditCustomerId(inv.customerId || customers[0]?.id || '');
    setEditPaymentStatus(inv.paymentStatus);
    setEditPaymentMethod((inv.paymentMethod as any) || 'Credit');
    setEditDueDate(inv.dueDate || '');
    setEditNotes(inv.notes || '');
    if (inv.items && inv.items.length > 0) {
      setEditItems(
        inv.items.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          sku: it.sku,
          price: it.price,
          quantity: it.quantity,
          gstPercent: it.gstPercent || 18,
        }))
      );
    } else {
      setEditItems([
        {
          productId: products[0]?.id || 'p1',
          productName: products[0]?.name || 'Sports Item',
          sku: products[0]?.sku || 'SKU-01',
          price: products[0]?.b2bPrice || 1000,
          quantity: 1,
          gstPercent: products[0]?.gstPercent || 18,
        },
      ]);
    }
    setIsEditInvoiceModalOpen(true);
  };

  const handleEditAddItem = () => {
    setEditItems([
      ...editItems,
      {
        productId: products[0]?.id || 'p1',
        productName: products[0]?.name || 'Sports Item',
        sku: products[0]?.sku || 'SKU-01',
        price: products[0]?.b2bPrice || 1000,
        quantity: 1,
        gstPercent: products[0]?.gstPercent || 18,
      },
    ]);
  };

  const handleEditRemoveItem = (index: number) => {
    setEditItems(editItems.filter((_, idx) => idx !== index));
  };

  const calculatedEditItems: OrderItem[] = editItems.map((it) => {
    const itemSubtotal = it.price * it.quantity;
    const gstAmt = (itemSubtotal * it.gstPercent) / 100;
    return {
      productId: it.productId,
      productName: it.productName,
      sku: it.sku,
      image: (it as any).image || '',
      price: it.price,
      quantity: it.quantity,
      subtotal: itemSubtotal,
      gstPercent: it.gstPercent,
      gstAmount: gstAmt,
      total: itemSubtotal + gstAmt,
    };
  });

  const editSubtotal = calculatedEditItems.reduce((acc, i) => acc + i.subtotal, 0);
  const editGstTotal = calculatedEditItems.reduce((acc, i) => acc + (i.gstAmount || 0), 0);
  const editGrandTotal = editSubtotal + editGstTotal;

  const handleSaveEditInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;

    const cust = customers.find((c) => c.id === editCustomerId);
    const updates: Partial<Invoice> = {
      invoiceNumber: editInvoiceNumber,
      customerId: cust?.id || editingInvoice.customerId,
      customerName: cust?.contactPerson || cust?.name || editingInvoice.customerName,
      organizationName: cust?.organizationName || cust?.name || editingInvoice.organizationName,
      billingAddress: cust?.billingAddress || editingInvoice.billingAddress,
      shippingAddress: cust?.shippingAddress || editingInvoice.shippingAddress,
      gstNumber: cust?.gstNumber || editingInvoice.gstNumber,
      paymentStatus: editPaymentStatus,
      paymentMethod: editPaymentMethod,
      dueDate: editDueDate || editingInvoice.dueDate,
      items: calculatedEditItems,
      subtotal: editSubtotal,
      gstTotal: editGstTotal,
      total: editGrandTotal,
      paidAmount: editPaymentStatus === 'Paid' ? editGrandTotal : editingInvoice.paidAmount,
      balanceDue: editPaymentStatus === 'Paid' ? 0 : editGrandTotal,
      notes: editNotes,
    };

    updateInvoice(editingInvoice.id, updates);

    const updatedInv = {
      ...editingInvoice,
      ...updates,
    } as Invoice;

    setSelectedInvoice(updatedInv);
    setIsEditInvoiceModalOpen(false);
    setEditingInvoice(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[#111827] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#E31B23]" />
            <span>INVOICES & BILLING</span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            GST compliant tax invoices, proforma quotations, and instant payment settlement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'invoices'
                ? 'bg-[#E31B23] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-[#FFF1F2] hover:text-[#E31B23]'
            }`}
          >
            Tax Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('quotations')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-[#FFF1F2] hover:text-[#E31B23] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Quotations ({quotations.length})</span>
          </button>
          <button
            onClick={() => setIsNewInvoiceModalOpen(true)}
            className="px-4 py-1.5 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Invoice</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'invoices' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Invoice List (Columns 1-5) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">All Tax Invoices</h3>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="pl-7 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs w-36 focus:outline-none focus:ring-1 focus:ring-[#E31B23]"
                  />
                </div>
              </div>

              <div className="mt-3 space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {filteredInvoices.map((inv) => {
                  const isSelected = selectedInvoice?.id === inv.id;
                  return (
                    <div
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#E31B23] bg-[#FFF1F2]/60 shadow-xs ring-1 ring-[#E31B23]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#E31B23]">{inv.invoiceNumber}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            inv.paymentStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : inv.paymentStatus === 'Partial'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </div>

                      <div className="mt-1.5 flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-semibold truncate max-w-[170px]">
                          {inv.organizationName || inv.customerName}
                        </span>
                        <span className="font-black text-slate-900">₹ {(inv.total ?? 0).toLocaleString('en-IN')}</span>
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>{inv.date}</span>
                        <div className="flex items-center gap-2">
                          <span>{inv.paymentMethod}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(inv);
                            }}
                            title="Edit Invoice"
                            className="p-1 hover:text-[#E31B23] hover:bg-[#FFF1F2] rounded transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Printable Official Invoice Sheet (Columns 6-12) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            {selectedInvoice ? (
              <div className="space-y-4">
                {/* Actions Top Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Tax Invoice Details</span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        selectedInvoice.paymentStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : selectedInvoice.paymentStatus === 'Overdue'
                          ? 'bg-red-50 text-[#DC2626] border-red-200'
                          : 'bg-amber-50 text-[#F59E0B] border-amber-200'
                      }`}
                    >
                      {selectedInvoice.paymentStatus.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEdit(selectedInvoice)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-[#FFF1F2] hover:text-[#E31B23] text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Invoice</span>
                    </button>

                    {selectedInvoice.paymentStatus !== 'Paid' && (
                      <button
                        onClick={() => {
                          recordPayment({
                            customerId: selectedInvoice.customerId || customers[0]?.id || 'c1',
                            invoiceId: selectedInvoice.id,
                            amount: selectedInvoice.total,
                            method: 'NEFT',
                            notes: `Full payment settlement for ${selectedInvoice.invoiceNumber}`,
                          });
                          updateInvoiceStatus(selectedInvoice.id, 'Paid');
                          setSelectedInvoice({ ...selectedInvoice, paymentStatus: 'Paid', balanceDue: 0, paidAmount: selectedInvoice.total });
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark as Paid</span>
                      </button>
                    )}

                    <button
                      onClick={handlePrint}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Download PDF / Print</span>
                    </button>
                  </div>
                </div>

                {/* Printable Invoice Container */}
                <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200 text-xs space-y-4 font-sans">
                  {/* Company & Invoice Header */}
                  <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-[#E31B23] rounded-md flex items-center justify-center text-white font-black text-xs">
                          R
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">RONIX SPORTS</h3>
                      </div>
                      <p className="text-[11px] text-[#E31B23] font-bold">Official Sports Equipment Manufacturer</p>
                      <p className="text-[11px] text-slate-500 font-mono">GSTIN: 27AABCR9876Q1Z9</p>
                      <p className="text-[11px] text-slate-500">Andheri East, Mumbai 400069</p>
                    </div>
                    <div className="text-right">
                      <h4 className="text-sm font-black text-slate-900 uppercase">Tax Invoice</h4>
                      <p className="font-mono font-bold text-[#E31B23] mt-1">{selectedInvoice.invoiceNumber}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">Date: {selectedInvoice.date}</p>
                      <p className="text-slate-500 text-[11px]">Due: {selectedInvoice.dueDate}</p>
                    </div>
                  </div>

                  {/* Billed To */}
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Billed To:
                      </span>
                      <p className="font-black text-slate-900 mt-0.5">
                        {selectedInvoice.organizationName || selectedInvoice.customerName}
                      </p>
                      <p className="text-slate-600 text-[11px]">{selectedInvoice.customerName}</p>
                      {selectedInvoice.gstNumber && (
                        <p className="text-slate-500 text-[11px] font-mono">GSTIN: {selectedInvoice.gstNumber}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Payment Mode:
                      </span>
                      <p className="font-bold text-slate-900 mt-0.5">{selectedInvoice.paymentMethod}</p>
                      <span className="text-[11px] text-emerald-600 font-bold">
                        Status: {selectedInvoice.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div>
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                          <th className="py-2">Item Description</th>
                          <th className="py-2 text-right">Qty</th>
                          <th className="py-2 text-right">Rate (₹)</th>
                          <th className="py-2 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedInvoice.items.map((item, idx) => {
                          const rate = item.price ?? (item as any).unitPrice ?? 0;
                          const amount = item.total ?? item.subtotal ?? (item as any).totalPrice ?? 0;
                          return (
                            <tr key={idx}>
                              <td className="py-2.5 font-bold text-slate-900">{item.productName}</td>
                              <td className="py-2.5 text-right font-semibold">{item.quantity}</td>
                              <td className="py-2.5 text-right">₹ {rate.toLocaleString('en-IN')}</td>
                              <td className="py-2.5 text-right font-black text-slate-900">
                                ₹ {amount.toLocaleString('en-IN')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Totals */}
                  <div className="pt-3 border-t border-slate-200 space-y-1.5 text-right">
                    <div className="flex justify-between text-slate-600">
                      <span>Taxable Value (Subtotal):</span>
                      <span className="font-bold text-slate-900">
                        ₹ {(selectedInvoice.subtotal ?? 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>CGST (9%):</span>
                      <span className="font-semibold text-slate-700">
                        ₹ {Math.round(((selectedInvoice.gstTotal ?? 0) / 2)).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>SGST (9%):</span>
                      <span className="font-semibold text-slate-700">
                        ₹ {Math.round(((selectedInvoice.gstTotal ?? 0) / 2)).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 font-bold pt-1 border-t border-slate-100">
                      <span>Total GST (18%):</span>
                      <span className="text-slate-900">
                        ₹ {(selectedInvoice.gstTotal ?? (selectedInvoice as any).gstAmount ?? 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="pt-2 border-t-2 border-slate-900 flex justify-between text-base font-black text-slate-900">
                      <span>Total Amount Due:</span>
                      <span className="text-[#E31B23]">
                        ₹ {(selectedInvoice.total ?? 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">Select an invoice to view details.</div>
            )}
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {isNewInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Create New Tax Invoice</h3>
              <button onClick={() => setIsNewInvoiceModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Invoice Number</label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  >
                    <option value="Credit">Credit (Net 30)</option>
                    <option value="NEFT">NEFT / Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer / Institution</label>
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

              {/* Line Items */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-700">Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-bold text-[#E31B23] hover:text-[#B5121B] cursor-pointer"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                      <select
                        value={item.productId}
                        onChange={(e) => {
                          const p = products.find((pr) => pr.id === e.target.value);
                          if (!p) return;
                          const newItems = [...items];
                          newItems[idx] = {
                            ...newItems[idx],
                            productId: p.id,
                            productName: p.name,
                            sku: p.sku,
                            price: p.b2bPrice,
                          };
                          setItems(newItems);
                        }}
                        className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (₹{p.b2bPrice})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].quantity = Math.max(1, Number(e.target.value));
                          setItems(newItems);
                        }}
                        className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                      />
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#FFF1F2] rounded-xl border border-red-200 flex justify-between items-center text-xs">
                <span className="font-bold text-[#E31B23]">Total Invoice Amount:</span>
                <span className="font-black text-[#E31B23] text-sm">₹ {grandTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="mt-5 flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Generate Tax Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Invoice Modal */}
      {isEditInvoiceModalOpen && editingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-[#E31B23]">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Edit Tax Invoice: {editingInvoice.invoiceNumber}
                  </h3>
                  <p className="text-[11px] text-slate-400">Update invoice details, line items, or payment status</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditInvoiceModalOpen(false);
                  setEditingInvoice(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Data Protection Warning if Paid */}
            {editingInvoice.paymentStatus === 'Paid' && (
              <div className="mt-3 p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-950 block">
                    Financial Data Protection Warning
                  </span>
                  <p className="text-amber-800">
                    This invoice is currently recorded as <span className="font-bold underline">PAID</span>. Modifying line items, quantities, or prices will alter the total invoice amount and could cause reconciliation differences with existing payment records.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveEditInvoice} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Invoice Number</label>
                  <input
                    type="text"
                    required
                    value={editInvoiceNumber}
                    onChange={(e) => setEditInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Status</label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Method / Terms</label>
                  <select
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  >
                    <option value="Credit">Credit (Net 30)</option>
                    <option value="NEFT">NEFT / Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Due Date</label>
                  <input
                    type="text"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    placeholder="e.g. 28 Feb 2025"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer / Institutional Account</label>
                <select
                  value={editCustomerId}
                  onChange={(e) => setEditCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type} • {c.organizationName || c.contactPerson})
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Items */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-700">Invoice Line Items</label>
                  <button
                    type="button"
                    onClick={handleEditAddItem}
                    className="text-xs font-bold text-[#E31B23] hover:text-[#B5121B] cursor-pointer"
                  >
                    + Add Product Line
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {editItems.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                      <select
                        value={item.productId}
                        onChange={(e) => {
                          const p = products.find((pr) => pr.id === e.target.value);
                          if (!p) return;
                          const newItems = [...editItems];
                          newItems[idx] = {
                            ...newItems[idx],
                            productId: p.id,
                            productName: p.name,
                            sku: p.sku,
                            price: p.b2bPrice,
                            gstPercent: p.gstPercent || 18,
                          };
                          setEditItems(newItems);
                        }}
                        className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(e) => {
                            const newItems = [...editItems];
                            newItems[idx].price = Math.max(0, Number(e.target.value));
                            setEditItems(newItems);
                          }}
                          className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-right focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-400">Qty:</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...editItems];
                            newItems[idx].quantity = Math.max(1, Number(e.target.value));
                            setEditItems(newItems);
                          }}
                          className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                        />
                      </div>

                      {editItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleEditRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes / Terms</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Special instructions or payment terms..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#E31B23] focus:outline-none resize-none"
                />
              </div>

              {/* Calculated Totals Box */}
              <div className="p-3 bg-[#FFF1F2] rounded-xl border border-red-200 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold">₹ {editSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST Total:</span>
                  <span className="font-mono font-bold">₹ {editGstTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-black border-t border-red-200 pt-1 text-sm">
                  <span className="text-[#E31B23]">Total Invoice Amount:</span>
                  <span className="text-[#E31B23]">₹ {editGrandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="mt-5 flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditInvoiceModalOpen(false);
                    setEditingInvoice(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Invoice Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
