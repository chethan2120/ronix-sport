import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { Product } from '../../types';
import { ProductImage } from '../ProductImage';

export interface CartItemType {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItemType[];
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const totalItems = items.reduce((acc, it) => acc + it.quantity, 0);
  const subtotal = items.reduce((acc, it) => acc + it.product.retailPrice * it.quantity, 0);
  const freeShippingThreshold = 999;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingFee = isFreeShipping ? 0 : 99;
  const grandTotal = subtotal + shippingFee;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-[#F8F9FA]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-[#E31B23]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-none">Shopping Cart</h2>
              <p className="text-xs text-slate-500 mt-1">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="bg-amber-50/70 border-b border-amber-100 px-5 py-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              {isFreeShipping ? (
                <span className="text-emerald-700 font-bold">You qualify for FREE Delivery!</span>
              ) : (
                <span>
                  Add <strong className="text-amber-700">₹{freeShippingThreshold - subtotal}</strong> more for{' '}
                  <strong className="text-slate-900">FREE Delivery</strong>
                </span>
              )}
            </span>
            <span className="text-[11px] text-slate-500">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-amber-200/50 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isFreeShipping ? 'bg-emerald-500' : 'bg-[#E31B23]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-base font-bold text-slate-700">Your cart is currently empty</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                Browse our range of professional Ronix sports equipment and add your favorites.
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-5 py-2.5 rounded-xl bg-[#E31B23] text-white text-xs font-bold hover:bg-[#B5121B] transition-colors shadow-xs cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center space-x-3.5 p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                  <ProductImage
                    src={product.image}
                    alt={product.name}
                    category={product.category}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">
                    {product.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {product.brand} &bull; {product.category}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs font-bold text-slate-900">
                      ₹{(product.retailPrice * quantity).toLocaleString('en-IN')}
                    </span>
                    {quantity > 1 && (
                      <span className="text-[10px] text-slate-400">
                        (₹{product.retailPrice.toLocaleString('en-IN')} ea)
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity & Delete */}
                <div className="flex flex-col items-end space-y-2">
                  <button
                    onClick={() => onRemoveItem(product.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                    <button
                      onClick={() => onUpdateQty(product.id, -1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-l-md transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-slate-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQty(product.id, 1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-r-md transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Summary */}
        {items.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-[#F8F9FA] space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-semibold text-slate-800">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery</span>
                {isFreeShipping ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  <span className="font-semibold text-slate-800">₹{shippingFee}</span>
                )}
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total</span>
                <span className="text-lg font-black text-slate-900">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Inclusive of all taxes (GST)</p>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="w-full py-3 rounded-xl bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Genuine Sports Gear &bull; 7-Day Easy Returns</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
