import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Tag,
  Clock,
  Printer,
  FileText,
  Boxes,
  Minus,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { Product, Customer } from '../types';
import { ProductImage } from './ProductImage';

export const B2BOrderFlowView: React.FC = () => {
  const {
    products,
    categories: storeCategories = [],
    inventory,
    customers,
    getPriceForCustomer,
    placeB2BOrder,
    setActiveTab,
  } = useStore();

  // B2B Institutions only
  const b2bCustomers = customers.filter((c) => c.type === 'B2B');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    b2bCustomers[0]?.id || 'cust-st-joseph'
  );

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selected product & quantity state
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0] || {} as Product);
  const [quantityStr, setQuantityStr] = useState<string>('10');
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedCustomer = b2bCustomers.find((c) => c.id === selectedCustomerId) || b2bCustomers[0];

  // Dynamic Categories
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    (storeCategories || []).forEach((c) => map.set(c.toLowerCase(), c));
    (products || []).forEach((p) => {
      if (p?.category) map.set(p.category.toLowerCase(), p.category);
    });
    return ['All', ...Array.from(map.values())];
  }, [storeCategories, products]);

  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      prod.category.toLowerCase() === selectedCategory.toLowerCase() ||
      prod.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (selectedCategory === 'Accessories' && ['Helmets', 'Gloves', 'Bags'].includes(prod.category));
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Active product fallback
  const activeProduct: Product | undefined = products.find((p) => p.id === selectedProduct?.id) || products[0];

  const currentInventory = (activeProduct && inventory[activeProduct.id]) || { onHand: 0, reserved: 0, available: 0 };
  const currentAvailable = Math.max(0, (currentInventory.onHand || 0) - (currentInventory.reserved || 0));

  const quantityNum = parseInt(quantityStr, 10) || 0;
  
  // Strict stock validation
  const isZeroStock = !activeProduct || currentAvailable <= 0;
  const isStockExceeded = currentAvailable > 0 && quantityNum > currentAvailable;
  const isInvalidQuantity = !activeProduct || quantityNum <= 0 || isStockExceeded || isZeroStock;

  const stockValidationMessage = !activeProduct
    ? 'No products available.'
    : isZeroStock
    ? 'Out of stock! This product currently has 0 units available.'
    : isStockExceeded
    ? `Only ${currentAvailable} units available in stock.`
    : quantityNum <= 0
    ? 'Please enter a valid quantity greater than 0.'
    : null;

  const pricingInfo = activeProduct
    ? getPriceForCustomer(activeProduct.id, selectedCustomer?.id, Math.max(1, quantityNum))
    : { unitPrice: 0, ruleApplied: 'Default' };
  const unitPrice = pricingInfo.unitPrice || 0;
  const subtotal = unitPrice * quantityNum;
  const gstRate = activeProduct?.gstPercent || 18;
  const gstAmount = (subtotal * gstRate) / 100;
  const total = subtotal + gstAmount;

  // Stepper Handlers
  const handleIncrement = () => {
    setErrorMessage(null);
    const nextVal = Math.min(currentAvailable, quantityNum + 1);
    setQuantityStr(String(nextVal));
  };

  const handleDecrement = () => {
    setErrorMessage(null);
    const prevVal = Math.max(1, quantityNum - 1);
    setQuantityStr(String(prevVal));
  };

  const handleSetPreset = (presetQty: number) => {
    setErrorMessage(null);
    const val = Math.min(currentAvailable > 0 ? currentAvailable : presetQty, presetQty);
    setQuantityStr(String(val));
  };

  // Direct typing handler
  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const rawVal = e.target.value;
    if (rawVal === '') {
      setQuantityStr('0');
      return;
    }
    const parsed = parseInt(rawVal, 10);
    if (!isNaN(parsed)) {
      setQuantityStr(String(parsed));
    }
  };

  // Keypad Handlers
  const handleKeypadPress = (val: string) => {
    setErrorMessage(null);
    if (val === 'C') {
      setQuantityStr('0');
    } else if (val === 'BACK') {
      setQuantityStr((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else {
      setQuantityStr((prev) => {
        if (prev === '0') return val;
        if (prev.length >= 6) return prev; // Limit max digits
        return prev + val;
      });
    }
  };

  const handlePlaceOrder = () => {
    setErrorMessage(null);
    if (isInvalidQuantity) {
      setErrorMessage(stockValidationMessage || 'Invalid quantity specified.');
      return;
    }

    const result = placeB2BOrder({
      customerId: selectedCustomer.id,
      items: [{ productId: selectedProduct.id, quantity: quantityNum }],
      notes: `Institutional order from 3-Click flow for ${selectedCustomer.name}`,
    });

    if (result.success && result.order) {
      setOrderSuccess(result.order);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Confetti fallback
      }
    } else {
      setErrorMessage(result.error || 'Failed to place order.');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner with Workflow Stepper Header */}
      <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[#111827] flex items-center gap-2">
            <span>B2B ORDER FLOW (3 CLICKS)</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FFF1F2] text-[#E31B23] border border-red-200 px-2 py-0.5 rounded-full">
              Atomic Fast
            </span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Rapid procurement pipeline with real-time customer pricing and instant stock reservation.
          </p>
        </div>

        {/* 3 Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <div className="flex items-center gap-1.5 bg-[#FFF1F2] border border-red-200 text-[#E31B23] px-3 py-1.5 rounded-xl">
            <span className="w-5 h-5 rounded-full bg-[#E31B23] text-white flex items-center justify-center text-[11px]">
              1
            </span>
            <span>Select Product</span>
          </div>
          <span className="text-slate-400">→</span>
          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[11px]">
              2
            </span>
            <span>Enter Quantity</span>
          </div>
          <span className="text-slate-400">→</span>
          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl">
            <span className="w-5 h-5 rounded-full bg-[#E31B23] text-white flex items-center justify-center text-[11px]">
              3
            </span>
            <span>Place Order</span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Layout Matching Reference Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* STEP 1: Select Product (Columns 1-4) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#E31B23] text-white flex items-center justify-center text-xs font-black">
                  1
                </span>
                <h3 className="text-sm font-bold text-slate-900">Select Product</h3>
              </div>
            </div>

            {/* Search */}
            <div className="mt-3 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="b2b-product-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#E31B23] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-[#FFF1F2] hover:text-[#E31B23]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Cards List */}
            <div className="mt-3.5 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredProducts.map((prod) => {
                const inv = inventory[prod.id] || { onHand: 0, reserved: 0, available: 0 };
                const avail = Math.max(0, inv.onHand - inv.reserved);
                const isSelected = selectedProduct.id === prod.id;

                return (
                  <div
                    key={prod.id}
                    id={`b2b-prod-${prod.id}`}
                    onClick={() => {
                      setSelectedProduct(prod);
                      setErrorMessage(null);
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#E31B23] bg-[#FFF1F2]/60 shadow-sm ring-2 ring-[#E31B23]'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-slate-50 p-1.5 flex items-center justify-center border border-slate-200 flex-shrink-0 overflow-hidden shadow-2xs">
                        <ProductImage
                          src={prod.image}
                          category={prod.category}
                          name={prod.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">{prod.name}</h4>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 font-semibold text-slate-600">
                            {prod.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{prod.sku}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs font-bold text-[#E31B23]">
                            ₹ {(prod.retailPrice ?? 0).toLocaleString('en-IN')}
                          </p>
                          <span className="text-slate-300">•</span>
                          <p className={`text-[11px] font-semibold ${avail <= 0 ? 'text-red-500' : avail <= 10 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            Stock: {(avail ?? 0).toLocaleString('en-IN')} units
                          </p>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-[#E31B23] flex-shrink-0 ml-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex justify-center border-t border-slate-100 mt-3">
            <div className="w-7 h-7 rounded-full bg-[#FFF1F2] text-[#E31B23] border border-red-200 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* STEP 2: Enter Quantity & Touch Keypad (Columns 5-8) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                  2
                </span>
                <h3 className="text-sm font-bold text-slate-900">Enter Quantity</h3>
              </div>
            </div>

            {/* Selected Product Banner */}
            <div className="mt-3 text-center">
              <h4 className="text-sm font-black text-slate-900">{activeProduct?.name || 'Select a product'}</h4>
              <div className="my-3 w-28 h-28 mx-auto p-2 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center shadow-xs overflow-hidden">
                <ProductImage
                  src={activeProduct?.image}
                  category={activeProduct?.category}
                  name={activeProduct?.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Price & Available Meta */}
              <div className="space-y-1.5 px-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">Price (Your Price)</span>
                  <span className="text-sm font-black text-[#E31B23]">
                    ₹ {(unitPrice ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">Available</span>
                  <span className={`font-bold ${currentAvailable <= 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {(currentAvailable ?? 0).toLocaleString('en-IN')} units
                  </span>
                </div>
              </div>

              {/* Quantity Stepper & Direct Typing Input */}
              <div className="mt-3 flex items-center justify-between gap-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-[#E31B23]">
                <span className="text-xs font-bold text-slate-600">Quantity</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={quantityNum <= 1}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-[#FFF1F2] hover:text-[#E31B23] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Decrease quantity by 1"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    id="b2b-direct-quantity-input"
                    min={1}
                    max={currentAvailable > 0 ? currentAvailable : 9999}
                    value={quantityStr}
                    onChange={handleDirectInput}
                    className="w-20 text-center text-lg font-black text-[#111827] font-mono tracking-wider bg-white border border-slate-200 rounded-lg py-1 focus:outline-none focus:border-[#E31B23]"
                  />
                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={quantityNum >= currentAvailable}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-[#FFF1F2] hover:text-[#E31B23] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Increase quantity by 1"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick:</span>
                {[5, 10, 25, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSetPreset(preset)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                      quantityNum === preset
                        ? 'bg-[#E31B23] text-white border-[#E31B23]'
                        : 'bg-slate-100 text-slate-700 hover:bg-[#FFF1F2] hover:text-[#E31B23] border-slate-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
                {currentAvailable > 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetPreset(currentAvailable)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ml-auto cursor-pointer ${
                      quantityNum === currentAvailable
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                    }`}
                    title="Set to max available stock"
                  >
                    Max ({currentAvailable})
                  </button>
                )}
              </div>

              {/* Real-time Validation Message */}
              {stockValidationMessage && (
                <div className="mt-2.5 p-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-semibold">{stockValidationMessage}</span>
                </div>
              )}
            </div>

            {/* Touch-Friendly Number Keypad */}
            <div className="mt-4 grid grid-cols-3 gap-2 px-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  id={`keypad-b2b-${num}`}
                  onClick={() => handleKeypadPress(num)}
                  className="py-2.5 bg-slate-100 hover:bg-[#FFF1F2] hover:text-[#E31B23] hover:border-red-200 active:bg-slate-300 text-slate-900 font-bold text-sm rounded-xl border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                >
                  {num}
                </button>
              ))}
              <button
                id="keypad-b2b-clear"
                onClick={() => handleKeypadPress('C')}
                className="py-2.5 bg-[#FFF1F2] hover:bg-red-100 text-[#E31B23] font-bold text-xs rounded-xl border border-red-200 transition-colors cursor-pointer"
              >
                C
              </button>
              <button
                id="keypad-b2b-0"
                onClick={() => handleKeypadPress('0')}
                className="py-2.5 bg-slate-100 hover:bg-[#FFF1F2] hover:text-[#E31B23] text-slate-900 font-bold text-sm rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                0
              </button>
              <button
                id="keypad-b2b-back"
                onClick={() => handleKeypadPress('BACK')}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                ⌫
              </button>
            </div>
          </div>

          <div className="pt-4 flex justify-center border-t border-slate-100 mt-3">
            <div className="w-7 h-7 rounded-full bg-[#FFF1F2] text-[#E31B23] border border-red-200 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* STEP 3: Review Order & Place Order (Columns 9-12) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#E31B23] text-white flex items-center justify-center text-xs font-black">
                  3
                </span>
                <h3 className="text-sm font-bold text-slate-900">Place Order</h3>
              </div>
            </div>

            {/* Institution / Customer Selection */}
            <div className="mt-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#E31B23]" />
                  <span>Customer / Institution</span>
                </label>
              </div>
              <select
                id="b2b-customer-select"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
              >
                {b2bCustomers.map((cust) => (
                  <option key={cust.id} value={cust.id}>
                    {cust.name} ({cust.organizationType})
                  </option>
                ))}
              </select>
            </div>

            {/* Review Order Box */}
            <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Review Order
              </div>

              {/* Product preview line with ProductImage fallback */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                <div className="w-14 h-14 rounded-xl bg-white p-1.5 flex items-center justify-center border border-slate-200 flex-shrink-0 shadow-2xs">
                  <ProductImage
                    src={selectedProduct.image}
                    category={selectedProduct.category}
                    name={selectedProduct.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h5 className="text-xs font-bold text-slate-900 truncate">
                      {selectedProduct.name}
                    </h5>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 font-semibold text-slate-600">
                      {selectedProduct.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 mt-1">
                    <span>₹ {(unitPrice ?? 0).toLocaleString('en-IN')} × {quantityNum}</span>
                    <span className="font-bold text-slate-900">₹ {(subtotal ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Calculations */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹ {(subtotal ?? 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>GST ({gstRate}%)</span>
                  <span className="font-semibold text-slate-900">₹ {(gstAmount ?? 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-black text-[#E31B23] text-base">
                    ₹ {(total ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Error banner if any */}
            {errorMessage && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Large Brand Red PLACE ORDER button with disabled state when quantity invalid */}
            <div className="mt-5">
              <button
                id="btn-place-b2b-order"
                onClick={handlePlaceOrder}
                disabled={isInvalidQuantity}
                className={`w-full py-3.5 font-black text-sm uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                  isInvalidQuantity
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-[#E31B23] hover:bg-[#B5121B] active:bg-red-900 text-white shadow-red-700/20 cursor-pointer active:scale-[0.98]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>PLACE ORDER</span>
              </button>
            </div>
          </div>

          <div className="pt-4 flex justify-center border-t border-slate-100 mt-3">
            <div className="w-7 h-7 rounded-full bg-[#FFF1F2] text-[#E31B23] border border-red-200 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Highlights Matching Reference Image */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FFF1F2] text-[#E31B23] flex items-center justify-center flex-shrink-0">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Your Price</p>
              <p className="text-[11px] text-slate-500">Auto applied</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FFF1F2] text-[#E31B23] flex items-center justify-center flex-shrink-0">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Live Available</p>
              <p className="text-[11px] text-slate-500">Real-time stock</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FFF1F2] text-[#E31B23] flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">3 Clicks</p>
              <p className="text-[11px] text-slate-500">From select to order</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Order Confirmed</p>
              <p className="text-[11px] text-slate-500">Instantly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal upon Placing Order */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900 text-center">
              Order Confirmed Successfully!
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              Stock has been atomically reserved & locked in the ERP ledger.
            </p>

            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-bold text-[#E31B23] font-mono">{orderSuccess.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Institution:</span>
                <span className="font-bold text-slate-900">{orderSuccess.organizationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Amount:</span>
                <span className="font-black text-[#E31B23] text-sm">
                  ₹ {(orderSuccess.total ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice:</span>
                <span className="font-bold text-slate-900 font-mono">{orderSuccess.invoiceId}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setOrderSuccess(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Create Another Order
              </button>
              <button
                onClick={() => {
                  setOrderSuccess(null);
                  setActiveTab('invoices');
                }}
                className="flex-1 py-2.5 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>View Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
