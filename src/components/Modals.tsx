import React, { useState, useRef } from 'react';
import {
  X,
  Package,
  CircleDollarSign,
  Boxes,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductImage } from './ProductImage';
import { getTypesForCategory } from '../data/productTypes';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose }) => {
  const { addProduct, categories = [], addCategory } = useStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [imagePreview, setImagePreview] = useState<string>('');

  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [categoryError, setCategoryError] = useState<string>('');

  const [selectedProductType, setSelectedProductType] = useState<string>('');
  const [customProductType, setCustomProductType] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: categories[0] || 'Bats',
    brand: 'Ronix Sports',
    description: '',
    costPrice: 1500,
    retailPrice: 2500,
    b2bPrice: 2050,
    minStockLevel: 20,
    initialStock: 100,
    image: '',
    discountType: 'none' as 'none' | 'percentage' | 'flat',
    discountValue: 0,
    discountStartDate: '',
    discountEndDate: '',
  });

  if (!isOpen) return null;

  const availableProductTypes = getTypesForCategory(formData.category);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData((prev) => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData((prev) => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryError('');

    if (!formData.name || !formData.sku) return;

    if (formData.discountType === 'percentage' && (formData.discountValue < 0 || formData.discountValue > 100)) {
      alert('Percentage discount must be between 0% and 100%');
      return;
    }
    if (formData.discountType === 'flat' && formData.discountValue > formData.retailPrice) {
      alert(`Flat discount (₹${formData.discountValue}) cannot exceed Selling Price (₹${formData.retailPrice})`);
      return;
    }

    let finalCategory = formData.category;

    if (formData.category === 'Others') {
      const trimmedCat = newCategoryName.trim();
      if (!trimmedCat) {
        setCategoryError('Please enter a category name.');
        return;
      }
      finalCategory = addCategory(trimmedCat);
    }

    let finalProductType = selectedProductType;
    if (selectedProductType === 'Others') {
      finalProductType = customProductType.trim();
    }
    if (!finalProductType && availableProductTypes.length > 0) {
      finalProductType = availableProductTypes[0];
    }

    addProduct({
      name: formData.name,
      sku: formData.sku.toUpperCase(),
      category: finalCategory,
      productType: finalProductType || 'Standard',
      brand: formData.brand,
      description: formData.description || `${formData.name} by ${formData.brand}`,
      costPrice: Number(formData.costPrice),
      retailPrice: Number(formData.retailPrice),
      b2bPrice: Number(formData.b2bPrice),
      minStockLevel: Number(formData.minStockLevel),
      image: formData.image || imagePreview,
      image_url: formData.image || imagePreview,
      hsnCode: '9506.99',
      gstPercent: 18,
      status: 'Active',
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      discountStartDate: formData.discountStartDate || null,
      discountEndDate: formData.discountEndDate || null,
    }, Number(formData.initialStock));

    // Reset local custom category & product type state
    setNewCategoryName('');
    setSelectedProductType('');
    setCustomProductType('');
    setCategoryError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#E31B23]" />
            <h3 className="text-base font-black text-slate-900">Add New Product</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Product Title</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ronix Titanium Pro Helmet"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#E31B23] focus:outline-none font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">SKU Code</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="RNX-HLM-01"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 block">Category</label>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, category: 'Others' }));
                    setCategoryError('');
                  }}
                  className="text-[11px] font-bold text-[#E31B23] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add Category</span>
                </button>
              </div>
              <select
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  setCategoryError('');
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

          {formData.category === 'Others' && (
            <div className="p-3 bg-red-50/60 border border-red-200 rounded-xl space-y-1 animate-in fade-in duration-150">
              <label className="font-bold text-slate-800 block text-xs flex items-center gap-1">
                <span>New Category Name</span>
                <span className="text-[#E31B23]">*</span>
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value);
                  if (e.target.value.trim()) setCategoryError('');
                }}
                placeholder="e.g. Football, Badminton Rackets, Sports Shoes"
                className={`w-full px-3 py-2 bg-white border ${
                  categoryError ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-[#E31B23]'
                } rounded-xl font-medium text-xs focus:ring-2 focus:outline-none`}
              />
              {categoryError && (
                <p className="text-[11px] font-bold text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{categoryError}</span>
                </p>
              )}
            </div>
          )}

          {/* Product Type / Subcategory Dropdown */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Product Type / Subcategory
            </label>
            <select
              value={selectedProductType}
              onChange={(e) => setSelectedProductType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
            >
              <option value="">Default ({availableProductTypes[0] || 'Standard'})</option>
              {availableProductTypes.map((pt) => (
                <option key={pt} value={pt}>
                  {pt}
                </option>
              ))}
              <option value="Others">+ Add Custom Product Type</option>
            </select>
          </div>

          {selectedProductType === 'Others' && (
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1 animate-in fade-in duration-150">
              <label className="font-bold text-slate-800 block text-xs flex items-center gap-1">
                <span>New Product Type Name</span>
                <span className="text-[#E31B23]">*</span>
              </label>
              <input
                type="text"
                value={customProductType}
                onChange={(e) => setCustomProductType(e.target.value)}
                placeholder="e.g. Plastic Bat, Rubber Ball, Running Shoes"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-xs focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
              />
            </div>
          )}

          {/* Product Image Upload Section */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#E31B23]" />
                <span>Product Image</span>
              </label>
              <div className="flex gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                    imageMode === 'upload' ? 'bg-[#E31B23] text-white' : 'text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                    imageMode === 'url' ? 'bg-[#E31B23] text-white' : 'text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {imageMode === 'upload' ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#E31B23] rounded-xl p-3 bg-white text-center cursor-pointer transition-all flex items-center justify-center gap-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                  <ProductImage src={imagePreview} category={formData.category} name={formData.name} />
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-1.5 text-[#E31B23] font-bold">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Click or drag image file</span>
                  </div>
                  <p className="text-[10px] text-slate-400">PNG, JPG, WebP supported</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => {
                    setFormData({ ...formData, image: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                />
                {imagePreview && (
                  <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden">
                    <ProductImage src={imagePreview} category={formData.category} name={formData.name} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Cost (₹)</label>
              <input
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">B2C MSRP (₹)</label>
              <input
                type="number"
                value={formData.retailPrice}
                onChange={(e) => setFormData({ ...formData, retailPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">B2B Base (₹)</label>
              <input
                type="number"
                value={formData.b2bPrice}
                onChange={(e) => setFormData({ ...formData, b2bPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#E31B23] focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
              />
            </div>
          </div>

          {/* Admin Discount Control */}
          <div className="p-3 bg-red-50/60 border border-red-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-[#E31B23]"></span>
                <span>Promotional Discount Control</span>
              </label>
              {formData.discountType !== 'none' && (
                <span className="text-[10px] font-extrabold text-[#E31B23] bg-white px-2 py-0.5 rounded-full border border-red-200 shadow-2xs">
                  {formData.discountType === 'percentage' ? `${formData.discountValue}% OFF` : `₹${formData.discountValue} OFF`}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1 text-[11px]">Discount Type</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#E31B23] focus:outline-none text-xs"
                >
                  <option value="none">No Discount</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>

              {formData.discountType !== 'none' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                    Discount Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.discountType === 'percentage' ? 100 : formData.retailPrice}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    placeholder={formData.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#E31B23] focus:outline-none text-xs"
                  />
                </div>
              )}
            </div>

            {formData.discountType !== 'none' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-[11px]">Start Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.discountStartDate}
                    onChange={(e) => setFormData({ ...formData, discountStartDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-medium text-xs focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-[11px]">End Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.discountEndDate}
                    onChange={(e) => setFormData({ ...formData, discountEndDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-medium text-xs focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Initial Stock (Units)</label>
              <input
                type="number"
                value={formData.initialStock}
                onChange={(e) => setFormData({ ...formData, initialStock: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Min Threshold Alert</label>
              <input
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Create Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ isOpen, onClose }) => {
  const { customers, recordPayment } = useStore();
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [amount, setAmount] = useState(50000);
  const [method, setMethod] = useState<'UPI' | 'NEFT' | 'Cheque' | 'Cash' | 'Card'>('NEFT');
  const [referenceNumber, setReferenceNumber] = useState('NEFT-HDFC-991204');
  const [notes, setNotes] = useState('Institutional invoice settlement');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    recordPayment({
      customerId: selectedCustomerId,
      amount: Number(amount),
      method,
      referenceNumber,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-[#E31B23]" />
            <h3 className="text-base font-black text-slate-900">Record Payment</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Customer / Institution</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
            >
              {customers.map((c) => {
                const outstanding = c.outstandingBalance ?? Math.max(0, (c.creditLimit || 0) - (c.availableCredit || 0));
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} (Outstanding: ₹{outstanding.toLocaleString('en-IN')})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Amount Received (₹)</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-base text-[#E31B23] focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
              >
                <option value="NEFT">NEFT / RTGS</option>
                <option value="UPI">UPI / QR</option>
                <option value="Cheque">Bank Cheque</option>
                <option value="Card">Credit/Debit Card</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Txn / Cheque Ref #</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="UTR / Ref number"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface InventoryAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProductId?: string;
  defaultType?: 'IN' | 'OUT';
}

export const InventoryAdjustModal: React.FC<InventoryAdjustModalProps> = ({
  isOpen,
  onClose,
  defaultProductId,
  defaultType = 'IN',
}) => {
  const { products, inventory, adjustStock } = useStore();
  const [selectedProductId, setSelectedProductId] = useState(defaultProductId || products[0]?.id || '');
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>(defaultType);
  const [quantity, setQuantity] = useState(10);
  const [reason, setReason] = useState<string>('Purchase');
  const [notes, setNotes] = useState('');

  // Sync defaultProductId if changed
  React.useEffect(() => {
    if (defaultProductId) {
      setSelectedProductId(defaultProductId);
    }
  }, [defaultProductId]);

  React.useEffect(() => {
    setAdjustType(defaultType);
  }, [defaultType]);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const currentInv = inventory[selectedProductId] || { onHand: 0, reserved: 0, available: 0 };
  const availableStock = Math.max(0, currentInv.onHand - currentInv.reserved);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    const fullReason = notes ? `${reason} - ${notes}` : reason;

    adjustStock({
      productId: selectedProductId,
      type: adjustType,
      quantity: Number(quantity),
      reason: fullReason,
      warehouse: 'Ronix Sports HQ',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#E31B23]" />
            <h3 className="text-base font-black text-slate-900">Adjust Stock</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Product Select */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Select Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Banner */}
          <div className="p-3.5 bg-[#F8F9FA] rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-slate-500 font-medium block text-[11px]">Current On-Hand Stock</span>
              <span className="text-2xl font-black text-slate-900">{currentInv.onHand}</span>
              <span className="text-xs text-slate-400 ml-1">units</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-medium block text-[11px]">Live Available</span>
              <span className="text-lg font-extrabold text-emerald-600">{availableStock}</span>
              <span className="text-[10px] text-amber-600 block">({currentInv.reserved} reserved)</span>
            </div>
          </div>

          {/* Type Toggle: [ + Add Stock ] [ - Remove Stock ] */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Adjustment Action</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdjustType('IN');
                  if (reason === 'Damage' || reason === 'Sale') setReason('Purchase');
                }}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                  adjustType === 'IN'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>+ Add Stock</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdjustType('OUT');
                  if (reason === 'Purchase') setReason('Damage');
                }}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                  adjustType === 'OUT'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>- Remove Stock</span>
              </button>
            </div>
          </div>

          {/* Quantity with [ - ] [ 10 ] [ + ] stepper */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Quantity</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-base flex items-center justify-center transition-colors cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-center text-base text-slate-900 focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-base flex items-center justify-center transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
            >
              <option value="Purchase">Purchase (New Stock Receipt)</option>
              <option value="Sale">Sale (Manual Counter / Direct Dispatch)</option>
              <option value="Damage">Damage (Defective / QC Reject)</option>
              <option value="Return">Return (Customer Return / RMA)</option>
              <option value="Correction">Correction (Inventory Audit Reconciliation)</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Notes (optional) */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. PO-2025-081 or Box damage during transit"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#E31B23] focus:outline-none text-slate-800"
            />
          </div>

          {/* Action Buttons: [Cancel] [Update Stock] */}
          <div className="mt-5 flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Update Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
