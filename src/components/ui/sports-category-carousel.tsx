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
  Award,
  Trophy,
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
        className="relative outline-none focus:ring-2 focus:ring-[#E31B23]/40 focus:ring-offset-2 rounded-3xl"
        aria-label="Match Ready Gear Category Carousel"
      >
        {/* Layered Stack Container */}
        <div className="relative min-h-[580px] sm:min-h-[540px] flex items-center justify-center">
          {slides.map((slide, slideIdx) => {
            const isActive = slideIdx === activeIndex;
            const isPrev = slideIdx === (activeIndex - 1 + slides.length) % slides.length;
            const isNext = slideIdx === (activeIndex + 1) % slides.length;

            let cardStateClasses = 'hidden pointer-events-none opacity-0 scale-90 z-0';

            if (isActive) {
              cardStateClasses =
                'relative z-20 opacity-100 scale-100 shadow-2xl pointer-events-auto blur-none';
            } else if (isPrev && !prefersReducedMotion) {
              cardStateClasses =
                'absolute z-10 opacity-35 scale-[0.93] -translate-x-6 md:-translate-x-12 blur-[1.5px] pointer-events-none hidden sm:block';
            } else if (isNext && !prefersReducedMotion) {
              cardStateClasses =
                'absolute z-10 opacity-35 scale-[0.93] translate-x-6 md:translate-x-12 blur-[1.5px] pointer-events-none hidden sm:block';
            }

            // Reduced motion override
            if (prefersReducedMotion && !isActive) {
              cardStateClasses = 'hidden';
            }

            return (
              <div
                key={slide.id}
                className={`w-full transition-all duration-500 ease-out rounded-3xl border p-5 sm:p-8 space-y-6 ${slide.bgTint} ${slide.accentBorder} ${cardStateClasses}`}
              >
                {/* Header & Carousel Control Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-2xs ${slide.badgeStyle}`}>
                        {slide.badge}
                      </span>
                      <span className="text-xs font-bold text-slate-500 bg-white/80 px-2.5 py-0.5 rounded-full border border-slate-200">
                        {slideIdx + 1} / {slides.length}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {slide.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl">
                      {slide.desc}
                    </p>
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex items-center space-x-3 shrink-0">
                    <button
                      onClick={prevSlide}
                      className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-[#E31B23] flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Previous Category"
                      aria-label="Previous Category"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Dots Indicator */}
                    <div className="flex items-center space-x-1.5 px-1.5">
                      {slides.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          onClick={() => setActiveIndex(dotIdx)}
                          className={`h-2.5 rounded-full transition-all cursor-pointer ${
                            activeIndex === dotIdx
                              ? 'bg-[#E31B23] w-7 shadow-xs'
                              : 'bg-slate-300 hover:bg-slate-400 w-2.5'
                          }`}
                          title={`Go to slide ${dotIdx + 1}`}
                          aria-label={`Go to slide ${dotIdx + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={nextSlide}
                      className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-[#E31B23] flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Next Category"
                      aria-label="Next Category"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => {
                        onSelectCategory(slide.category);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5 group ${slide.buttonStyle}`}
                    >
                      <span>View All {slide.category}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Slide Products Preview Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {slide.products.slice(0, 4).map((prod) => {
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
                        className="group relative bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-xl hover:border-red-300 transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
                      >
                        {/* Image Container: White background, fixed height, centered object-contain */}
                        <div className="relative aspect-square w-full bg-white p-3 flex items-center justify-center border-b border-slate-100 overflow-hidden">
                          {discInfo.hasDiscount && (
                            <div className="absolute top-2 left-2 z-10">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E31B23] text-white shadow-2xs">
                                {discInfo.discountLabel}
                              </span>
                            </div>
                          )}

                          {onToggleWishlist && (
                            <button
                              onClick={(e) => onToggleWishlist(prod.id, e)}
                              className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#E31B23] hover:scale-110 transition-all shadow-xs"
                              title="Add to Wishlist"
                            >
                              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#E31B23] text-[#E31B23]' : ''}`} />
                            </button>
                          )}

                          <ProductImage
                            src={prod.image_url || prod.image}
                            alt={prod.name}
                            category={prod.category}
                            name={prod.name}
                            product={prod}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />

                          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            <span className="bg-white/95 text-slate-900 font-extrabold text-[11px] px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-[#E31B23]" />
                              <span>Quick View</span>
                            </span>
                          </div>
                        </div>

                        {/* Card Info */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-0.5">
                              <span>{prod.brand}</span>
                              <span className="text-[#E31B23] font-bold">{prod.category}</span>
                            </div>

                            <h3 className="text-xs font-black text-slate-900 line-clamp-2 min-h-[2.25rem] leading-snug group-hover:text-[#E31B23] transition-colors">
                              {prod.name}
                            </h3>
                          </div>

                          <div className="pt-2 border-t border-slate-100 space-y-2">
                            <div className="flex items-baseline justify-between">
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm font-black text-slate-900">
                                  ₹{discInfo.finalPrice.toLocaleString('en-IN')}
                                </span>
                                {discInfo.hasDiscount && (
                                  <span className="text-[10px] text-slate-400 line-through font-medium">
                                    ₹{discInfo.originalPrice.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>

                              <div>
                                {isOutOfStock ? (
                                  <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Out</span>
                                ) : isLowStock ? (
                                  <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Low</span>
                                ) : (
                                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">In Stock</span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(prod, 1, e);
                              }}
                              disabled={isOutOfStock}
                              className={`w-full py-1.5 px-2.5 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                isOutOfStock
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-[#E31B23] hover:bg-[#B5121B] text-white shadow-2xs hover:shadow-md'
                              }`}
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
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
