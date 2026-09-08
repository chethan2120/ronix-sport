import React, { useState } from 'react';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Plus,
  Minus,
  ShoppingBag,
  Zap,
  Share2,
  Heart,
  Package,
} from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { ProductImage } from '../ProductImage';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onAddToCart,
  onBuyNow,
  onSelectProduct,
}) => {
  const { inventory, products } = useStore();
  const [selectedQty, setSelectedQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping'>('desc');
  const [copiedLink, setCopiedLink] = useState(false);

  const inv = inventory[product.id];
  const availableStock = inv ? Math.max(0, inv.onHand - inv.reserved) : 0;
  const isOutOfStock = availableStock <= 0;
  const isLowStock = availableStock > 0 && availableStock <= 10;

  const mrp = product.mrp || Math.round(product.retailPrice * 1.25);
  const discountPercent = Math.round(((mrp - product.retailPrice) / mrp) * 100);

  // Related products
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .slice(0, 4);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-[#E31B23] transition-colors py-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Gear</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors text-xs font-medium flex items-center gap-1.5"
            title="Share product"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {/* Left Column: Product Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-2xl bg-[#F8F9FA] border border-slate-100 flex items-center justify-center p-8 overflow-hidden">
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full bg-[#E31B23] text-white text-xs font-black shadow-xs tracking-wider uppercase">
                {discountPercent}% OFF
              </span>
            )}
            <ProductImage
              src={product.image}
              alt={product.name}
              category={product.category}
              className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-20 h-20 rounded-xl bg-slate-50 border-2 border-[#E31B23] p-1.5 flex items-center justify-center">
              <ProductImage
                src={product.image}
                alt={product.name}
                category={product.category}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex-1">
              <p className="font-semibold text-slate-800">Genuine Ronix Sports Equipment</p>
              <p className="text-[10px] text-slate-400 mt-0.5">High definition product photographs taken directly from warehouse batches.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category & Brand */}
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md bg-red-50 text-[#E31B23] text-xs font-bold uppercase tracking-wider">
                {product.category}
              </span>
              <span className="text-xs text-slate-400 font-medium">&bull;</span>
              <span className="text-xs font-semibold text-slate-600">{product.brand}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Ratings */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating || 4.8) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-900">{product.rating || 4.8}</span>
              <span className="text-xs text-slate-400">({product.reviewsCount || 42} verified customer reviews)</span>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-xl bg-[#F8F9FA] border border-slate-200 space-y-1">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-black text-[#111827]">
                  ₹{product.retailPrice.toLocaleString('en-IN')}
                </span>
                {mrp > product.retailPrice && (
                  <>
                    <span className="text-base text-slate-400 line-through">
                      ₹{mrp.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Save ₹{(mrp - product.retailPrice).toLocaleString('en-IN')} ({discountPercent}% OFF)
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-500">Inclusive of all taxes &bull; Free standard delivery</p>
            </div>

            {/* Stock Indicator */}
            <div>
              {isOutOfStock ? (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                  <span>Sold Out &bull; Notify when available</span>
                </div>
              ) : isLowStock ? (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                  <span>Only {availableStock} items left in stock — order soon!</span>
                </div>
              ) : (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>In Stock &bull; Dispatches within 24 hours</span>
                </div>
              )}
            </div>

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center space-x-3 pt-2">
                <span className="text-xs font-bold text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-300 rounded-xl bg-white shadow-2xs">
                  <button
                    onClick={() => setSelectedQty((prev) => Math.max(1, prev - 1))}
                    disabled={selectedQty <= 1}
                    className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-l-xl transition-colors disabled:opacity-30"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-slate-900">
                    {selectedQty}
                  </span>
                  <button
                    onClick={() => setSelectedQty((prev) => Math.min(availableStock, prev + 1))}
                    disabled={selectedQty >= availableStock}
                    className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-r-xl transition-colors disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[11px] text-slate-400">
                  Max available: {availableStock}
                </span>
              </div>
            )}

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              <button
                onClick={() => onAddToCart(product, selectedQty)}
                disabled={isOutOfStock}
                className="py-3.5 px-6 rounded-xl bg-white border-2 border-[#E31B23] text-[#E31B23] hover:bg-red-50 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer disabled:opacity-40"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={() => onBuyNow(product, selectedQty)}
                disabled={isOutOfStock}
                className="py-3.5 px-6 rounded-xl bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer disabled:opacity-40"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
            <div className="p-2.5 rounded-xl bg-[#F8F9FA] flex flex-col items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#E31B23] mb-1" />
              <span className="text-[11px] font-bold text-slate-800">100% Authentic</span>
              <span className="text-[10px] text-slate-400">Original Ronix Gear</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F8F9FA] flex flex-col items-center justify-center">
              <Truck className="w-5 h-5 text-[#E31B23] mb-1" />
              <span className="text-[11px] font-bold text-slate-800">Free Shipping</span>
              <span className="text-[10px] text-slate-400">On orders ₹999+</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F8F9FA] flex flex-col items-center justify-center">
              <RotateCcw className="w-5 h-5 text-[#E31B23] mb-1" />
              <span className="text-[11px] font-bold text-slate-800">7 Days Return</span>
              <span className="text-[10px] text-slate-400">Hassle-free exchange</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Description, Specifications, Shipping */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex border-b border-slate-200 space-x-6 text-sm">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 font-bold transition-all relative ${
              activeTab === 'desc'
                ? 'text-[#E31B23] border-b-2 border-[#E31B23]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 font-bold transition-all relative ${
              activeTab === 'specs'
                ? 'text-[#E31B23] border-b-2 border-[#E31B23]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-3 font-bold transition-all relative ${
              activeTab === 'shipping'
                ? 'text-[#E31B23] border-b-2 border-[#E31B23]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Delivery & Warranty
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'desc' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
            <p>
              The <strong>{product.name}</strong> is designed and manufactured under rigorous quality control standards for professional athletes, sports academies, and passionate sports enthusiasts.
            </p>
            <p>
              Engineered with advanced materials and tournament-grade construction, this gear offers balanced weight distribution, maximum durability, and superior on-field responsiveness.
            </p>
            <div className="p-4 bg-red-50/50 rounded-xl border border-red-100 text-slate-700">
              <h4 className="font-bold text-xs text-[#E31B23] uppercase tracking-wider mb-2">Key Highlights</h4>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Factory inspected and verified for official competition standards.</li>
                <li>Impact tested for durability and prolonged peak performance.</li>
                <li>Ergonomically tuned for grip, safety, and swift handling.</li>
                <li>Backed by Ronix Sports standard replacement guarantee against manufacturing flaws.</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="max-w-2xl">
            <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
              <tbody>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <td className="py-2.5 px-4 font-bold text-slate-700 w-1/3">Brand</td>
                  <td className="py-2.5 px-4 text-slate-600">{product.brand}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-4 font-bold text-slate-700">Category</td>
                  <td className="py-2.5 px-4 text-slate-600">{product.category}</td>
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <td className="py-2.5 px-4 font-bold text-slate-700">SKU Code</td>
                  <td className="py-2.5 px-4 text-slate-600 font-mono">{product.sku}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-4 font-bold text-slate-700">GST Rate</td>
                  <td className="py-2.5 px-4 text-slate-600">{product.gstPercent}% Included</td>
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <td className="py-2.5 px-4 font-bold text-slate-700">Stock Availability</td>
                  <td className="py-2.5 px-4 text-slate-600 font-semibold text-emerald-600">
                    {availableStock} units ready for immediate shipping
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-700">Origin</td>
                  <td className="py-2.5 px-4 text-slate-600">Ronix Sports Hub, India</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-[#F8F9FA]">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-1.5">
                  <Truck className="w-4 h-4 text-[#E31B23]" />
                  Shipping & Delivery
                </h4>
                <p className="text-xs text-slate-500">
                  Orders placed before 2:00 PM IST are dispatched on the same business day from our central Bengaluru or Delhi fulfillment warehouse. Standard delivery takes 3 to 5 working days.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-[#F8F9FA]">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-1.5">
                  <RotateCcw className="w-4 h-4 text-[#E31B23]" />
                  Returns & Replacements
                </h4>
                <p className="text-xs text-slate-500">
                  We offer a 7-day hassle-free replacement policy for defective or damaged items. Simply contact support with order details for an instant pickup arrangement.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-black text-[#111827] tracking-tight">
            You May Also Like
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((rel) => {
              const relInv = inventory[rel.id];
              const relAvail = relInv ? relInv.onHand - relInv.reserved : 0;
              return (
                <div
                  key={rel.id}
                  onClick={() => onSelectProduct(rel)}
                  className="bg-white rounded-xl border border-slate-200 p-3 hover:border-red-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="aspect-square w-full rounded-lg bg-slate-50 p-3 mb-2 flex items-center justify-center overflow-hidden">
                    <ProductImage
                      src={rel.image}
                      alt={rel.name}
                      category={rel.category}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#E31B23] uppercase">
                      {rel.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5 group-hover:text-[#E31B23] transition-colors">
                      {rel.name}
                    </h4>
                    <p className="text-xs font-extrabold text-slate-900 mt-1">
                      ₹{rel.retailPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
