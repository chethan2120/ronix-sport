import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Printer,
  CreditCard,
  Banknote,
  Smartphone,
  Layers,
  Plus,
  Minus,
  Sparkles,
  Zap,
  Trash2,
  User,
  ShoppingBag,
  Percent,
  X,
  RotateCcw,
  Receipt,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { Product, Customer } from '../types';
import { ProductImage } from './ProductImage';

interface PosCartItem {
  product: Product;
  quantity: number;
}

export const B2CPosView: React.FC = () => {
  const { products, categories: storeCategories = [], inventory, customers, createB2CSale, currentUser } = useStore();

  // Search & Category
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Cart State (Multi-item support)
  const [cartItems, setCartItems] = useState<PosCartItem[]>([]);

  // Customer & Discount
  const [customerType, setCustomerType] = useState<'walkin' | 'registered'>('walkin');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [walkinName, setWalkinName] = useState<string>('Walk-in Customer');
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Split'>('Cash');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid'>('Paid');

  // Completed Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState<{
    saleNumber: string;
    date: string;
    time: string;
    customerName: string;
    cashier: string;
    items: {
      name: string;
      sku: string;
      quantity: number;
      rate: number;
      amount: number;
    }[];
    subtotal: number;
    gstAmount: number;
    discount: number;
    total: number;
    paymentMethod: string;
  } | null>(null);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    (storeCategories || []).forEach((c) => map.set(c.toLowerCase(), c));
    (products || []).forEach((p) => {
      if (p?.category) map.set(p.category.toLowerCase(), p.category);
    });
    return ['All', ...Array.from(map.values())];
  }, [storeCategories, products]);

  // Product Filter
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        prod.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (selectedCategory === 'Cricket Bats' && prod.category === 'Bats');
      const matchesSearch =
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart Actions
  const handleAddToCart = (product: Product) => {
    const inv = inventory[product.id];
    const avail = inv ? Math.max(0, inv.onHand - inv.reserved) : 0;
    if (avail <= 0) return;

    setCartItems((prev) => {
      const existing = prev.find((it) => it.product.id === product.id);
      if (existing) {
        if (existing.quantity >= avail) return prev; // Cannot exceed available
        return prev.map((it) =>
          it.product.id === product.id ? { ...it, quantity: it.quantity + 1 } : it
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const inv = inventory[productId];
    const avail = inv ? Math.max(0, inv.onHand - inv.reserved) : 0;

    setCartItems((prev) =>
      prev
        .map((it) => {
          if (it.product.id === productId) {
            const nextQty = it.quantity + delta;
            if (nextQty <= 0) return null;
            if (nextQty > avail) return it; // Cap at available
            return { ...it, quantity: nextQty };
          }
          return it;
        })
        .filter(Boolean) as PosCartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((it) => it.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setDiscountAmount(0);
  };

  // Calculations
  const grossTotal = cartItems.reduce(
    (acc, it) => acc + it.product.retailPrice * it.quantity,
    0
  );
  const netBeforeTax = Math.max(0, grossTotal - discountAmount);
  // GST 18% calculation
  const gstAmount = Math.round(netBeforeTax * (18 / 118));
  const subtotalBeforeGst = netBeforeTax - gstAmount;
  const finalPayable = netBeforeTax;

  const resolvedCustomerName =
    customerType === 'registered'
      ? customers.find((c) => c.id === selectedCustomerId)?.name || 'Registered Customer'
      : walkinName || 'Walk-in Customer';

  // Complete Sale
  const handleCompleteSale = () => {
    if (cartItems.length === 0) {
      alert('Cart is empty. Please select products to sell.');
      return;
    }

    // Verify inventory for all items
    for (const item of cartItems) {
      const inv = inventory[item.product.id];
      const avail = inv ? Math.max(0, inv.onHand - inv.reserved) : 0;
      if (item.quantity > avail) {
        alert(`Only ${avail} units available for ${item.product.name}`);
        return;
      }
    }

    const salePayload = {
      items: cartItems.map((it) => ({
        productId: it.product.id,
        quantity: it.quantity,
      })),
      paymentMethod: paymentMethod === 'Split' ? 'Cash' : paymentMethod,
      paymentStatus,
      customerName: resolvedCustomerName,
    };

    const result = createB2CSale(salePayload);

    if (result.success && result.sale) {
      const receipt = {
        saleNumber: result.sale.saleNumber,
        date: result.sale.date,
        time: result.sale.time,
        customerName: resolvedCustomerName,
        cashier: currentUser.name,
        items: cartItems.map((it) => ({
          name: it.product.name,
          sku: it.product.sku,
          quantity: it.quantity,
          rate: it.product.retailPrice,
          amount: it.product.retailPrice * it.quantity,
        })),
        subtotal: subtotalBeforeGst,
        gstAmount,
        discount: discountAmount,
        total: finalPayable,
        paymentMethod,
      };

      setActiveReceipt(receipt);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {}
    } else {
      alert(result.error || 'Failed to complete sale');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewSale = () => {
    setActiveReceipt(null);
    setCartItems([]);
    setDiscountAmount(0);
    setWalkinName('Walk-in Customer');
    setCustomerType('walkin');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[#111827] flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#E31B23]" />
            <span>RETAIL POS & COUNTER DISPATCH</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              Live Counter Mode
            </span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Instant barcode / quick-add touch register, automated GST slip printing, and real-time inventory deduction.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-semibold">
            <User className="w-3.5 h-3.5 text-[#E31B23]" />
            <span>Cashier: <strong>{currentUser.name}</strong></span>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>
      </div>

      {/* Main Split: Left/Center Product Grid (Cols 1-7) & Right Panel Cart/Checkout (Cols 8-12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT / CENTER: PRODUCT SEARCH & QUICK ADD CARDS */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by title, SKU, or sport..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23] focus:bg-white"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold custom-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#E31B23] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-[#E31B23]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quick-Add Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredProducts.map((prod) => {
              const inv = inventory[prod.id] || { onHand: 0, reserved: 0, available: 0 };
              const available = Math.max(0, inv.onHand - inv.reserved);
              const isOutOfStock = available <= 0;
              const isLowStock = available > 0 && available <= (prod.minStockLevel || 10);
              const inCartQty = cartItems.find((it) => it.product.id === prod.id)?.quantity || 0;

              return (
                <div
                  key={prod.id}
                  onClick={() => !isOutOfStock && handleAddToCart(prod)}
                  className={`bg-white rounded-2xl border p-3 flex flex-col justify-between transition-all duration-150 relative ${
                    isOutOfStock
                      ? 'opacity-50 border-slate-200 cursor-not-allowed bg-slate-50'
                      : 'hover:border-red-300 hover:shadow-xs cursor-pointer border-slate-200 active:scale-[0.98]'
                  }`}
                >
                  {/* Cart badge if added */}
                  {inCartQty > 0 && (
                    <span className="absolute top-2 left-2 z-10 w-5 h-5 rounded-full bg-[#E31B23] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                      {inCartQty}
                    </span>
                  )}

                  {/* Stock Pill on Top Right */}
                  <span
                    className={`absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                      isOutOfStock
                        ? 'bg-red-100 text-red-700'
                        : isLowStock
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isOutOfStock ? 'Sold Out' : `${available} Left`}
                  </span>

                  {/* Clean White Image Container */}
                  <div className="aspect-square w-full bg-slate-50 rounded-xl p-3 flex items-center justify-center overflow-hidden mb-2">
                    <ProductImage
                      src={prod.image}
                      alt={prod.name}
                      category={prod.category}
                      name={prod.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#E31B23] uppercase block truncate">
                      {prod.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1" title={prod.name}>
                      {prod.name}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-400">{prod.sku}</p>

                    <div className="pt-1 flex items-baseline justify-between">
                      <span className="text-sm font-black text-slate-900">
                        ₹{prod.retailPrice.toLocaleString('en-IN')}
                      </span>
                      <button
                        disabled={isOutOfStock}
                        className="p-1 rounded-lg bg-red-50 text-[#E31B23] hover:bg-[#E31B23] hover:text-white transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL: CART / CHECKOUT / PAYMENT */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#E31B23]" />
                <h3 className="text-sm font-bold text-slate-900">Counter Order Cart</h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#E31B23]">
                {cartItems.reduce((acc, it) => acc + it.quantity, 0)} Items
              </span>
            </div>

            {/* Customer Selection: Walk-in or Registered */}
            <div className="mt-3 p-3 bg-[#F8F9FA] rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Customer Type</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setCustomerType('walkin')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                      customerType === 'walkin'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    Walk-in
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerType('registered');
                      if (!selectedCustomerId && customers[0]) {
                        setSelectedCustomerId(customers[0].id);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                      customerType === 'registered'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    Registered
                  </button>
                </div>
              </div>

              {customerType === 'walkin' ? (
                <input
                  type="text"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  placeholder="Customer Name (e.g. Ramesh Kumar)"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E31B23]"
                />
              ) : (
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E31B23]"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type} - {c.phone})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Selected Items List with Quantity Controls */}
            <div className="mt-3.5 space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
              {cartItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-1.5 opacity-30" />
                  <p className="text-xs font-bold text-slate-600">Cart is empty</p>
                  <p className="text-[11px] text-slate-400">Click products on the left to add items.</p>
                </div>
              ) : (
                cartItems.map((item) => {
                  const inv = inventory[item.product.id];
                  const avail = inv ? Math.max(0, inv.onHand - inv.reserved) : 0;
                  const itemTotal = item.product.retailPrice * item.quantity;

                  return (
                    <div
                      key={item.product.id}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">{item.product.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span>₹{item.product.retailPrice.toLocaleString('en-IN')} each</span>
                          <span>&bull;</span>
                          <span className="font-mono">{item.product.sku}</span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, -1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-red-600 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-black text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, 1)}
                          disabled={item.quantity >= avail}
                          className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-emerald-600 disabled:opacity-30 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item Total Amount */}
                      <div className="text-right min-w-[70px]">
                        <span className="font-black text-slate-900 block">
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleRemoveFromCart(item.product.id)}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Discount & Calculations */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2 text-xs">
              {/* Discount Field */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500 font-medium">Order Discount (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  className="w-24 px-2.5 py-1 text-right bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#E31B23]"
                />
              </div>

              {/* Subtotal */}
              <div className="flex justify-between text-slate-500">
                <span>Subtotal (Excl. Tax)</span>
                <span className="font-semibold text-slate-700">
                  ₹{subtotalBeforeGst.toLocaleString('en-IN')}
                </span>
              </div>

              {/* GST 18% */}
              <div className="flex justify-between text-slate-500">
                <span>GST (18% Included)</span>
                <span className="font-semibold text-slate-700">
                  ₹{gstAmount.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Total (LARGE, BOLD font) */}
              <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between">
                <span className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Total Payable
                </span>
                <span className="text-3xl font-black text-[#E31B23] tracking-tight">
                  ₹{finalPayable.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Payment Methods: [ Cash ] [ UPI / QR ] [ Card ] [ Split ] */}
            <div className="mt-4">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                {[
                  { id: 'Cash', label: 'Cash', icon: Banknote },
                  { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
                  { id: 'Card', label: 'Card', icon: CreditCard },
                  { id: 'Split', label: 'Split', icon: Layers },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`py-2.5 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FFF1F2] text-[#E31B23] border-[#E31B23] shadow-xs ring-1 ring-[#E31B23]'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px]">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Button: [ COMPLETE SALE ] */}
          <div className="pt-2">
            <button
              id="btn-complete-pos-sale"
              onClick={handleCompleteSale}
              disabled={cartItems.length === 0}
              className="w-full py-3.5 bg-[#E31B23] hover:bg-[#B5121B] active:bg-red-900 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-md shadow-red-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              <span>COMPLETE SALE &bull; ₹{finalPayable.toLocaleString('en-IN')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* PRINTABLE SPORTS STORE RECEIPT MODAL */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 no-print">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Payment Confirmed</span>
              </span>
              <button
                onClick={() => setActiveReceipt(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* RECEIPT SLIP BODY (Thermal / Printable Format) */}
            <div id="print-area" className="bg-[#F8F9FA] rounded-2xl p-5 border border-slate-200 font-mono text-xs text-slate-800 space-y-4">
              {/* Header */}
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 bg-[#E31B23] text-white rounded text-xs font-black flex items-center justify-center">
                    R
                  </div>
                  <h3 className="font-black text-sm tracking-wider text-slate-900">
                    RONIX SPORTS
                  </h3>
                </div>
                <p className="text-[10px] text-slate-500 font-sans">Official Retail Sports Store</p>
                <p className="text-[10px] text-slate-500">
                  Brigade Sports Hub, MG Road, Bengaluru, KA - 560001
                </p>
                <p className="text-[10px] text-slate-500">
                  GSTIN: <span className="font-bold text-slate-700">29AABCR8842K1Z9</span> | Ph: +91 80 2345 6789
                </p>
              </div>

              {/* Invoice Meta */}
              <div className="text-[11px] space-y-1 pb-3 border-b border-dashed border-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt #:</span>
                  <span className="font-bold text-slate-900">{activeReceipt.saleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span>{activeReceipt.date}, {activeReceipt.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cashier:</span>
                  <span>{activeReceipt.cashier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-900">{activeReceipt.customerName}</span>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="space-y-2 pb-3 border-b border-dashed border-slate-300">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-200 uppercase text-[9px]">
                      <th className="pb-1">Item</th>
                      <th className="pb-1 text-center">Qty</th>
                      <th className="pb-1 text-right">Rate</th>
                      <th className="pb-1 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeReceipt.items.map((item, idx) => (
                      <tr key={idx} className="py-1">
                        <td className="py-1 pr-1">
                          <p className="font-bold text-slate-900 truncate max-w-[140px]">{item.name}</p>
                          <p className="text-[9px] text-slate-400">{item.sku}</p>
                        </td>
                        <td className="py-1 text-center font-bold">{item.quantity}</td>
                        <td className="py-1 text-right">₹{item.rate.toLocaleString('en-IN')}</td>
                        <td className="py-1 text-right font-black">₹{item.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="space-y-1.5 text-[11px] pb-3 border-b border-dashed border-slate-300">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>₹{activeReceipt.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST (18%):</span>
                  <span>₹{activeReceipt.gstAmount.toLocaleString('en-IN')}</span>
                </div>
                {activeReceipt.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount:</span>
                    <span>-₹{activeReceipt.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                  <span>GRAND TOTAL:</span>
                  <span className="text-[#E31B23]">₹{activeReceipt.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="flex items-center justify-between text-[11px] pt-1 font-bold">
                <span>Payment Mode: {activeReceipt.paymentMethod}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase text-[10px]">
                  PAID
                </span>
              </div>

              {/* Thank you note & Return policy */}
              <div className="text-center pt-2 text-[10px] text-slate-500 space-y-0.5 border-t border-slate-200 font-sans">
                <p className="font-bold text-slate-800">Thank you for choosing Ronix Sports!</p>
                <p>Play with passion. Gear up like a champion.</p>
                <p className="text-[9px] text-slate-400 pt-1">
                  * 7-day hassle-free exchange with original bill on unplayed sports gear.
                </p>
              </div>
            </div>

            {/* Actions: [Print Receipt] [New Sale] */}
            <div className="flex gap-2 pt-2 no-print">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={handleNewSale}
                className="flex-1 py-3 rounded-xl bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>New Sale</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
