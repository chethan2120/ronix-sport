import React, { useState, useMemo } from 'react';
import {
  Search,
  Store,
  Package,
  X,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Tag,
  Check,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { ProductImage } from '../ProductImage';
import { ProductDetailPage } from './ProductDetailPage';
import { getTypesForCategory } from '../../data/productTypes';

interface CustomerStorefrontProps {
  onBackToCRM?: () => void;
}

export const CustomerStorefront: React.FC<CustomerStorefrontProps> = () => {
  const { products = [], categories: storeCategories = [], inventory = {} } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Gear');
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [typeSearchQuery, setTypeSearchQuery] = useState('');

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

  // 3. Category Select Handler (Resets product types on category change)
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

  // 4. Combined Filtering Logic
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

      {/* 2. Subcategory / Product Type Filter */}
      {availableProductTypes.length > 0 && (
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

          {/* Type search input if list is long */}
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

        {/* Inputs */}
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

        {/* Quick Price Preset Pills */}
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
      {/* 1. Storefront Module Header */}
      <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[#111827] flex items-center gap-2">
            <Store className="w-5 h-5 text-[#E31B23]" />
            <span>CUSTOMER STOREFRONT</span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Browse and filter products available in the customer catalog.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-[#E31B23] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-[#E31B23] text-[10px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Product Count Pill */}
          <div className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
            Showing <span className="text-[#E31B23] font-black">{filteredProducts.length}</span> of {products.length} Products
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout (Desktop Sidebar + Main Grid Area) */}
      <div className="flex flex-col md:flex-row gap-5 items-start">
        {/* Left Filter Sidebar (Desktop) */}
        <aside className="hidden md:block w-64 lg:w-72 shrink-0 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs sticky top-4">
          {renderFilterControls()}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full space-y-4">
          {/* Search Bar & Active Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="relative">
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

            {/* Active Filter Tags */}
            {activeFiltersCount > 0 && (
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

          {/* Product Cards Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const inv = inventory[product.id] || { onHand: 0, reserved: 0, available: 0 };
                const availableStock = Math.max(0, (inv.onHand || 0) - (inv.reserved || 0));
                const isOutOfStock = availableStock <= 0;
                const isLowStock = availableStock > 0 && availableStock <= (product.minStockLevel || 10);

                return (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all cursor-pointer group hover:border-red-200"
                  >
                    <div className="space-y-3">
                      {/* Product Image Box */}
                      <div className="w-full h-44 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-2 relative">
                        <ProductImage src={product.image} category={product.category} name={product.name} product={product} />

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

                        {/* Subcategory Tag Badge if available */}
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
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mt-0.5 group-hover:text-[#E31B23] transition-colors">
                          {product.name}
                        </h3>
                      </div>
                    </div>

                    {/* Footer Pricing & Availability */}
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Price</span>
                        <span className="text-base font-black text-slate-900">
                          ₹{product.retailPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Available</span>
                        <span className={`text-xs font-bold ${isOutOfStock ? 'text-red-600' : 'text-slate-700'}`}>
                          {availableStock} units
                        </span>
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
        </main>
      </div>

      {/* 3. Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
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

            {/* Controls Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {renderFilterControls()}
            </div>

            {/* Bottom Actions */}
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

      {/* Product Detail Modal Preview */}
      {selectedProduct && (
        <ProductDetailPage
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
          onAddToCart={() => {}}
          onBuyNow={() => {}}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />
      )}
    </div>
  );
};
