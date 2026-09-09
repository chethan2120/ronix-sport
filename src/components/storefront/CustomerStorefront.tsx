import React, { useState, useMemo } from 'react';
import {
  Search,
  Package,
  X,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Tag,
  Check,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  MapPin,
  User as UserIcon,
  Phone,
  Mail,
  ChevronRight,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Product, CustomerOrder } from '../../types';
import { ProductImage } from '../ProductImage';
import { ProductDetailPage } from './ProductDetailPage';
import { getTypesForCategory } from '../../data/productTypes';

interface CustomerStorefrontProps {
  onBackToCRM?: () => void;
}

export const CustomerStorefront: React.FC<CustomerStorefrontProps> = () => {
  const {
    products = [],
    categories: storeCategories = [],
    inventory = {},
    customerOrders = [],
    placeCustomerOrder,
  } = useStore();

  const { profile } = useAuth();

  // Navigation & View tabs
  const [storeTab, setStoreTab] = useState<'catalog' | 'my-orders'>('catalog');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Gear');
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [typeSearchQuery, setTypeSearchQuery] = useState('');

  // Cart & Order State
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [cardQuantities, setCardQuantities] = useState<Record<string, number>>({});
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<CustomerOrder | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [selectedMyOrder, setSelectedMyOrder] = useState<CustomerOrder | null>(null);

  // 1. Dynamic Categories list (Defaults + Store Categories + Product Categories)
  const allCategories = useMemo(() => {
    const map = new Map<string, string>();
    (storeCategories || []).forEach((c) => {
      if (c) map.set(c.toLowerCase(), c);
    });
    (products || []).forEach((p) => {
      if (p?.category) map.set(p.category.toLowerCase(), p.category);
    });
    return ['All Gear', ...Array.from(map.values())];
  }, [storeCategories, products]);

  // 2. Dynamic Available Product Types for the selected Category scope
  const availableProductTypes = useMemo(() => {
    const predefined = getTypesForCategory(selectedCategory);
    const typesSet = new Set<string>(predefined);

    // Include any custom productTypes attached to products in this category
    (products || []).forEach((p) => {
      if (!p?.productType) return;
      const prodCat = (p.category || '').toLowerCase();
      const selCat = selectedCategory.toLowerCase();

      if (selectedCategory === 'All Gear' || selectedCategory === 'All') {
        typesSet.add(p.productType);
      } else if (
        prodCat === selCat ||
        ((selCat === 'cricket bats' || selCat === 'bats') && (prodCat === 'bats' || prodCat === 'cricket bats'))
      ) {
        typesSet.add(p.productType);
      }
    });

    return Array.from(typesSet);
  }, [selectedCategory, products]);

  // Filter types list by local subcategory search if any
  const filteredAvailableTypes = useMemo(() => {
    if (!typeSearchQuery.trim()) return availableProductTypes;
    return availableProductTypes.filter((t) =>
      t.toLowerCase().includes(typeSearchQuery.toLowerCase())
    );
  }, [availableProductTypes, typeSearchQuery]);

  // Product Counts per Category (for sidebar badges)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All Gear': products.length };
    products.forEach((p) => {
      if (!p?.category) return;
      const catKey = p.category;
      counts[catKey] = (counts[catKey] || 0) + 1;
      // Handle alias matching count
      if (p.category.toLowerCase() === 'bats' || p.category.toLowerCase() === 'cricket bats') {
        counts['Cricket Bats'] = (counts['Cricket Bats'] || 0) + 1;
        counts['Bats'] = (counts['Bats'] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  // Product Counts per Product Type / Subcategory
  const productTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      if (!p?.productType) return;
      counts[p.productType] = (counts[p.productType] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Category Select Handler (Resets product types on category change)
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedProductTypes([]);
    setTypeSearchQuery('');
  };

  // Toggle Subcategory Checkbox
  const toggleProductType = (type: string) => {
    setSelectedProductTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Quick Price Presets
  const applyPricePreset = (min: string, max: string) => {
    setPriceMin(min);
    setPriceMax(max);
  };

  // Reset All Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Gear');
    setSelectedProductTypes([]);
    setPriceMin('');
    setPriceMax('');
    setStockFilter('all');
    setTypeSearchQuery('');
  };

  // Calculate Active Filters Count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'All Gear') count++;
    if (selectedProductTypes.length > 0) count += selectedProductTypes.length;
    if (priceMin !== '') count++;
    if (priceMax !== '') count++;
    if (stockFilter !== 'all') count++;
    if (searchQuery.trim() !== '') count++;
    return count;
  }, [selectedCategory, selectedProductTypes, priceMin, priceMax, stockFilter, searchQuery]);

  // Combined Filtering Logic
  const filteredProducts = useMemo(() => {
    return (products || []).filter((prod) => {
      if (!prod) return false;
      const prodCat = (prod.category || '').toLowerCase();
      const selCat = selectedCategory.toLowerCase();

      // Category check
      let matchesCategory = false;
      if (selectedCategory === 'All Gear' || selectedCategory === 'All') {
        matchesCategory = true;
      } else if ((selCat === 'cricket bats' || selCat === 'bats') && (prodCat === 'bats' || prodCat === 'cricket bats')) {
        matchesCategory = true;
      } else {
        matchesCategory = prodCat === selCat;
      }
      if (!matchesCategory) return false;

      // Product Type / Subcategory check
      if (selectedProductTypes.length > 0) {
        if (!prod.productType || !selectedProductTypes.includes(prod.productType)) {
          return false;
        }
      }

      // Search query check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          (prod.name || '').toLowerCase().includes(q) ||
          (prod.sku || '').toLowerCase().includes(q) ||
          (prod.category || '').toLowerCase().includes(q) ||
          (prod.productType || '').toLowerCase().includes(q) ||
          (prod.brand || '').toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Price filter check
      const price = prod.retailPrice || 0;
      if (priceMin !== '' && price < Number(priceMin)) return false;
      if (priceMax !== '' && price > Number(priceMax)) return false;

      // Stock filter check
      const inv = inventory[prod.id] || { onHand: 0, reserved: 0, available: 0 };
      const availableStock = Math.max(0, (inv.onHand || 0) - (inv.reserved || 0));

      if (stockFilter === 'in_stock' && availableStock <= 0) return false;
      if (stockFilter === 'low_stock' && (availableStock <= 0 || availableStock > (prod.minStockLevel || 10))) return false;
      if (stockFilter === 'out_of_stock' && availableStock > 0) return false;

      return true;
    });
  }, [products, selectedCategory, selectedProductTypes, searchQuery, priceMin, priceMax, stockFilter, inventory]);

  // Cart Calculations
  const cartTotalItemsCount = useMemo(() => {
    return Object.values(cartItems).reduce((sum, q) => sum + q, 0);
  }, [cartItems]);

  const cartSubtotal = useMemo(() => {
    return Object.entries(cartItems).reduce((sum, [prodId, qty]) => {
      const p = products.find((prod) => prod.id === prodId);
      return sum + (p ? p.retailPrice * qty : 0);
    }, 0);
  }, [cartItems, products]);

  // Quantity Picker Handlers for Card
  const getCardQty = (productId: string) => cardQuantities[productId] || 1;

  const setCardQty = (productId: string, qty: number, maxStock: number) => {
    const validQty = Math.max(1, Math.min(qty, maxStock));
    setCardQuantities((prev) => ({ ...prev, [productId]: validQty }));
  };

  const handleAddToCart = (product: Product, maxStock: number) => {
    const qtyToAdd = getCardQty(product.id);
    if (maxStock <= 0) return;

    setCartItems((prev) => {
      const currentInCart = prev[product.id] || 0;
      const newQty = Math.min(maxStock, currentInCart + qtyToAdd);
      return { ...prev, [product.id]: newQty };
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  const updateCartItemQty = (productId: string, delta: number, maxStock: number) => {
    setCartItems((prev) => {
      const current = prev[productId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: Math.min(maxStock, next) };
    });
  };

  // Place Order Action
  const handlePlaceOrder = () => {
    setOrderError(null);

    const itemsList = Object.entries(cartItems).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    if (itemsList.length === 0) {
      setOrderError('Your order is empty. Please add items.');
      return;
    }

    const customerId = profile?.id || 'guest-customer';
    const customerName = profile?.full_name || 'Customer';
    const customerEmail = profile?.email || 'customer@ronixsports.com';
    const customerPhone = profile?.phone || '';

    const result = placeCustomerOrder({
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items: itemsList,
    });

    if (result.success && result.order) {
      setCartItems({});
      setIsOrderDrawerOpen(false);
      setOrderSuccess(result.order);
    } else {
      setOrderError(result.error || 'Failed to place order.');
    }
  };

  // Filter My Orders for current user profile
  const myUserOrders = useMemo(() => {
    if (!profile) return customerOrders;
    if (profile.role === 'admin') return customerOrders;
    return customerOrders.filter(
      (o) => o.customerId === profile.id || o.customerEmail === profile.email
    );
  }, [customerOrders, profile]);

  // Reusable Filter Sidebar Content
  const renderFilterControls = () => (
    <div className="space-y-6">
      {/* Sidebar Header & Clear All */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-[#E31B23]" />
          <span>Filter Products</span>
        </h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={handleResetFilters}
            className="text-[11px] font-bold text-[#E31B23] hover:text-[#B5121B] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All ({activeFiltersCount})</span>
          </button>
        )}
      </div>

      {/* 1. Category Selection */}
      <div className="space-y-2.5">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Category
        </label>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
          {allCategories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            const count = categoryCounts[cat] || (cat === 'All Gear' ? products.length : 0);
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#E31B23] text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-red-50 hover:text-[#E31B23]'
                }`}
              >
                <span className="truncate">{cat}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
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

      {/* 2. Subcategory / Product Type Filter (Shown only when a specific category is selected) */}
      {selectedCategory !== 'All Gear' && availableProductTypes.length > 0 && (
        <div className="space-y-2.5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
              <Tag className="w-3 h-3 text-[#E31B23]" />
              <span>Product Type / Variant</span>
            </label>
            {selectedProductTypes.length > 0 && (
              <button
                onClick={() => setSelectedProductTypes([])}
                className="text-[10px] font-bold text-slate-400 hover:text-[#E31B23] cursor-pointer"
              >
                Clear ({selectedProductTypes.length})
              </button>
            )}
          </div>

          {availableProductTypes.length > 5 && (
            <div className="relative">
              <input
                type="text"
                value={typeSearchQuery}
                onChange={(e) => setTypeSearchQuery(e.target.value)}
                placeholder="Filter types..."
                className="w-full pl-7 pr-3 py-1 text-[11px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E31B23]"
              />
              <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          )}

          <div className="space-y-1 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
            {filteredAvailableTypes.map((type) => {
              const isChecked = selectedProductTypes.includes(type);
              const count = productTypeCounts[type];
              return (
                <label
                  key={type}
                  onClick={() => toggleProductType(type)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer select-none transition-colors ${
                    isChecked
                      ? 'bg-red-50 text-[#E31B23]'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-[#E31B23] border-[#E31B23] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{type}</span>
                  </div>
                  {count !== undefined && (
                    <span className="text-[10px] text-slate-400 font-mono">({count})</span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Price Filter */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Price Range (₹)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-400 font-medium block mb-1">Min Price</span>
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="0"
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium block mb-1">Max Price</span>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="Max"
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { label: '< ₹500', min: '', max: '500' },
            { label: '₹500-2k', min: '500', max: '2000' },
            { label: '₹2k-5k', min: '2000', max: '5000' },
            { label: '> ₹5k', min: '5000', max: '' },
          ].map((preset) => {
            const isSelected = priceMin === preset.min && priceMax === preset.max;
            return (
              <button
                key={preset.label}
                onClick={() => applyPricePreset(preset.min, preset.max)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#E31B23] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Stock Availability Filter */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Stock Availability
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'in_stock', label: 'In Stock' },
            { id: 'low_stock', label: 'Low Stock' },
            { id: 'out_of_stock', label: 'Out of Stock' },
          ].map((item) => {
            const isActive = stockFilter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setStockFilter(item.id as any)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. CUSTOMER SHOPPING PROMO STRIP (Height 150-190px, Red/White/Dark Theme, Product-Only Visual) */}
      {storeTab === 'catalog' && (
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-[#1E293B] to-[#0F172A] rounded-2xl p-5 sm:p-6 text-white shadow-xs border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 min-h-[150px] sm:min-h-[170px]">
          {/* Subtle Red Accent diagonal stripe & Glow */}
          <div className="absolute top-0 right-0 w-96 h-full bg-[#E31B23]/10 -skew-x-12 transform translate-x-16 pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#E31B23]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Left Text & Action Buttons */}
          <div className="space-y-3 z-10 max-w-xl text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#E31B23] text-white font-black text-[10px] uppercase tracking-widest">
              RONIX STOREFRONT
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                GEAR UP FOR THE GAME
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
                Professional sports equipment for every level.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
              <button
                onClick={() => handleCategoryChange('Cricket Bats')}
                className="px-4 py-2 bg-[#E31B23] hover:bg-[#B5121B] text-white rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Shop Cricket</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleResetFilters()}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Explore All Gear
              </button>
            </div>
          </div>

          {/* Right Visual: Product-Only Equipment Graphic */}
          <div className="hidden md:flex items-center justify-center relative shrink-0 z-10 w-44 h-28 bg-white/5 backdrop-blur-xs rounded-xl border border-white/10 p-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-16 h-20 relative">
                <ProductImage category="Bats" name="Cricket Bat" />
              </div>
              <div className="w-12 h-12 relative">
                <ProductImage category="Balls" name="Cricket Ball" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Two-Column Layout */}
      <div className="flex flex-col md:flex-row gap-5 items-start">
        {/* Left Filter Sidebar (Desktop) */}
        {storeTab === 'catalog' && (
          <aside className="hidden md:block w-64 lg:w-72 shrink-0 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs sticky top-4">
            {renderFilterControls()}
          </aside>
        )}

        {/* Main Workspace Area */}
        <main className="flex-1 w-full space-y-4">
          {/* Top Bar: Search + Filter Toggle + My Order + My Orders Tab */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products by title, SKU, brand, or product type..."
                  className="w-full pl-10 pr-8 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E31B23] text-slate-800 font-medium"
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

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                {/* Mobile Filter Button */}
                {storeTab === 'catalog' && (
                  <button
                    onClick={() => setMobileFilterOpen(true)}
                    className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-[#E31B23]" />
                    <span>Filters</span>
                    {activeFiltersCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#E31B23] text-white text-[10px] font-black flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Navigation Tabs: Catalog vs My Orders */}
                <button
                  onClick={() => setStoreTab(storeTab === 'catalog' ? 'my-orders' : 'catalog')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    storeTab === 'my-orders'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>My Orders ({myUserOrders.length})</span>
                </button>

                {/* My Order Cart Trigger */}
                <button
                  onClick={() => setIsOrderDrawerOpen(true)}
                  className="px-3.5 py-2 bg-[#E31B23] hover:bg-[#B5121B] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 min-h-[40px]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>My Order</span>
                  <span className="w-5 h-5 rounded-full bg-white text-[#E31B23] text-[11px] font-black flex items-center justify-center">
                    {cartTotalItemsCount}
                  </span>
                </button>
              </div>
            </div>

            {/* Active Filter Tags */}
            {storeTab === 'catalog' && activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Active Filters:
                </span>

                {selectedCategory !== 'All Gear' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-[#E31B23] text-[11px] font-bold border border-red-100">
                    Category: {selectedCategory}
                    <button
                      onClick={() => handleCategoryChange('All Gear')}
                      className="hover:text-red-900 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedProductTypes.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200"
                  >
                    {type}
                    <button
                      onClick={() => toggleProductType(type)}
                      className="hover:text-slate-900 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {(priceMin !== '' || priceMax !== '') && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                    Price: ₹{priceMin || '0'} - ₹{priceMax || '∞'}
                    <button
                      onClick={() => {
                        setPriceMin('');
                        setPriceMax('');
                      }}
                      className="hover:text-amber-950 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {stockFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-bold">
                    Stock: {stockFilter.replace('_', ' ')}
                    <button
                      onClick={() => setStockFilter('all')}
                      className="hover:text-slate-300 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={handleResetFilters}
                  className="text-[11px] font-bold text-[#E31B23] underline hover:text-[#B5121B] cursor-pointer ml-1"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* MAIN TAB 1: PRODUCT CATALOG GRID */}
          {storeTab === 'catalog' && (
            <>
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => {
                    const inv = inventory[product.id] || { onHand: 0, reserved: 0, available: 0 };
                    const availableStock = Math.max(0, (inv.onHand || 0) - (inv.reserved || 0));
                    const isOutOfStock = availableStock <= 0;
                    const isLowStock = availableStock > 0 && availableStock <= (product.minStockLevel || 10);

                    const cardQty = getCardQty(product.id);
                    const isExceedingStock = cardQty > availableStock;

                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all group hover:border-red-200"
                      >
                        <div className="space-y-3">
                          {/* Product Image Box */}
                          <div
                            onClick={() => setSelectedProduct(product)}
                            className="w-full h-44 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-2 relative cursor-pointer"
                          >
                            <ProductImage
                              src={product.image}
                              category={product.category}
                              name={product.name}
                              product={product}
                            />

                            {/* Stock Status Badge */}
                            <div className="absolute top-2 right-2">
                              {isOutOfStock ? (
                                <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-extrabold uppercase">
                                  Out of Stock
                                </span>
                              ) : isLowStock ? (
                                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase">
                                  Low Stock
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                                  In Stock
                                </span>
                              )}
                            </div>

                            {/* Subcategory Tag Badge */}
                            {product.productType && (
                              <div className="absolute bottom-2 left-2">
                                <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold tracking-tight">
                                  {product.productType}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div>
                            <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-slate-400">
                              <span className="uppercase tracking-wider truncate">{product.category}</span>
                              <span className="font-mono text-slate-500">{product.sku}</span>
                            </div>
                            <h3
                              onClick={() => setSelectedProduct(product)}
                              className="text-sm font-bold text-slate-900 line-clamp-2 mt-0.5 group-hover:text-[#E31B23] transition-colors cursor-pointer"
                            >
                              {product.name}
                            </h3>
                          </div>
                        </div>

                        {/* Card Footer: Pricing, Stock & Add to Order Controls */}
                        <div className="pt-3 mt-3 border-t border-slate-100 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Price</span>
                              <span className="text-base font-black text-slate-900">
                                ₹{product.retailPrice.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Available Stock</span>
                              <span className={`text-xs font-bold ${isOutOfStock ? 'text-red-600' : 'text-slate-700'}`}>
                                {availableStock} units
                              </span>
                            </div>
                          </div>

                          {/* Quantity Selector & Add to Order Button */}
                          <div className="space-y-1.5">
                            {/* Stock Validation Error Message */}
                            {isExceedingStock && availableStock > 0 && (
                              <p className="text-[10px] font-extrabold text-red-600">
                                Only {availableStock} units available.
                              </p>
                            )}

                            <div className="flex items-center gap-2">
                              {/* Quantity Selector [-] Qty [+] */}
                              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 shrink-0">
                                <button
                                  type="button"
                                  disabled={isOutOfStock || cardQty <= 1}
                                  onClick={() => setCardQty(product.id, cardQty - 1, availableStock)}
                                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-8 text-center text-xs font-bold text-slate-900">
                                  {cardQty}
                                </span>
                                <button
                                  type="button"
                                  disabled={isOutOfStock || cardQty >= availableStock}
                                  onClick={() => setCardQty(product.id, cardQty + 1, availableStock)}
                                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Add to Order Button */}
                              <button
                                type="button"
                                disabled={isOutOfStock || isExceedingStock}
                                onClick={() => handleAddToCart(product, availableStock)}
                                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all min-h-[34px] cursor-pointer ${
                                  isOutOfStock
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : isExceedingStock
                                    ? 'bg-red-100 text-red-700 cursor-not-allowed'
                                    : 'bg-[#E31B23] hover:bg-[#B5121B] text-white shadow-2xs'
                                }`}
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Order'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Clean Empty State */
                <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center mx-auto">
                    <Package className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    No matching products found.
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try adjusting or resetting your filter criteria to see available products.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-[#E31B23] hover:bg-[#B5121B] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </>
          )}

          {/* MAIN TAB 2: MY ORDERS LIST */}
          {storeTab === 'my-orders' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#E31B23]" />
                    <span>My Order History</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Track status and details of your placed orders with Ronix Sports.
                  </p>
                </div>
                <button
                  onClick={() => setStoreTab('catalog')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>

              {myUserOrders.length > 0 ? (
                <div className="space-y-3">
                  {myUserOrders.map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => setSelectedMyOrder(ord)}
                      className="p-4 rounded-xl border border-slate-200 hover:border-red-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-slate-900 group-hover:text-[#E31B23] transition-colors">
                            {ord.orderNumber}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500 font-medium">{ord.date}</span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {ord.items.length} Item(s): {ord.items.map((i) => i.productName).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-sm font-black text-slate-900 block">
                            ₹{ord.total.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-block mt-0.5">
                            Payment: {ord.paymentStatus}
                          </span>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-xl text-xs font-extrabold uppercase ${
                            ord.status === 'New'
                              ? 'bg-blue-100 text-blue-800'
                              : ord.status === 'Confirmed' || ord.status === 'Processing'
                              ? 'bg-purple-100 text-purple-800'
                              : ord.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {ord.status}
                        </span>

                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#E31B23] transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center space-y-3">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-500">No orders placed yet.</p>
                  <button
                    onClick={() => setStoreTab('catalog')}
                    className="px-4 py-2 bg-[#E31B23] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 2. Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#E31B23]" />
                <h3 className="text-sm font-bold text-slate-900">Filter Catalog</h3>
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {renderFilterControls()}
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
              <button
                onClick={() => {
                  handleResetFilters();
                  setMobileFilterOpen(false);
                }}
                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-[#E31B23] hover:bg-[#B5121B] rounded-xl text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
              >
                Apply Filters ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MY ORDER Drawer (Cart & Place Order Summary) */}
      {isOrderDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOrderDrawerOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#E31B23]" />
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">MY ORDER</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Review items & place order</p>
                </div>
              </div>
              <button
                onClick={() => setIsOrderDrawerOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Banner */}
            {orderError && (
              <div className="bg-red-50 border-b border-red-200 p-3 px-5 text-xs text-red-700 font-bold flex items-center justify-between">
                <span>{orderError}</span>
                <button onClick={() => setOrderError(null)} className="cursor-pointer">
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
              {Object.keys(cartItems).length > 0 ? (
                <>
                  <div className="space-y-3">
                    {Object.entries(cartItems).map(([prodId, qty]) => {
                      const prod = products.find((p) => p.id === prodId);
                      if (!prod) return null;

                      const inv = inventory[prod.id] || { onHand: 0, reserved: 0, available: 0 };
                      const avail = Math.max(0, inv.onHand - inv.reserved);
                      const itemSubtotal = prod.retailPrice * qty;

                      return (
                        <div
                          key={prod.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50"
                        >
                          {/* Image */}
                          <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                            <ProductImage src={prod.image} category={prod.category} name={prod.name} product={prod} />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{prod.name}</h4>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {prod.sku} • ₹{prod.retailPrice.toLocaleString('en-IN')}
                            </p>

                            {/* Qty controls in drawer */}
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                                <button
                                  type="button"
                                  onClick={() => updateCartItemQty(prod.id, -1, avail)}
                                  className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-xs font-bold text-slate-900">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  disabled={qty >= avail}
                                  onClick={() => updateCartItemQty(prod.id, 1, avail)}
                                  className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                onClick={() => handleRemoveFromCart(prod.id)}
                                className="text-[10px] font-bold text-red-600 hover:text-red-800 cursor-pointer ml-1"
                              >
                                Remove
                              </button>
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-slate-900">
                              ₹{itemSubtotal.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium block">
                              {qty} × ₹{prod.retailPrice}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Customer Info Preview */}
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-[#E31B23]" />
                      <span>Customer Details</span>
                    </h4>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{profile?.full_name || 'Customer'}</span>
                        <span className="text-[10px] text-slate-500 font-normal">Logged In</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">{profile?.email || 'customer@ronixsports.com'}</p>
                      {profile?.phone && <p className="text-slate-500 text-[11px]">{profile.phone}</p>}
                    </div>

                    {/* Delivery Address (Optional / Simple) */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Delivery Address (Optional)
                      </label>
                      <textarea
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Enter delivery street address, city, pincode..."
                        rows={2}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Your order is empty</h4>
                  <p className="text-xs text-slate-500">
                    Add products from the storefront catalog to proceed.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Summary & Place Order */}
            {Object.keys(cartItems).length > 0 && (
              <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-600 uppercase text-xs">Subtotal</span>
                  <span className="font-black text-slate-900 text-base">
                    ₹{cartSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-800 font-medium text-center">
                  Order Now • Pay Later / Admin Processing (No online payment required)
                </div>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="w-full py-3 bg-[#E31B23] hover:bg-[#B5121B] text-white rounded-xl text-sm font-extrabold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>PLACE ORDER</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. GREEN ORDER SUCCESS MODAL */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-emerald-200 p-6 text-center space-y-5 animate-in zoom-in-95 duration-200 z-10">
            {/* Green Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-emerald-700 tracking-tight">
                ✓ ORDER PLACED SUCCESSFULLY
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Your order has been sent to Ronix Sports.
              </p>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 space-y-2 text-left text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Order Number:</span>
                <span className="font-mono font-black text-emerald-800 text-sm">
                  {orderSuccess.orderNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Total Amount:</span>
                <span className="font-black text-slate-900 text-sm">
                  ₹{orderSuccess.total.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Payment Status:</span>
                <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[10px] uppercase">
                  {orderSuccess.paymentStatus}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setOrderSuccess(null);
                  setStoreTab('my-orders');
                }}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                View My Orders
              </button>

              <button
                onClick={() => setOrderSuccess(null)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MY ORDER DETAIL MODAL */}
      {selectedMyOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setSelectedMyOrder(null)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar z-10">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="font-mono text-sm font-black text-slate-900">{selectedMyOrder.orderNumber}</span>
                <p className="text-xs text-slate-500">{selectedMyOrder.date}</p>
              </div>
              <button
                onClick={() => setSelectedMyOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Status</span>
                <span className="font-bold text-slate-800">{selectedMyOrder.status}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment</span>
                <span className="font-bold text-amber-700">{selectedMyOrder.paymentStatus}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ordered Items</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {selectedMyOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{item.productName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{item.sku} • {item.quantity} × ₹{item.unitPrice}</p>
                    </div>
                    <span className="font-black text-slate-900">₹{item.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-sm">
              <span className="font-bold text-slate-600">Total Order Amount</span>
              <span className="font-black text-slate-900 text-base">₹{selectedMyOrder.total.toLocaleString('en-IN')}</span>
            </div>

            <button
              onClick={() => setSelectedMyOrder(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Product Detail Modal Preview */}
      {selectedProduct && (
        <ProductDetailPage
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
          onAddToCart={() => {
            const inv = inventory[selectedProduct.id] || { onHand: 0, reserved: 0, available: 0 };
            const avail = Math.max(0, inv.onHand - inv.reserved);
            handleAddToCart(selectedProduct, avail);
          }}
          onBuyNow={() => {
            const inv = inventory[selectedProduct.id] || { onHand: 0, reserved: 0, available: 0 };
            const avail = Math.max(0, inv.onHand - inv.reserved);
            handleAddToCart(selectedProduct, avail);
            setIsOrderDrawerOpen(true);
          }}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />
      )}
    </div>
  );
};
