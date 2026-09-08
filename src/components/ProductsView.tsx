import React, { useState } from 'react';
import {
  Package,
  Search,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  Edit2,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Save,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { ProductImage } from './ProductImage';

interface ProductsViewProps {
  onOpenAddProductModal: () => void;
  onOpenAdjustStockModal?: (productId?: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  onOpenAddProductModal,
  onOpenAdjustStockModal,
}) => {
  const { products, inventory, updateProduct, categories = [], addCategory } = useStore();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Edit Modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Product>>({});
  const [editNewCategoryName, setEditNewCategoryName] = useState<string>('');
  const [editCategoryError, setEditCategoryError] = useState<string>('');

  const displayCategories = ['All', ...categories];

  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      prod.category.toLowerCase() === selectedCategory.toLowerCase() ||
      prod.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (selectedCategory === 'Cricket Bats' && prod.category === 'Bats');
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setEditFormData({
      name: prod.name,
      category: prod.category,
      retailPrice: prod.retailPrice,
      b2bPrice: prod.b2bPrice,
      minStockLevel: prod.minStockLevel,
      mrp: prod.mrp,
    });
    setEditNewCategoryName('');
    setEditCategoryError('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    let finalCategory = editFormData.category || editingProduct.category;
    if (editFormData.category === 'Others') {
      const trimmedCat = editNewCategoryName.trim();
      if (!trimmedCat) {
        setEditCategoryError('Please enter a category name.');
        return;
      }
      finalCategory = addCategory(trimmedCat);
    }

    updateProduct(editingProduct.id, {
      ...editFormData,
      category: finalCategory,
    });
    setEditingProduct(null);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[#111827] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#E31B23]" />
            <span>PRODUCT CATALOG & MASTER DATA</span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Manage SKUs, retail MSRPs, institutional contract rates, and inventory thresholds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle: [Table View] [Product Grid View] */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#E31B23] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#E31B23] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Product Grid View</span>
            </button>
          </div>

          <button
            id="btn-add-new-product"
            onClick={onOpenAddProductModal}
            className="px-4 py-2 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-2xl custom-scrollbar">
          {displayCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#E31B23] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-[#FFF1F2] hover:text-[#E31B23]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by SKU, title, brand..."
            className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E31B23] w-full sm:w-64"
          />
        </div>
      </div>

      {/* VIEW 1: TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Selling Price (Retail)</th>
                  <th className="py-3 px-3 text-right">B2B Price</th>
                  <th className="py-3 px-3 text-right">Available Stock</th>
                  <th className="py-3 px-3 text-right">Reserved Stock</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((prod) => {
                  const inv = inventory[prod.id] || { onHand: 0, reserved: 0, available: 0 };
                  const available = Math.max(0, inv.onHand - inv.reserved);
                  const isOutOfStock = available <= 0;
                  const isLowStock = available > 0 && available <= (prod.minStockLevel || 10);

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Product (thumbnail + name + brand) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 p-1.5 flex items-center justify-center border border-slate-200 shrink-0">
                            <ProductImage
                              src={prod.image}
                              alt={prod.name}
                              category={prod.category}
                              name={prod.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{prod.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{prod.brand}</p>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                        {prod.sku}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {prod.category}
                        </span>
                      </td>

                      {/* Selling Price (Retail) */}
                      <td className="py-3 px-3 text-right font-black text-slate-900">
                        ₹{(prod.retailPrice ?? 0).toLocaleString('en-IN')}
                      </td>

                      {/* B2B Price */}
                      <td className="py-3 px-3 text-right font-bold text-[#E31B23]">
                        ₹{(prod.b2bPrice ?? 0).toLocaleString('en-IN')}
                      </td>

                      {/* Available Stock */}
                      <td className="py-3 px-3 text-right font-black text-emerald-700">
                        {available.toLocaleString('en-IN')}
                      </td>

                      {/* Reserved Stock */}
                      <td className="py-3 px-3 text-right font-bold text-amber-600">
                        {(inv.reserved ?? 0).toLocaleString('en-IN')}
                      </td>

                      {/* Status (In Stock = Green, Low Stock = Amber, Out of Stock = Red) */}
                      <td className="py-3 px-3 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>Out of Stock</span>
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Low Stock ({available})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>In Stock</span>
                          </span>
                        )}
                      </td>

                      {/* Actions (Adjust Stock, Edit) */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenAdjustStockModal?.(prod.id)}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-[#E31B23] border border-red-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="Adjust Stock"
                          >
                            <Boxes className="w-3 h-3" />
                            <span>Adjust Stock</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
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
        /* VIEW 2: PRODUCT GRID VIEW (E-commerce Style Cards) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((prod) => {
            const inv = inventory[prod.id] || { onHand: 0, reserved: 0, available: 0 };
            const available = Math.max(0, inv.onHand - inv.reserved);
            const isOutOfStock = available <= 0;
            const isLowStock = available > 0 && available <= (prod.minStockLevel || 10);

            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-red-200 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Clean white image container (object-fit: contain, no awkward cropping) */}
                  <div className="relative aspect-square w-full bg-white p-5 flex items-center justify-center border-b border-slate-100">
                    <ProductImage
                      src={prod.image}
                      alt={prod.name}
                      category={prod.category}
                      name={prod.name}
                      className="w-full h-full object-contain"
                    />

                    {/* Stock status badge on image corner */}
                    <div className="absolute top-3 right-3">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-300">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                          Low Stock ({available})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                          In Stock ({available})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content Details */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-mono font-bold text-slate-500">{prod.sku}</span>
                        <span className="font-bold text-[#E31B23] uppercase text-[10px]">
                          {prod.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1" title={prod.name}>
                        {prod.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">{prod.brand}</p>
                    </div>

                    {/* Selling price & B2B price block */}
                    <div className="grid grid-cols-2 gap-2 bg-[#F8F9FA] p-2.5 rounded-xl border border-slate-200/80 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Selling (Retail)</span>
                        <span className="font-black text-slate-900">
                          ₹{(prod.retailPrice ?? 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#E31B23] block font-bold">B2B Base</span>
                        <span className="font-black text-[#E31B23]">
                          ₹{(prod.b2bPrice ?? 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Available Stock Info */}
                    <div className="flex items-center justify-between text-xs px-1">
                      <span className="text-slate-500 font-medium">Available Stock:</span>
                      <span className="font-black text-slate-900">
                        {available} units
                      </span>
                    </div>
                  </div>
                </div>

                {/* [Edit] & [Adjust Stock] buttons */}
                <div className="p-3 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(prod)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onOpenAdjustStockModal?.(prod.id)}
                    className="flex-1 py-2 rounded-xl bg-red-50 hover:bg-[#E31B23] text-[#E31B23] hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Boxes className="w-3.5 h-3.5" />
                    <span>Adjust Stock</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK EDIT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#E31B23]" />
                <h3 className="text-base font-black text-slate-900">Edit Product Master</h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 block">Category</label>
                    <button
                      type="button"
                      onClick={() => {
                        setEditFormData((prev) => ({ ...prev, category: 'Others' }));
                        setEditCategoryError('');
                      }}
                      className="text-[11px] font-bold text-[#E31B23] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Add Category</span>
                    </button>
                  </div>
                  <select
                    value={editFormData.category || ''}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, category: e.target.value });
                      setEditCategoryError('');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              {editFormData.category === 'Others' && (
                <div className="p-3 bg-red-50/60 border border-red-200 rounded-xl space-y-1 animate-in fade-in duration-150">
                  <label className="font-bold text-slate-800 block text-xs flex items-center gap-1">
                    <span>New Category Name</span>
                    <span className="text-[#E31B23]">*</span>
                  </label>
                  <input
                    type="text"
                    value={editNewCategoryName}
                    onChange={(e) => {
                      setEditNewCategoryName(e.target.value);
                      if (e.target.value.trim()) setEditCategoryError('');
                    }}
                    placeholder="e.g. Football, Badminton Rackets, Sports Shoes"
                    className={`w-full px-3 py-2 bg-white border ${
                      editCategoryError ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-[#E31B23]'
                    } rounded-xl font-medium text-xs focus:ring-2 focus:outline-none`}
                  />
                  {editCategoryError && (
                    <p className="text-[11px] font-bold text-red-600 flex items-center gap-1 mt-1">
                      <span>{editCategoryError}</span>
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Retail Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editFormData.retailPrice || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, retailPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">B2B Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editFormData.b2bPrice || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, b2bPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#E31B23] focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    value={editFormData.mrp || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, mrp: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Alert Threshold</label>
                  <input
                    type="number"
                    value={editFormData.minStockLevel || 10}
                    onChange={(e) => setEditFormData({ ...editFormData, minStockLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
