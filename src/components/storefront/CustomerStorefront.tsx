import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  User as UserIcon,
  X,
  Filter,
  SlidersHorizontal,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  LogOut,
  Package,
  Tag,
  Zap,
  Trophy,
  CheckCircle2,
  Clock,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Flame,
  Check,
  Heart,
  Eye,
  Percent,
} from 'lucide-react';
import { useStore, normalizeCategory } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Product, CustomerOrder, getEffectiveProductPrice } from '../../types';
import { ProductImage } from '../ProductImage';
import { ProductDetailPage } from './ProductDetailPage';
import { CartDrawer, CartItemType } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import { getTypesForCategory } from '../../data/productTypes';
import {
  HeroSportsComposition,
  CricketSlideSVG,
  FootballSlideSVG,
  FitnessSlideSVG,
  CricketCategorySVG,
  FootballCategorySVG,
  BadmintonCategorySVG,
  TableTennisCategorySVG,
  VolleyballCategorySVG,
  BasketballCategorySVG,
  FitnessCategorySVG,
  SportswearCategorySVG,
  CricketKitPromoSVG,
  FootballPromoSVG,
  FitnessPromoSVG,
  SpecificProductSVG,
} from './SportsIllustrations';

interface CustomerStorefrontProps {
  onBackToCRM?: () => void;
}

export const CustomerStorefront: React.FC<CustomerStorefrontProps> = ({ onBackToCRM }) => {
  const {
    products = [],
    categories: storeCategories = [],
    inventory = {},
    customerOrders = [],
  } = useStore();

  const { profile, signOut } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'category' | 'my-orders' | 'account'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Gear');
  const [selectedSubtype, setSelectedSubtype] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [placedOrderSuccess, setPlacedOrderSuccess] = useState<CustomerOrder | null>(null);

  // Filters State
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');

  // Hero Banners Carousel Index
  const [heroIndex, setHeroIndex] = useState(0);

  const heroSlides = [
    {
      badge: 'SEASON PICKS',
      headline: 'PLAY HARD. GEAR SMART.',
      subtext: 'Cricket, Football, Badminton, Fitness & more.',
      cta: 'Shop Now',
      category: 'All Gear',
      SvgComponent: HeroSportsComposition,
      bg: 'bg-gradient-to-r from-[#111827] via-[#990B11] to-[#E31B23]',
    },
    {
      badge: 'CRICKET SEASON',
      headline: 'MASTER THE CREASE.',
      subtext: 'English Willow Bats • Match Leather Balls • Protective Gear',
      cta: 'Shop Cricket',
      category: 'Cricket',
      SvgComponent: CricketSlideSVG,
      bg: 'bg-gradient-to-r from-[#1E293B] via-[#7F1D1D] to-[#E31B23]',
    },
    {
      badge: 'FOOTBALL ESSENTIALS',
      headline: 'DOMINATE THE PITCH.',
      subtext: 'Pro Match Balls • Turf Studs • Training Accessories',
      cta: 'Shop Football',
      category: 'Football',
      SvgComponent: FootballSlideSVG,
      bg: 'bg-gradient-to-r from-[#064E3B] via-[#0F766E] to-[#0284C7]',
    },
    {
      badge: 'FITNESS & TRAINING',
      headline: 'BUILD YOUR STRENGTH.',
      subtext: 'Hex Dumbbells • Kettlebells • Mats • Resistance Gear',
      cta: 'Shop Fitness',
      category: 'Fitness & Gym',
      SvgComponent: FitnessSlideSVG,
      bg: 'bg-gradient-to-r from-[#1E1B4B] via-[#4338CA] to-[#0EA5E9]',
    },
  ];

  // Auto-slide effect for hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleAddToCart = (product: Product, quantity = 1, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCart((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + quantity,
    }));
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  const cartItemsList: CartItemType[] = useMemo(() => {
    return Object.entries(cart)
      .map(([prodId, qty]) => {
        const prod = products.find((p) => p.id === prodId);
        if (!prod) return null;
        return { product: prod, quantity: qty };
      })
      .filter(Boolean) as CartItemType[];
  }, [cart, products]);

  const totalCartCount = useMemo(() => {
    return Object.values(cart).reduce((acc, qty) => acc + qty, 0);
  }, [cart]);

  // Categories definition with custom SVGs
  const categoriesList = [
    { name: 'Cricket', count: 12, desc: 'Bats, Balls & Protection', Svg: CricketCategorySVG, bgTint: 'bg-red-50/60' },
    { name: 'Football', count: 8, desc: 'Balls, Studs & Training', Svg: FootballCategorySVG, bgTint: 'bg-emerald-50/60' },
    { name: 'Badminton', count: 7, desc: 'Rackets, Shuttles & Grips', Svg: BadmintonCategorySVG, bgTint: 'bg-sky-50/60' },
    { name: 'Table Tennis', count: 4, desc: 'Bats, Balls & Nets', Svg: TableTennisCategorySVG, bgTint: 'bg-amber-50/60' },
    { name: 'Volleyball', count: 2, desc: 'Match Balls & Nets', Svg: VolleyballCategorySVG, bgTint: 'bg-blue-50/60' },
    { name: 'Basketball', count: 3, desc: 'Balls, Shoes & Hoops', Svg: BasketballCategorySVG, bgTint: 'bg-orange-50/60' },
    { name: 'Fitness & Gym', count: 8, desc: 'Weights, Mats & Bands', Svg: FitnessCategorySVG, bgTint: 'bg-indigo-50/60' },
    { name: 'Sportswear & Accessories', count: 6, desc: 'Apparel, Shoes & Bags', Svg: SportswearCategorySVG, bgTint: 'bg-purple-50/60' },
  ];

  // Dynamic Filtering
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const prodCategoryNorm = normalizeCategory(prod.category);

      // Category filter
      if (selectedCategory !== 'All Gear') {
        if (selectedCategory === 'Cricket') {
          if (!['Cricket', 'Bats', 'Balls', 'Helmets', 'Gloves', 'Pads'].includes(prodCategoryNorm) && !['Cricket', 'Bats', 'Balls', 'Helmets', 'Gloves', 'Pads'].includes(prod.category)) {
            return false;
          }
        } else if (selectedCategory === 'Fitness & Gym') {
          if (prodCategoryNorm !== 'Fitness' && prod.category !== 'Fitness & Gym') return false;
        } else if (selectedCategory === 'Sportswear & Accessories') {
          if (!['Footwear', 'Bags', 'Accessories'].includes(prodCategoryNorm) && !['Footwear', 'Bags', 'Accessories'].includes(prod.category)) return false;
        } else {
          if (prodCategoryNorm !== normalizeCategory(selectedCategory) && prod.category !== selectedCategory) {
            return false;
          }
        }
      }

      // Subtype filter
      if (selectedSubtype !== 'All' && prod.productType && prod.productType !== selectedSubtype) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(q);
        const matchesBrand = prod.brand.toLowerCase().includes(q);
        const matchesCategory = prod.category.toLowerCase().includes(q);
        const matchesSku = prod.sku.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesCategory && !matchesSku) return false;
      }

      // Brands filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(prod.brand)) {
        return false;
      }

      // Price Range
      const disc = getEffectiveProductPrice(prod);
      const effectivePrice = disc.finalPrice;
      if (priceRange.min && effectivePrice < Number(priceRange.min)) return false;
      if (priceRange.max && effectivePrice > Number(priceRange.max)) return false;

      // In stock check
      if (inStockOnly) {
        const inv = inventory[prod.id];
        const avail = inv ? inv.onHand - inv.reserved : 0;
        if (avail <= 0) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = getEffectiveProductPrice(a).finalPrice;
      const priceB = getEffectiveProductPrice(b).finalPrice;
      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'rating') return (b.rating || 4.5) - (a.rating || 4.5);
      return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    });
  }, [products, selectedCategory, selectedSubtype, searchQuery, selectedBrands, priceRange, inStockOnly, sortBy, inventory]);

  // Section collections
  const activeDiscountDeals = useMemo(() => {
    return products.filter((p) => getEffectiveProductPrice(p).hasDiscount);
  }, [products]);

  const bestSellerProducts = useMemo(() => {
    return products.filter((p) => p.isBestSeller || p.isFeatured || (p.rating && p.rating >= 4.7)).slice(0, 8);
  }, [products]);

  const trendingProducts = useMemo(() => {
    return products.slice(4, 14);
  }, [products]);

  const cricketSectionProducts = useMemo(() => {
    return products.filter((p) => ['Cricket', 'Bats', 'Balls', 'Helmets', 'Gloves', 'Pads'].includes(p.category) || ['Cricket', 'Bats', 'Balls', 'Helmets', 'Gloves', 'Pads'].includes(normalizeCategory(p.category))).slice(0, 6);
  }, [products]);

  const footballSectionProducts = useMemo(() => {
    return products.filter((p) => p.category === 'Football' || normalizeCategory(p.category) === 'Football').slice(0, 6);
  }, [products]);

  const badmintonSectionProducts = useMemo(() => {
    return products.filter((p) => p.category === 'Badminton' || normalizeCategory(p.category) === 'Badminton').slice(0, 6);
  }, [products]);

  const fitnessSectionProducts = useMemo(() => {
    return products.filter((p) => p.category === 'Fitness' || p.category === 'Fitness & Gym' || normalizeCategory(p.category) === 'Fitness').slice(0, 6);
  }, [products]);

  // Handle Category click
  const handleSelectCategory = (catName: string) => {
    setSelectedCategory(catName);
    setSelectedSubtype('All');
    setActiveTab('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render Product Card
  const renderProductCard = (prod: Product, compact = false) => {
    const inv = inventory[prod.id];
    const available = inv ? Math.max(0, inv.onHand - inv.reserved) : 0;
    const isOutOfStock = available <= 0;
    const isLowStock = available > 0 && available <= 10;
    const discInfo = getEffectiveProductPrice(prod);
    const isWishlisted = Boolean(wishlist[prod.id]);

    return (
      <div
        key={prod.id}
        onClick={() => setSelectedProduct(prod)}
        className="group relative bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-red-300 transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
      >
        {/* Top Badges & Wishlist */}
        <div className="relative aspect-square w-full bg-slate-50/60 p-4 flex items-center justify-center border-b border-slate-100 overflow-hidden">
          {/* Discount Badge */}
          {discInfo.hasDiscount && (
            <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E31B23] text-white shadow-2xs">
                {discInfo.discountLabel}
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => toggleWishlist(prod.id, e)}
            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#E31B23] hover:scale-110 transition-all shadow-xs"
            title="Add to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#E31B23] text-[#E31B23]' : ''}`} />
          </button>

          {/* Product Image / SVG */}
          <ProductImage
            src={prod.image}
            alt={prod.name}
            category={prod.category}
            name={prod.name}
            product={prod}
            className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300"
          />

          {/* Quick View overlay button */}
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <span className="bg-white/95 text-slate-900 font-extrabold text-[11px] px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-[#E31B23]" />
              <span>Quick View</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
              <span>{prod.brand}</span>
              <span className="text-[#E31B23] font-bold">{prod.category}</span>
            </div>

            <h3 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-2 leading-snug group-hover:text-[#E31B23] transition-colors">
              {prod.name}
            </h3>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            {/* Price section */}
            <div className="flex items-baseline justify-between">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base sm:text-lg font-black text-slate-900">
                    ₹{discInfo.finalPrice.toLocaleString('en-IN')}
                  </span>
                  {discInfo.hasDiscount && (
                    <span className="text-xs text-slate-400 line-through font-medium">
                      ₹{discInfo.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock status indicator */}
              <div>
                {isOutOfStock ? (
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Out</span>
                ) : isLowStock ? (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Low</span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">In Stock</span>
                )}
              </div>
            </div>

            {/* Add to Cart button */}
            <button
              onClick={(e) => handleAddToCart(prod, 1, e)}
              disabled={isOutOfStock}
              className={`w-full py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-[#E31B23] hover:bg-[#B5121B] text-white shadow-xs hover:shadow-md'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20 md:pb-10">
      {/* Top Banner Bar */}
      <div className="bg-[#111827] text-white text-[11px] font-bold py-1.5 px-4 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-3 mx-auto sm:mx-0">
          <span className="bg-[#E31B23] text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
            OFFICIAL STORE
          </span>
          <span className="hidden sm:inline">100% Genuine Ronix Sports Equipment Direct Warehouse Shipping</span>
        </div>
        <div className="hidden md:flex items-center space-x-4 text-slate-300">
          <span className="flex items-center gap-1"><Truck className="w-3 h-3 text-[#E31B23]" /> Free Express Shipping Over ₹999</span>
          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-[#E31B23]" /> Verified Warranty</span>
          {onBackToCRM && (
            <button
              onClick={onBackToCRM}
              className="text-[#E31B23] hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Admin CRM</span>
            </button>
          )}
        </div>
      </div>

      {/* Main E-Commerce Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div
              onClick={() => {
                setActiveTab('home');
                setSelectedCategory('All Gear');
                setSelectedSubtype('All');
                setSearchQuery('');
              }}
              className="flex items-center space-x-2.5 cursor-pointer shrink-0"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E31B23] to-[#990B11] flex items-center justify-center text-white font-black text-xl shadow-md">
                R
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-[#111827] block leading-none">
                  RONIX <span className="text-[#E31B23]">SPORTS</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                  PREMIUM STORE
                </span>
              </div>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim() && activeTab !== 'category') {
                    setActiveTab('category');
                  }
                }}
                placeholder="Search cricket bats, footballs, dumbbells, badminton rackets..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-100/80 border border-slate-200 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E31B23] focus:bg-white transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-full bg-slate-100 hover:bg-red-50 hover:text-[#E31B23] text-slate-700 transition-colors cursor-pointer"
                title="View Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E31B23] text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-xs animate-bounce">
                    {totalCartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('account')}
                className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[#E31B23] text-white flex items-center justify-center font-black text-[11px]">
                  {profile?.full_name?.charAt(0) || 'C'}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{profile?.full_name?.split(' ')[0] || 'Customer'}</span>
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="mt-3 md:hidden relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim() && activeTab !== 'category') {
                  setActiveTab('category');
                }
              }}
              placeholder="Search sports gear..."
              className="w-full pl-9 pr-8 py-2 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Horizontal Category Chips Navigation */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pt-3 text-xs font-bold border-t border-slate-100 mt-2">
            <button
              onClick={() => {
                setActiveTab('home');
                setSelectedCategory('All Gear');
                setSelectedSubtype('All');
              }}
              className={`px-4 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'home' && selectedCategory === 'All Gear'
                  ? 'bg-[#E31B23] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🔥 Featured Home
            </button>
            {categoriesList.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleSelectCategory(cat.name)}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.name
                    ? 'bg-[#E31B23] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* RENDER ACTIVE VIEW */}
      {selectedProduct ? (
        <ProductDetailPage
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
          onAddToCart={(prod, qty) => handleAddToCart(prod, qty)}
          onBuyNow={(prod, qty) => {
            handleAddToCart(prod, qty);
            setIsCheckoutOpen(true);
          }}
          onSelectProduct={(prod) => setSelectedProduct(prod)}
        />
      ) : activeTab === 'home' ? (
        <main className="space-y-10 sm:space-y-12">
          {/* HERO CAROUSEL SECTION */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
            <div className={`relative rounded-3xl overflow-hidden shadow-2xl text-white ${heroSlides[heroIndex].bg} transition-all duration-500 min-h-[320px] sm:min-h-[380px] flex items-center`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-10 w-full items-center">
                {/* Left Text Column */}
                <div className="lg:col-span-7 space-y-4 z-10">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-black tracking-widest uppercase">
                    <SparklesIcon className="w-3.5 h-3.5 text-yellow-300" />
                    <span>{heroSlides[heroIndex].badge}</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight uppercase">
                    {heroSlides[heroIndex].headline}
                  </h1>

                  <p className="text-sm sm:text-base text-white/80 font-medium max-w-lg">
                    {heroSlides[heroIndex].subtext}
                  </p>

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={() => handleSelectCategory(heroSlides[heroIndex].category)}
                      className="px-6 py-3 rounded-full bg-white text-[#111827] font-black text-xs sm:text-sm hover:bg-slate-100 transition-all shadow-lg hover:scale-105 cursor-pointer flex items-center gap-2"
                    >
                      <span>{heroSlides[heroIndex].cta}</span>
                      <ArrowRight className="w-4 h-4 text-[#E31B23]" />
                    </button>
                    <button
                      onClick={() => handleSelectCategory('All Gear')}
                      className="px-5 py-3 rounded-full bg-black/30 hover:bg-black/40 text-white font-extrabold text-xs sm:text-sm transition-all border border-white/20 cursor-pointer"
                    >
                      Explore All Gear
                    </button>
                  </div>
                </div>

                {/* Right SVG Artwork Column */}
                <div className="lg:col-span-5 hidden lg:flex items-center justify-center p-2 h-[260px] sm:h-[300px]">
                  {React.createElement(heroSlides[heroIndex].SvgComponent, { className: "w-full h-full object-contain filter drop-shadow-2xl animate-in fade-in zoom-in duration-300" })}
                </div>
              </div>

              {/* Carousel Indicators & Controls */}
              <div className="absolute bottom-4 left-6 sm:left-10 flex items-center space-x-2 z-20">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroIndex(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      heroIndex === idx ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              <div className="absolute bottom-4 right-6 hidden sm:flex items-center space-x-2 z-20">
                <button
                  onClick={() => setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setHeroIndex((prev) => (prev + 1) % heroSlides.length)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* VISUAL CATEGORY CARDS SECTION */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-xs font-black text-[#E31B23] uppercase tracking-widest block">EXPLORE BY SPORT</span>
                <h2 className="text-2xl font-black text-[#111827] tracking-tight">Shop Categories</h2>
              </div>
              <button
                onClick={() => handleSelectCategory('All Gear')}
                className="text-xs font-bold text-[#E31B23] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Categories</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
              {categoriesList.map((cat) => (
                <div
                  key={cat.name}
                  onClick={() => handleSelectCategory(cat.name)}
                  className={`group relative rounded-2xl p-4 sm:p-5 border border-slate-200/80 ${cat.bgTint} hover:bg-white hover:border-[#E31B23] hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between h-[190px] transform hover:-translate-y-1`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-white p-2 border border-slate-200/60 shadow-xs flex items-center justify-center group-hover:scale-110 transition-transform">
                      <cat.Svg />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
                      {cat.count} Items
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-[#E31B23] transition-colors leading-tight">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                      {cat.desc}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#E31B23] mt-2 group-hover:translate-x-1 transition-transform">
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FEATURED PROMO TILES */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Tile 1 */}
              <div
                onClick={() => handleSelectCategory('Cricket')}
                className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all"
              >
                <div className="relative z-10 space-y-3 max-w-[200px]">
                  <span className="text-[10px] font-black tracking-wider uppercase bg-white/20 px-2.5 py-0.5 rounded-full border border-white/20">STARTER KIT</span>
                  <h3 className="text-xl font-black leading-tight">CRICKET STARTER KIT</h3>
                  <p className="text-xs text-white/80 font-medium">Bat + Leather Ball + Batting Gloves</p>
                  <div className="pt-2">
                    <span className="bg-white text-[#E31B23] font-black text-xs px-4 py-2 rounded-full inline-flex items-center gap-1 shadow-md group-hover:scale-105 transition-transform">
                      Starting from ₹999 <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 w-40 h-36 opacity-90 group-hover:scale-110 transition-transform">
                  <CricketKitPromoSVG />
                </div>
              </div>

              {/* Tile 2 */}
              <div
                onClick={() => handleSelectCategory('Football')}
                className="bg-gradient-to-br from-emerald-700 to-teal-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all"
              >
                <div className="relative z-10 space-y-3 max-w-[200px]">
                  <span className="text-[10px] font-black tracking-wider uppercase bg-white/20 px-2.5 py-0.5 rounded-full border border-white/20">TRAINING GEAR</span>
                  <h3 className="text-xl font-black leading-tight">FOOTBALL TRAINING PACK</h3>
                  <p className="text-xs text-white/80 font-medium">Match Ball + Agility Cones + Pump</p>
                  <div className="pt-2">
                    <span className="bg-white text-emerald-800 font-black text-xs px-4 py-2 rounded-full inline-flex items-center gap-1 shadow-md group-hover:scale-105 transition-transform">
                      Shop Now <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 w-40 h-36 opacity-90 group-hover:scale-110 transition-transform">
                  <FootballPromoSVG />
                </div>
              </div>

              {/* Tile 3 */}
              <div
                onClick={() => handleSelectCategory('Fitness & Gym')}
                className="bg-gradient-to-br from-indigo-800 to-blue-950 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all"
              >
                <div className="relative z-10 space-y-3 max-w-[200px]">
                  <span className="text-[10px] font-black tracking-wider uppercase bg-white/20 px-2.5 py-0.5 rounded-full border border-white/20">WORKOUT ESSENTIALS</span>
                  <h3 className="text-xl font-black leading-tight">HOME GYM SETUP</h3>
                  <p className="text-xs text-white/80 font-medium">Dumbbells + Resistance Bands + Mat</p>
                  <div className="pt-2">
                    <span className="bg-white text-indigo-900 font-black text-xs px-4 py-2 rounded-full inline-flex items-center gap-1 shadow-md group-hover:scale-105 transition-transform">
                      Explore Gear <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 w-40 h-36 opacity-90 group-hover:scale-110 transition-transform">
                  <FitnessPromoSVG />
                </div>
              </div>
            </div>
          </section>

          {/* DEALS FOR YOU (DYNAMIC ACTIVE DISCOUNTS) */}
          {activeDiscountDeals.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-r from-red-900 via-[#990B11] to-[#E31B23] rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-4">
                  <div>
                    <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-amber-400 text-[#111827] text-xs font-black tracking-wider uppercase mb-1">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>LIMITED TIME OFFERS</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight">🔥 DEALS FOR YOU</h2>
                  </div>
                  <p className="text-xs text-white/80 font-semibold max-w-xs">
                    Hand-picked active discounts configured directly by Ronix Admin.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
                  {activeDiscountDeals.slice(0, 4).map((prod) => renderProductCard(prod))}
                </div>
              </div>
            </section>
          )}

          {/* BEST SELLERS */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-xs font-black text-[#E31B23] uppercase tracking-widest block">MOST POPULAR GEAR</span>
                <h2 className="text-2xl font-black text-[#111827] tracking-tight">🌟 Best Sellers</h2>
              </div>
              <button
                onClick={() => handleSelectCategory('All Gear')}
                className="text-xs font-bold text-[#E31B23] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Products</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
              {bestSellerProducts.map((prod) => renderProductCard(prod))}
            </div>
          </section>

          {/* TRENDING NOW (HORIZONTAL SCROLL) */}
          <section className="bg-slate-100/70 py-10 border-y border-slate-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-black text-[#E31B23] uppercase tracking-widest block">HOT THIS WEEK</span>
                  <h2 className="text-2xl font-black text-[#111827] tracking-tight">⚡ Trending Now</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 font-bold">Scroll right to explore &rarr;</span>
                </div>
              </div>

              <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
                {trendingProducts.map((prod) => (
                  <div key={prod.id} className="w-[200px] sm:w-[220px] shrink-0">
                    {renderProductCard(prod, true)}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CRICKET ESSENTIALS SECTION */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Promo Box */}
              <div className="lg:col-span-4 bg-gradient-to-br from-[#E31B23] to-[#800A0F] rounded-2xl p-6 text-white space-y-4 shadow-lg flex flex-col justify-between min-h-[300px]">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full border border-white/20">
                    SEASON SPECIAL
                  </span>
                  <h3 className="text-2xl font-black leading-tight">🏏 CRICKET ESSENTIALS</h3>
                  <p className="text-xs text-white/80 font-medium">
                    Built for every innings. Grade 1 Willows, Leather balls & match-ready armor.
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => handleSelectCategory('Cricket')}
                    className="w-full py-2.5 rounded-xl bg-white text-[#111827] font-black text-xs hover:bg-slate-100 transition-colors shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>View All Cricket Gear</span>
                    <ArrowRight className="w-4 h-4 text-[#E31B23]" />
                  </button>
                </div>
              </div>

              {/* Right Product Grid */}
              <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {cricketSectionProducts.map((prod) => renderProductCard(prod))}
              </div>
            </div>
          </section>

          {/* FOOTBALL FAVORITES SECTION */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-emerald-50/50 rounded-3xl border border-emerald-200/80 p-6 sm:p-8 space-y-6">
              <div className="flex items-end justify-between border-b border-emerald-200/80 pb-4">
                <div>
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-widest block">MATCH READY</span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">⚽ FOOTBALL FAVORITES</h2>
                </div>
                <button
                  onClick={() => handleSelectCategory('Football')}
                  className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Football</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
                {footballSectionProducts.map((prod) => renderProductCard(prod))}
              </div>
            </div>
          </section>

          {/* BADMINTON & FITNESS DUAL SECTIONS */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Badminton */}
              <div className="bg-sky-50/60 rounded-3xl border border-sky-200/80 p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-sky-200/80 pb-3">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">🏸 BADMINTON PICKS</h3>
                    <p className="text-xs text-slate-500 font-medium">Graphite Rackets & Feather Shuttles</p>
                  </div>
                  <button
                    onClick={() => handleSelectCategory('Badminton')}
                    className="text-xs font-bold text-sky-800 hover:underline cursor-pointer"
                  >
                    View All &rarr;
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {badmintonSectionProducts.slice(0, 2).map((prod) => renderProductCard(prod))}
                </div>
              </div>

              {/* Fitness */}
              <div className="bg-indigo-50/60 rounded-3xl border border-indigo-200/80 p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-indigo-200/80 pb-3">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">🏋 TRAINING ZONE</h3>
                    <p className="text-xs text-slate-500 font-medium">Dumbbells, Mats & Resistance Bands</p>
                  </div>
                  <button
                    onClick={() => handleSelectCategory('Fitness & Gym')}
                    className="text-xs font-bold text-indigo-800 hover:underline cursor-pointer"
                  >
                    View All &rarr;
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {fitnessSectionProducts.slice(0, 2).map((prod) => renderProductCard(prod))}
                </div>
              </div>
            </div>
          </section>
        </main>
      ) : activeTab === 'category' ? (
        /* CATEGORY & CATALOG VIEW WITH LEFT FILTERS */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {selectedCategory}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Showing {filteredProducts.length} items
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="md:hidden px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-xs"
              >
                <Filter className="w-4 h-4 text-[#E31B23]" />
                <span>Filters</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
              >
                <option value="popular">Sort: Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
            {/* Desktop Left Sidebar Filters */}
            <aside className="hidden md:block md:col-span-3 space-y-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs h-fit sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-[#E31B23]" />
                  Filter Gear
                </span>
                <button
                  onClick={() => {
                    setSelectedBrands([]);
                    setPriceRange({ min: '', max: '' });
                    setInStockOnly(false);
                    setSelectedSubtype('All');
                  }}
                  className="text-[11px] text-[#E31B23] font-bold hover:underline cursor-pointer"
                >
                  Reset
                </button>
              </div>

              {/* Subtype Chips */}
              <div className="space-y-2">
                <label className="font-bold text-xs text-slate-800 block">Subcategory / Variant</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedSubtype('All')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedSubtype === 'All'
                        ? 'bg-[#E31B23] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All Types
                  </button>
                  {getTypesForCategory(selectedCategory).map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedSubtype(st)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        selectedSubtype === st
                          ? 'bg-[#E31B23] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* In Stock Only */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded border-slate-300 text-[#E31B23] focus:ring-[#E31B23]"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="md:col-span-9">
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto text-[#E31B23]">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">No matching products found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try adjusting your search terms or filter selections.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All Gear');
                      setSelectedSubtype('All');
                      setSearchQuery('');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#E31B23] text-white font-bold text-xs shadow-xs hover:bg-[#B5121B] cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
                  {filteredProducts.map((prod) => renderProductCard(prod))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'my-orders' ? (
        /* MY ORDERS VIEW */
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900">My Orders</h1>
              <p className="text-xs text-slate-500 mt-0.5">Track recent purchases and order status</p>
            </div>
            <button
              onClick={() => setActiveTab('home')}
              className="text-xs font-bold text-[#E31B23] hover:underline cursor-pointer"
            >
              Back to Shop
            </button>
          </div>

          {customerOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No orders placed yet</h3>
              <p className="text-xs text-slate-400">Order items from the store to view status here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {customerOrders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
                    <div>
                      <span className="font-black text-slate-900">{ord.orderNumber}</span>
                      <span className="text-slate-400 ml-2 font-medium">{ord.date}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {ord.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-800 font-bold">{item.productName} &times; {item.quantity}</span>
                        <span className="text-slate-900 font-black">₹{item.subtotal?.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-900">
                    <span>Total Amount Charged:</span>
                    <span className="text-base font-black text-[#E31B23]">₹{ord.total?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ACCOUNT VIEW */
        <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-[#E31B23] text-white flex items-center justify-center font-black text-3xl mx-auto shadow-md">
              {profile?.full_name?.charAt(0) || 'C'}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">{profile?.full_name || 'Customer Account'}</h2>
              <p className="text-xs text-slate-500 font-medium">{profile?.email || 'customer@gmail.com'}</p>
              <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-red-50 text-[#E31B23] text-[10px] font-black uppercase tracking-wider">
                REGISTERED CUSTOMER
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-left text-xs font-semibold text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
                <span>Account Status:</span>
                <span className="text-emerald-600 font-bold">Active</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
                <span>Total Orders:</span>
                <span className="font-bold">{customerOrders.length} Orders</span>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-rose-600 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out Account</span>
            </button>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg flex justify-around items-center py-2 px-2">
        <button
          onClick={() => {
            setActiveTab('home');
            setSelectedCategory('All Gear');
            setSelectedSubtype('All');
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === 'home' ? 'text-[#E31B23]' : 'text-slate-500'
          }`}
        >
          <SparklesIcon className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('category');
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === 'category' ? 'text-[#E31B23]' : 'text-slate-500'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span>Categories</span>
        </button>

        <button
          onClick={() => setActiveTab('my-orders')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === 'my-orders' ? 'text-[#E31B23]' : 'text-slate-500'
          }`}
        >
          <Package className="w-5 h-5" />
          <span>Orders</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-500"
        >
          <ShoppingBag className="w-5 h-5" />
          {totalCartCount > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 bg-[#E31B23] text-white text-[9px] font-black rounded-full flex items-center justify-center">
              {totalCartCount}
            </span>
          )}
          <span>Cart</span>
        </button>

        <button
          onClick={() => setActiveTab('account')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === 'account' ? 'text-[#E31B23]' : 'text-slate-500'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span>Account</span>
        </button>
      </nav>

      {/* SHOPPING CART DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItemsList}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItemsList}
        onOrderSuccess={(orderInfo) => {
          setIsCheckoutOpen(false);
          setCart({});
          setActiveTab('my-orders');
        }}
      />
    </div>
  );
};

// Helper Sparkles Icon
function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}
