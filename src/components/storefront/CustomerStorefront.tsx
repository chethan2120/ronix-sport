import React, { useState, useMemo } from 'react';
import {
  Search,
  Store,
  Package,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { ProductImage } from '../ProductImage';
import { ProductDetailPage } from './ProductDetailPage';

interface CustomerStorefrontProps {
  onBackToCRM?: () => void;
}

export const CustomerStorefront: React.FC<CustomerStorefrontProps> = () => {
  const { products = [], categories: storeCategories = [], inventory = {} } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Gear');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Dynamic Categories list (Defaults + Custom + Active Products)
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

  // Combined Search & Category Filtering
  const filteredProducts = useMemo(() => {
    return (products || []).filter((prod) => {
      if (!prod) return false;
      const prodCat = (prod.category || '').toLowerCase();
      const selCat = selectedCategory.toLowerCase();

      let matchesCategory = false;
      if (selectedCategory === 'All Gear' || selectedCategory === 'All') {
        matchesCategory = true;
      } else if (selCat === 'cricket bats' && (prodCat === 'bats' || prodCat === 'cricket bats')) {
        matchesCategory = true;
      } else if (selCat === 'bats' && (prodCat === 'bats' || prodCat === 'cricket bats')) {
        matchesCategory = true;
      } else {
        matchesCategory = prodCat === selCat;
      }

      const matchesSearch =
        !searchQuery ||
        (prod.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.brand || '').toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Module Header */}
      <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[#111827] flex items-center gap-2">
            <Store className="w-5 h-5 text-[#E31B23]" />
            <span>CUSTOMER STOREFRONT</span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Browse and manage products available in the customer catalog.
          </p>
        </div>

        <div className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
          Showing <span className="text-[#E31B23] font-black">{filteredProducts.length}</span> of {products.length} Products
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, SKU, brand..."
            className="w-full pl-10 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E31B23] text-slate-800 font-medium"
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

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {allCategories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#E31B23] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-[#E31B23]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                    <ProductImage src={product.image} category={product.category} name={product.name} />
                    
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
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">B2C Price</span>
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
        /* 4. Clean Empty Category State */
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {selectedCategory === 'All Gear'
              ? 'No products available.'
              : `No products found in ${selectedCategory}.`}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are currently no products matching your selected category or search filter.
          </p>
          {selectedCategory !== 'All Gear' && (
            <button
              onClick={() => {
                setSelectedCategory('All Gear');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-[#E31B23] hover:bg-[#B5121B] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Show All Products
            </button>
          )}
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
