import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShoppingBag,
  Eye,
  Heart,
  Star,
  ShieldCheck,
  Tag,
  Zap,
} from 'lucide-react';
import { Product, getEffectiveProductPrice } from '../../types';
import { ProductImage } from '../ProductImage';

export interface CategorySlideData {
  id: string;
  title: string;
  category: string;
  badge: string;
  desc: string;
  products: Product[];
  bgTint: string;
  badgeStyle: string;
  buttonStyle: string;
  accentBorder: string;
}

interface SportsCategoryCarouselProps {
  slides: CategorySlideData[];
  onSelectCategory: (categoryName: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, e?: React.MouseEvent) => void;
  inventory?: Record<string, any>;
  wishlist?: Record<string, boolean>;
  onToggleWishlist?: (productId: string, e: React.MouseEvent) => void;
  autoPlayIntervalMs?: number;
}

export const SportsCategoryCarousel: React.FC<SportsCategoryCarouselProps> = ({
  slides,
  onSelectCategory,
  onSelectProduct,
  onAddToCart,
  inventory = {},
  wishlist = {},
  onToggleWishlist,
  autoPlayIntervalMs = 4500,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Navigation handlers
  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  }, [slides.length]);

  // Auto-play timer
  useEffect(() => {
    if (isPaused || prefersReducedMotion || slides.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, autoPlayIntervalMs);

    return () => clearInterval(interval);
  }, [isPaused, prefersReducedMotion, slides.length, autoPlayIntervalMs, nextSlide]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    }
  };

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    setTouchStartX(null);
  };

  if (!slides || slides.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-4 py-2">
      {/* Container with hover pause, keyboard focus, & swipe listeners */}
      <div
        ref={carouselRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative outline-none focus:ring-2 focus:ring-[#E31B23]/40 focus:ring-offset-2 rounded-2xl"
        aria-label="Match Ready Gear Category Carousel"
      >
        {/* Layered Stack Container - Compact Height */}
        <div className="relative min-h-[420px] max-h-[460px] flex items-center justify-center">
          {slides.map((slide, slideIdx) => {
            const isActive = slideIdx === activeIndex;
            const isPrev = slideIdx === (activeIndex - 1 + slides.length) % slides.length;
            const isNext = slideIdx === (activeIndex + 1) % slides.length;

            let cardStateClasses = 'hidden pointer-events-none opacity-0 scale-95 z-0';

            if (isActive) {
              cardStateClasses =
                'relative z-20 opacity-100 scale-100 shadow-xl pointer-events-auto blur-none';
            } else if (isPrev && !prefersReducedMotion) {
              cardStateClasses =
                'absolute z-10 opacity-20 scale-[0.96] -translate-x-3 blur-[1px] pointer-events-none hidden md:block';
            } else if (isNext && !prefersReducedMotion) {
              cardStateClasses =
                'absolute z-10 opacity-20 scale-[0.96] translate-x-3 blur-[1px] pointer-events-none hidden md:block';
            }

            // Reduced motion override
            if (prefersReducedMotion && !isActive) {
              cardStateClasses = 'hidden';
            }

            return (
              <div
                key={slide.id}
                className={`w-full transition-all duration-300 ease-out rounded-2xl border p-4 sm:p-5 space-y-4 ${slide.bgTint} ${slide.accentBorder} ${cardStateClasses}`}
              >
                {/* Single Compact Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                  <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${slide.badgeStyle}`}>
                      {slide.badge}
                    </span>

                    <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      {slide.title}
                    </h2>

                    <span className="text-[11px] font-bold text-slate-500 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
                      {slideIdx + 1} / {slides.length}
                    </span>
                  </div>

                  {/* Compact Header Controls */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={prevSlide}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-[#E31B23] flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Previous Category"
                      aria-label="Previous Category"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Dots Indicator */}
                    <div className="flex items-center space-x-1 px-1">
                      {slides.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          onClick={() => setActiveIndex(dotIdx)}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            activeIndex === dotIdx
                              ? 'bg-[#E31B23] w-5 shadow-xs'
                              : 'bg-slate-300 hover:bg-slate-400 w-2'
                          }`}
                          title={`Go to slide ${dotIdx + 1}`}
                          aria-label={`Go to slide ${dotIdx + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={nextSlide}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-[#E31B23] flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Next Category"
                      aria-label="Next Category"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        onSelectCategory(slide.category);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`px-3 py-1.5 rounded-lg font-black text-[11px] transition-all shadow-xs cursor-pointer flex items-center gap-1 group ${slide.buttonStyle}`}
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Subtitle Description */}
                <p className="text-xs text-slate-600 font-medium -mt-1">
                  {slide.desc}
                </p>

                {/* Slide Products Preview Grid: EXACTLY 2 CARDS ONLY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-3xl mx-auto">
                  {slide.products.slice(0, 2).map((prod) => {
                    const inv = inventory[prod.id];
                    const available = inv ? Math.max(0, inv.onHand - inv.reserved) : 0;
                    const isOutOfStock = available <= 0;
                    const isLowStock = available > 0 && available <= 10;
                    const discInfo = getEffectiveProductPrice(prod);
                    const isWishlisted = Boolean(wishlist[prod.id]);

                    return (
                      <div
                        key={prod.id}
                        onClick={() => {
                          onSelectProduct(prod);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="group relative bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md hover:border-red-300 transition-all duration-200 flex flex-col justify-between cursor-pointer"
                      >
                        {/* Image Container: White background, compact height (28 sm:32), centered object-contain */}
                        <div className="relative h-28 sm:h-32 w-full bg-white p-2 flex items-center justify-center border-b border-slate-100 overflow-hidden">
                          {discInfo.hasDiscount && (
                            <div className="absolute top-1.5 left-1.5 z-10">
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#E31B23] text-white shadow-2xs">
                                {discInfo.discountLabel}
                              </span>
                            </div>
                          )}

                          {onToggleWishlist && (
                            <button
                              onClick={(e) => onToggleWishlist(prod.id, e)}
                              className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#E31B23] transition-all shadow-xs"
                              title="Add to Wishlist"
                            >
                              <Heart className={`w-3 h-3 ${isWishlisted ? 'fill-[#E31B23] text-[#E31B23]' : ''}`} />
                            </button>
                          )}

                          <ProductImage
                            src={prod.image_url || prod.image}
                            alt={prod.name}
                            category={prod.category}
                            name={prod.name}
                            product={prod}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                          />

                          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-white/95 text-slate-900 font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                              <Eye className="w-3 h-3 text-[#E31B23]" />
                              <span>Quick View</span>
                            </span>
                          </div>
                        </div>

                        {/* Card Info: Compact layout */}
                        <div className="p-3 flex-1 flex flex-col justify-between space-y-1.5">
                          <div>
                            <div className="flex items-center justify-between text-[9px] text-slate-400 font-semibold mb-0.5">
                              <span>{prod.brand}</span>
                              <span className="text-[#E31B23] font-bold">{prod.category}</span>
                            </div>

                            <h3 className="text-xs font-black text-slate-900 line-clamp-1 leading-snug group-hover:text-[#E31B23] transition-colors">
                              {prod.name}
                            </h3>
                          </div>

                          <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
                            <div className="flex items-baseline justify-between">
                              <div className="flex items-baseline gap-1">
                                <span className="text-xs sm:text-sm font-black text-slate-900">
                                  ₹{discInfo.finalPrice.toLocaleString('en-IN')}
                                </span>
                                {discInfo.hasDiscount && (
                                  <span className="text-[9px] text-slate-400 line-through font-medium">
                                    ₹{discInfo.originalPrice.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>

                              <div>
                                {isOutOfStock ? (
                                  <span className="text-[8px] font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded">Out</span>
                                ) : isLowStock ? (
                                  <span className="text-[8px] font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded">Low</span>
                                ) : (
                                  <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">In Stock</span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(prod, 1, e);
                              }}
                              disabled={isOutOfStock}
                              className={`w-full py-1 px-2 rounded-lg font-black text-[10px] sm:text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                isOutOfStock
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-[#E31B23] hover:bg-[#B5121B] text-white shadow-2xs'
                              }`}
                            >
                              <ShoppingBag className="w-3 h-3" />
                              <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
