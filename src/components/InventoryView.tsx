import React, { useState, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import {
  Boxes,
  Plus,
  Minus,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  ArrowUpDown,
  History,
  ShieldCheck,
  Building2,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  RotateCcw,
  Sliders,
  Package,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, InventoryItem } from '../types';
import { ProductImage } from './ProductImage';

// Error Boundary to prevent any unhandled render exceptions from showing a white screen
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class InventoryErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('InventoryView ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-2xl p-8 border border-red-200 text-center space-y-4 my-6">
          <div className="w-12 h-12 rounded-full bg-red-100 text-[#E31B23] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Inventory Display Reset</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            A rendering issue was detected. The system has safely recovered.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-[#E31B23] text-white rounded-xl text-xs font-bold hover:bg-[#B5121B] transition-colors"
          >
            Reload Inventory View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface InventoryViewProps {
  onOpenAddProductModal?: () => void;
  onOpenAddStockModal?: (productId?: string) => void;
  onOpenRemoveStockModal?: (productId?: string) => void;
}

export const InventoryViewInner: React.FC<InventoryViewProps> = ({
  onOpenAddProductModal,
  onOpenAddStockModal,
  onOpenRemoveStockModal,
}) => {
  const {
    products = [],
    categories: storeCategories = [],
    inventory = {},
    inventoryLedger = [],
    warehouses = [],
    currentWarehouse,
    reserveStockAtomic,
    releaseStockReservation,
    isDemoMode,
    setActiveTab,
  } = useStore();

  const safeProducts = useMemo(() => (Array.isArray(products) ? products : []), [products]);
  const [selectedProductId, setSelectedProductId] = useState<string>(() => safeProducts[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<'All' | 'In Stock' | 'Low Stock' | 'Out of Stock'>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('All');

  // Keep selectedProductId in sync if safeProducts changes
  const activeProductId = safeProducts.some((p) => p?.id === selectedProductId)
    ? selectedProductId
    : safeProducts[0]?.id || '';

  const selectedProduct: Product | undefined = safeProducts.find((p) => p?.id === activeProductId) || safeProducts[0];
  const selectedInventory: InventoryItem = (selectedProduct && inventory?.[selectedProduct.id]) || {
    productId: selectedProduct?.id || '',
    onHand: 0,
    reserved: 0,
    available: 0,
    locationStock: {},
  };

  // Interactive Atomic Simulation State
  const [simBuyerAStatus, setSimBuyerAStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [simBuyerBStatus, setSimBuyerBStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [simFeedback, setSimFeedback] = useState<string>(
    'Live Atomic Lock Active. Test concurrent buyer reservations without race conditions.'
  );

  // Categories list
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    (storeCategories || []).forEach((c) => map.set(c.toLowerCase(), c));
    safeProducts.forEach((p) => {
      if (p?.category) map.set(p.category.toLowerCase(), p.category);
    });
    return ['All', ...Array.from(map.values())];
  }, [storeCategories, safeProducts]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return safeProducts.filter((prod) => {
      if (!prod) return false;
      const matchesSearch =
        (prod.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.category || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;

      const inv = inventory?.[prod.id] || { onHand: 0, reserved: 0, available: 0 };
      const avail = Math.max(0, (inv.onHand || 0) - (inv.reserved || 0));
      const isOut = avail <= 0;
      const isLow = avail > 0 && avail <= (prod.minStockLevel || 15);
      const isIn = avail > (prod.minStockLevel || 15);

      let matchesStatus = true;
      if (stockStatusFilter === 'In Stock') matchesStatus = isIn;
      else if (stockStatusFilter === 'Low Stock') matchesStatus = isLow;
      else if (stockStatusFilter === 'Out of Stock') matchesStatus = isOut;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [safeProducts, inventory, searchQuery, selectedCategory, stockStatusFilter]);

  // Global KPIs calculated from safe data
  const totalItemsCount = safeProducts.length;
  const totalOnHand = useMemo(() => {
    return Object.values(inventory || {}).reduce((sum: number, item: any) => sum + (item?.onHand || 0), 0);
  }, [inventory]);
  const totalReserved = useMemo(() => {
    return Object.values(inventory || {}).reduce((sum: number, item: any) => sum + (item?.reserved || 0), 0);
  }, [inventory]);
  const totalAvailable = Math.max(0, totalOnHand - totalReserved);

  // Handlers for atomic simulation
  const handleSimulateBuyerA = () => {
    if (!selectedProduct) return;
    const res = reserveStockAtomic(selectedProduct.id, 50, 'SIM-BUYER-A');
    if (res.success) {
      setSimBuyerAStatus('success');
      setSimFeedback(`Buyer A successfully locked 50 units. Reserved updated immediately.`);
    } else {
      setSimBuyerAStatus('failed');
      setSimFeedback(`Buyer A failed: ${res.error || 'Insufficient stock'}`);
    }
  };

  const handleSimulateBuyerB = () => {
    if (!selectedProduct) return;
    const res = reserveStockAtomic(selectedProduct.id, 50, 'SIM-BUYER-B');
    if (res.success) {
      setSimBuyerBStatus('success');
      setSimFeedback(`Buyer B successfully secured 50 units.`);
    } else {
      setSimBuyerBStatus('failed');
      setSimFeedback(`Buyer B blocked: Insufficient stock available. Atomic lock protected against overselling.`);
    }
  };

  const handleResetSimReservations = () => {
    if (!selectedProduct) return;
    releaseStockReservation(selectedProduct.id, 100, 'RESET-SIM');
    setSimBuyerAStatus('idle');
    setSimBuyerBStatus('idle');
    setSimFeedback('All simulation locks cleared. Normal stock state restored.');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Header with Title, Description, and Core Action Buttons */}
      <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[#111827] flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#E31B23]" />
            <span>INVENTORY</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FFF1F2] text-[#E31B23] border border-red-200 px-2 py-0.5 rounded-full">
              Multi-Warehouse
            </span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Manage product stock and availability. Real-time atomic reservations across warehouses.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenAddStockModal && (
            <button
              id="btn-inventory-adjust-stock"
              onClick={() => onOpenAddStockModal(selectedProduct?.id)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Adjust Stock</span>
            </button>
          )}

          {onOpenAddProductModal && (
            <button
              id="btn-inventory-add-product"
              onClick={onOpenAddProductModal}
              className="px-3.5 py-2 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Summary KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total SKUs</span>
          <span className="text-lg font-black text-slate-900 mt-0.5 block">{totalItemsCount}</span>
          <span className="text-[10px] text-slate-500 font-medium">Catalog items</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Physical On Hand</span>
          <span className="text-lg font-black text-slate-900 mt-0.5 block">{totalOnHand.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-slate-500 font-medium">In warehouse bins</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reserved Units</span>
          <span className="text-lg font-black text-[#E31B23] mt-0.5 block">{totalReserved.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-slate-500 font-medium">Locked for B2B orders</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sellable Available</span>
          <span className="text-lg font-black text-emerald-600 mt-0.5 block">{totalAvailable.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-emerald-700 font-medium">Ready for immediate checkout</span>
        </div>
      </div>

      {/* 3. Search and Filtering Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="inventory-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, SKU, or category..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/30 focus:border-[#E31B23]"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/30"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
          {/* Status Filter Buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold">
            {(['All', 'In Stock', 'Low Stock', 'Out of Stock'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStockStatusFilter(status)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  stockStatusFilter === status
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#E31B23] shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-[#E31B23] shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Inventory Data: Table or Grid View */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
          <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-200">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No inventory products found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'All' || stockStatusFilter !== 'All'
              ? 'No products match your active search and filter criteria.'
              : !isDemoMode
              ? 'Demo Mode is currently OFF. You can turn on Demo Mode in Settings or add real products to your catalog.'
              : 'There are currently no products registered in the inventory system.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            {onOpenAddProductModal && (
              <button
                onClick={onOpenAddProductModal}
                className="px-4 py-2 bg-[#E31B23] hover:bg-[#B5121B] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                + Add Product
              </button>
            )}
            {!isDemoMode && (
              <button
                onClick={() => setActiveTab('settings')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Open Settings
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Retail / B2B Price</th>
                  <th className="py-3 px-3 text-right">On Hand</th>
                  <th className="py-3 px-3 text-right">Reserved</th>
                  <th className="py-3 px-3 text-right">Available</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((prod) => {
                  const inv = inventory?.[prod.id] || { onHand: 0, reserved: 0, available: 0 };
                  const available = Math.max(0, (inv.onHand || 0) - (inv.reserved || 0));
                  const isOutOfStock = available <= 0;
                  const isLowStock = available > 0 && available <= (prod.minStockLevel || 15);
                  const isSelected = selectedProduct?.id === prod.id;

                  return (
                    <tr
                      key={prod.id}
                      onClick={() => setSelectedProductId(prod.id)}
                      className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                        isSelected ? 'bg-red-50/30' : ''
                      }`}
                    >
                      {/* Product Name & Brand */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                            <ProductImage
                              src={prod.image}
                              alt={prod.name}
                              category={prod.category}
                              name={prod.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">{prod.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{prod.brand}</span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700">{prod.sku}</td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {prod.category}
                        </span>
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-3 text-right">
                        <span className="font-black text-slate-900 block">
                          ₹{(prod.retailPrice ?? 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-[#E31B23] font-bold block">
                          B2B: ₹{(prod.b2bPrice ?? 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* On Hand */}
                      <td className="py-3 px-3 text-right font-bold text-slate-800">
                        {(inv.onHand || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Reserved */}
                      <td className="py-3 px-3 text-right font-bold text-[#E31B23]">
                        {(inv.reserved || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Available */}
                      <td className="py-3 px-3 text-right font-black text-emerald-700">
                        {available.toLocaleString('en-IN')}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>Out of Stock</span>
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Low ({available})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>In Stock</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {onOpenAddStockModal && (
                            <button
                              onClick={() => onOpenAddStockModal(prod.id)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-[#FFF1F2] hover:text-[#E31B23] text-slate-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer border border-slate-200"
                              title="Adjust Stock"
                            >
                              Adjust
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((prod) => {
            const inv = inventory?.[prod.id] || { onHand: 0, reserved: 0, available: 0 };
            const available = Math.max(0, (inv.onHand || 0) - (inv.reserved || 0));
            const isOutOfStock = available <= 0;
            const isLowStock = available > 0 && available <= (prod.minStockLevel || 15);

            return (
              <div
                key={prod.id}
                onClick={() => setSelectedProductId(prod.id)}
                className={`bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer ${
                  selectedProduct?.id === prod.id ? 'border-[#E31B23] ring-2 ring-[#E31B23]/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="relative aspect-square w-full bg-white p-4 flex items-center justify-center border-b border-slate-100">
                    <ProductImage
                      src={prod.image}
                      alt={prod.name}
                      category={prod.category}
                      name={prod.name}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-300">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                          Low: {available}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Avail: {available}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{prod.brand}</span>
                      <span className="font-mono">{prod.sku}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{prod.name}</h4>
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-xs font-black text-slate-900">
                          ₹{(prod.retailPrice ?? 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-[#E31B23] font-bold block">
                          B2B: ₹{(prod.b2bPrice ?? 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right text-[10px] text-slate-500">
                        <span>On Hand: {inv.onHand || 0}</span>
                        <span className="block text-[#E31B23]">Rsv: {inv.reserved || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {onOpenAddStockModal && (
                    <button
                      onClick={() => onOpenAddStockModal(prod.id)}
                      className="w-full py-1.5 bg-white hover:bg-[#FFF1F2] hover:text-[#E31B23] text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors"
                    >
                      Adjust Stock
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Selected Product Multi-Warehouse Breakdown & Atomic Simulation Section */}
      {selectedProduct && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-6">
          {/* Left: Selected Product Multi-Warehouse Allocation */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                  <ProductImage
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    category={selectedProduct.category}
                    name={selectedProduct.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900">{selectedProduct.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">SKU: {selectedProduct.sku}</p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                {selectedProduct.category}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Multi-Warehouse Distribution
              </span>
              <div className="space-y-2">
                {warehouses.map((wh) => {
                  const locStock = selectedInventory.locationStock?.[wh.id] ?? (wh.isDefault ? selectedInventory.onHand : 0);
                  return (
                    <div
                      key={wh.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <div>
                          <span className="font-bold text-slate-800 block">{wh.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{wh.code}</span>
                        </div>
                      </div>
                      <span className="font-black text-slate-900">{locStock} units</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Atomic Stock Reservation Engine Simulator */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#E31B23]" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  Atomic Stock Reservation Engine
                </h3>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                Active Guard
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              When B2B buyers place institutional orders or customers buy from storefront, inventory is reserved atomically.
              Zero race conditions, negative stock, or overselling.
            </p>

            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">On Hand</span>
                <span className="text-sm font-black text-slate-900">{selectedInventory.onHand || 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#E31B23] font-bold block">Reserved</span>
                <span className="text-sm font-black text-[#E31B23]">{selectedInventory.reserved || 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-600 font-bold block">Available</span>
                <span className="text-sm font-black text-emerald-600">
                  {Math.max(0, (selectedInventory.onHand || 0) - (selectedInventory.reserved || 0))}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-900 text-white rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>SIMULATION FEEDBACK</span>
                <button
                  onClick={handleResetSimReservations}
                  className="text-[10px] text-[#E31B23] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Simulation</span>
                </button>
              </div>
              <p className="font-mono text-[11px] text-slate-300">{simFeedback}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSimulateBuyerA}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Buyer A (Reserve 50)
              </button>
              <button
                onClick={handleSimulateBuyerB}
                className="flex-1 py-2 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Buyer B (Reserve 50)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const InventoryView: React.FC<InventoryViewProps> = (props) => {
  return (
    <InventoryErrorBoundary>
      <InventoryViewInner {...props} />
    </InventoryErrorBoundary>
  );
};
