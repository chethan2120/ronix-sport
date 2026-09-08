import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  QrCode,
  Truck,
  Building2,
  ArrowRight,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CartItemType } from './CartDrawer';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItemType[];
  onOrderSuccess: (orderInfo: { orderNumber: string; total: number; customerName: string }) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
}) => {
  const { placeD2COrder, setActiveTab } = useStore();

  const [customerName, setCustomerName] = useState('Arjun Sharma');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('arjun.sharma@example.com');
  const [address, setAddress] = useState('Flat 402, Greenfield Heights, Indiranagar');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('560038');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Net Banking' | 'COD'>('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, it) => acc + it.product.retailPrice * it.quantity, 0);
  const isFreeShipping = subtotal >= 999;
  const shippingFee = isFreeShipping ? 0 : 99;
  const grandTotal = subtotal + shippingFee;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || !phone.trim() || !address.trim() || !city.trim() || !pincode.trim()) {
      setErrorMessage('Please fill in all delivery details.');
      return;
    }

    setIsSubmitting(true);

    const fullAddress = `${address.trim()}, ${city.trim()} - ${pincode.trim()}`;
    const orderItems = items.map((it) => ({
      productId: it.product.id,
      quantity: it.quantity,
    }));

    const result = placeD2COrder({
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: fullAddress,
      items: orderItems,
      paymentMethod,
    });

    setIsSubmitting(false);

    if (result.success && result.sale) {
      onOrderSuccess({
        orderNumber: result.sale.saleNumber,
        total: grandTotal,
        customerName: customerName.trim(),
      });
    } else {
      setErrorMessage(result.error || 'Failed to place order. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-[#F8F9FA]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E31B23] flex items-center justify-center text-white font-black text-sm">
              R
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Ronix Sports Express Checkout</h3>
              <p className="text-xs text-slate-500">Fast, encrypted & secure ordering</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-6">
            {/* Delivery Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#E31B23]" />
                1. Delivery & Contact Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
                    placeholder="e.g. Arjun Sharma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address (for Invoice)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
                    placeholder="name@example.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
                    placeholder="House / Flat No, Street name, Locality"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#E31B23]" />
                2. Select Payment Method
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <label
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-[#E31B23] bg-red-50/50 text-[#E31B23] shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="sr-only"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                  />
                  <QrCode className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-bold">UPI / QR</span>
                  <span className="text-[10px] text-slate-400">GPay, PhonePe</span>
                </label>

                <label
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    paymentMethod === 'Card'
                      ? 'border-[#E31B23] bg-red-50/50 text-[#E31B23] shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="sr-only"
                    checked={paymentMethod === 'Card'}
                    onChange={() => setPaymentMethod('Card')}
                  />
                  <CreditCard className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-bold">Card</span>
                  <span className="text-[10px] text-slate-400">Visa / Mastercard</span>
                </label>

                <label
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    paymentMethod === 'Net Banking'
                      ? 'border-[#E31B23] bg-red-50/50 text-[#E31B23] shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="sr-only"
                    checked={paymentMethod === 'Net Banking'}
                    onChange={() => setPaymentMethod('Net Banking')}
                  />
                  <Building2 className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-bold">NetBanking</span>
                  <span className="text-[10px] text-slate-400">All major banks</span>
                </label>

                <label
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-[#E31B23] bg-red-50/50 text-[#E31B23] shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="sr-only"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <Truck className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-bold">Cash on Delivery</span>
                  <span className="text-[10px] text-slate-400">Pay on doorstep</span>
                </label>
              </div>
            </div>

            {/* Order Items Review */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#E31B23]" />
                3. Order Items ({items.length})
              </h4>
              <div className="bg-[#F8F9FA] rounded-xl p-3 max-h-36 overflow-y-auto space-y-2 border border-slate-200 text-xs">
                {items.map((it) => (
                  <div key={it.product.id} className="flex justify-between items-center">
                    <div className="truncate pr-2">
                      <span className="font-bold text-slate-800">{it.product.name}</span>
                      <span className="text-slate-400 ml-1.5 font-medium">x {it.quantity}</span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      ₹{(it.product.retailPrice * it.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-[#F8F9FA] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-left w-full sm:w-auto">
            <p className="text-[11px] text-slate-500">Total Payable Amount:</p>
            <p className="text-xl font-black text-slate-900">₹{grandTotal.toLocaleString('en-IN')}</p>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#E31B23] hover:bg-[#B5121B] text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Processing...' : `Place Order • ₹${grandTotal.toLocaleString('en-IN')}`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
