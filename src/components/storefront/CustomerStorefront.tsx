import React, { useState, useMemo } from 'react';
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
  ExternalLink,
  Flame,
  Check,
} from 'lucide-react';
import { useStore, normalizeCategory } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Product, CustomerOrder } from '../../types';
import { ProductImage } from '../ProductImage';
import { ProductDetailPage } from './ProductDetailPage';
import { CartDrawer, CartItemType } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import { getTypesForCategory } from '../../data/productTypes';

interface CustomerStorefrontProps {
  onBackToCRM?: () => void;
}

// Category Configuration with E-Commerce visual icons & counts
const CATEGORY_ITEMS = [
  { id: 'Cricket', label: 'Cricket', icon: '🏏', count: 12, desc: 'Bats, Balls & Protection' },
  { id: 'Football', label: 'Football', icon: '⚽', count: 8, desc: 'Balls, Studs & Training' },
  { id: 'Badminton', label: 'Badminton', icon: '🏸', count: 7, desc: 'Rackets, Shuttles & Grips' },
  { id: 'Table Tennis', label: 'Table Tennis', icon: '🏓', count: 4, desc: 'Bats, Balls & Nets' },
  { id: 'Volleyball', label: 'Volleyball', icon: '🏐', count: 2, desc: 'Match Balls & Nets' },
  { id: 'Basketball', label: 'Basketball', icon: '🏀', count: 3, desc: 'Balls, Shoes & Hoops' },
  { id: 'Fitness & Gym', label: 'Fitness & Gym', icon: '🏋', count: 8, desc: 'Weights, Mats & Bands' },
  { id: 'Sportswear & Accessories', label: 'Sportswear & Accessories', icon: '👕', count: 6, desc: 'Apparel, Shoes & Bags' },
];

export const CustomerStorefront: React.FC<CustomerStorefrontProps> = ({ onBackToCRM }) => {
  const {
    products = [],
    categories: storeCategories = [],
    inventory = {},
    customerOrders = [],
    placeCustomerOrder,
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

  const heroBanners = [
    {
      title: 'GEAR UP FOR CRICKET',
      subtitle: 'Professional English & Kashmir Willow bats, match balls & protective gear.',
      cta: 'Shop Cricket',
      category: 'Cricket',
      badge: 'TOP SELLER 2026',
      bgColor: 'from-red-600 to-red-800',
    },
    {
      title: 'FOOTBALL ESSENTIALS',
      subtitle: 'FIFA specification match balls, firm ground stud shoes & training gear.',
      cta: 'Shop Football',
      category: 'Football',
      badge: 'MATCH READY',
      bgColor: 'from-slate-800 to-slate-950',
    },
    {
      title: 'BUILD YOUR HOME GYM',
      subtitle: 'Hex dumbbells, kettlebells, resistance bands & non-slip yoga mats.',
      cta: 'Shop Fitness',
      category: 'Fitness & Gym',
      badge: 'FITNESS SPECIAL',
      bgColor: 'from-red-700 to-slate-900',
    },
  ];

  // Calculated Cart Items List
  const cartItemsList: CartItemType[] = useMemo(() => {
    return Object.entries(cart)
      .map(([prodId, qty]) => {
        const prod = products.find((p) => p.id === prodId);
        if (!prod || qty <= 0) return null;
        return { product: prod, quantity: qty };
      })
      .filter(Boolean) as CartItemType[];
  }, [cart, products]);

  const totalCartCount = useMemo(() => {
    return Object.values(cart).reduce((acc, qty) => acc + (qty > 0 ? qty : 0), 0);
  }, [cart]);

  // Handle Cart Operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + quantity,
    }));
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

  const handleBuyNow = (product: Product, quantity = 1) => {
    handleAddToCart(product, quantity);
    setIsCartOpen(true);
  };

  // Filtered Products for Catalog & Search View
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category check
      if (selectedCategory !== 'All Gear') {
        const pNorm = normalizeCategory(p.category);
        const sNorm = normalizeCategory(selectedCategory);
        if (pNorm !== sNorm && p.category !== selectedCategory) return false;
      }

      // Subtype check
      if (selectedSubtype !== 'All' && p.productType) {
        if (p.productType.toLowerCase() !== selectedSubtype.toLowerCase()) return false;
      }

      // Search query check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        const matchesType = p.productType?.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesCat && !matchesType && !matchesSku) {
          return false;
        }
      }

      // Brand filter
      if (selectedBrands.length > 0) {
        if (!selectedBrands.includes(p.brand)) return false;
      }

      // Price filter
      if (priceRange.min && p.retailPrice < parseFloat(priceRange.min)) return false;
      if (priceRange.max && p.retailPrice > parseFloat(priceRange.max)) return false;

      // Stock filter
      if (inStockOnly) {
        const inv = inventory[p.id];
        const avail = inv ? inv.onHand - inv.reserved : 0;
        if (avail <= 0) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.retailPrice - b.retailPrice;
      if (sortBy === 'price-high') return b.retailPrice - a.retailPrice;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [products, selectedCategory, selectedSubtype, searchQuery, selectedBrands, priceRange, inStockOnly, sortBy, inventory]);

  // Available brands for selected category
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (selectedCategory === 'All Gear' || normalizeCategory(p.category) === normalizeCategory(selectedCategory)) {
        if (p.brand) set.add(p.brand);
      }
    });
    return Array.from(set);
  }, [products, selectedCategory]);

  // Sub-types for selected category
  const availableSubtypes = useMemo(() => {
    if (selectedCategory === 'All Gear') return [];
    const predefined = getTypesForCategory(normalizeCategory(selectedCategory));
    const set = new Set<string>(predefined);
    products.forEach((p) => {
      if (normalizeCategory(p.category) === normalizeCategory(selectedCategory) && p.productType) {
        set.add(p.productType);
      }
    });
    return ['All', ...Array.from(set)];
  }, [selectedCategory, products]);

  // Category selection handler
  const handleSelectCategory = (catName: string) => {
    setSelectedCategory(catName);
    setSelectedSubtype('All');
    setActiveTab('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Place Order Handler
  const handleCompleteOrder = (customerData: {
    name: string;
    email: string;
    phone: string;
    address: string;
  }) => {
    if (cartItemsList.length === 0) return;

    const res = placeCustomerOrder({
      customerId: profile?.id || `cust-guest-${Date.now()}`,
      customerName: customerData.name,
      customerEmail: customerData.email,
      customerPhone: customerData.phone,
      shippingAddress: customerData.address,
      items: cartItemsList.map((it) => ({
        productId: it.product.id,
        quantity: it.quantity,
      })),
    });

    if (res.success && res.order) {
      setPlacedOrderSuccess(res.order);
      setCart({});
      setIsCheckoutOpen(false);
    } else {
      alert(res.error || 'Failed to place order.');
    }
  };

  // Render Product Card
  const renderProductCard = (product: Product) => {
    const inv = inventory[product.id];
    const availableStock = inv ? Math.max(0, inv.onHand - inv.reserved) : 0;
    const isOutOfStock = availableStock <= 0;
    const cartQty = cart[product.id] || 0;

    const mrp = product.mrp || Math.round(product.retailPrice * 1.25);
    const discountPercent = Math.round(((mrp - product.retailPrice) / mrp) * 100);

    return (
      <div
        key={product.id}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group relative"
      >
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full bg-[#E31B23] text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
            {discountPercent}% OFF
          </span>
        )}

        {/* Product Image Container */}
        <div
          onClick={() => setSelectedProduct(product)}
          className="relative aspect-square w-full bg-[#F8F9FA] p-4 flex items-center justify-center overflow-hidden cursor-pointer group-hover:bg-slate-100/60 transition-colors"
        >
          <ProductImage
            src={product.image}
            alt={product.name}
            category={product.category}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Product Info */}
        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                {product.brand}
              </span>
              {product.rating && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                </div>
              )}
            </div>

            <h3
              onClick={() => setSelectedProduct(product)}
              className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 hover:text-[#E31B23] transition-colors cursor-pointer leading-snug"
            >
              {product.name}
            </h3>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm sm:text-base font-black text-slate-900">
                  ₹{product.retailPrice.toLocaleString()}
                </span>
                {mrp > product.retailPrice && (
                  <span className="text-[11px] text-slate-400 line-through font-semibold">
                    ₹{mrp.toLocaleString()}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-emerald-600 font-bold block">Inclusive of GST</span>
            </div>

            {/* Cart Button / Controls */}
            {isOutOfStock ? (
              <span className="px-2.5 py-1 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-bold uppercase">
                Out of Stock
              </span>
            ) : cartQty > 0 ? (
              <div className="flex items-center border border-red-200 bg-red-50 rounded-xl overflow-hidden shadow-2xs">
                <button
                  onClick={() => handleUpdateCartQty(product.id, -1)}
                  className="px-2 py-1 text-[#E31B23] hover:bg-red-100 font-bold text-xs cursor-pointer"
                >
                  -
                </button>
                <span className="px-2 text-xs font-black text-slate-900">{cartQty}</span>
                <button
                  onClick={() => handleUpdateCartQty(product.id, 1)}
                  className="px-2 py-1 text-[#E31B23] hover:bg-red-100 font-bold text-xs cursor-pointer"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleAddToCart(product, 1)}
                className="px-3 py-1.5 bg-[#E31B23] hover:bg-[#B5121B] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111827] pb-24 lg:pb-12 font-sans antialiased selection:bg-[#E31B23] selection:text-white">
      {/* 1. DESKTOP HEADER (lg:flex) */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs hidden lg:block">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <div
            onClick={() => {
              setActiveTab('home');
              setSelectedCategory('All Gear');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 bg-[#E31B23] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xs group-hover:bg-[#B5121B] transition-colors">
              R
            </div>
            <div>
              <span className="text-[#111827] font-black text-base tracking-tight leading-none block">
                RONIX <span className="text-[#E31B23]">SPORTS</span>
              </span>
              <span className="text-[9px] text-[#6B7280] font-bold tracking-widest uppercase block mt-0.5">
                Official E-Commerce Store
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'category') setActiveTab('category');
                }}
                placeholder="Search Cricket bats, Footballs, Badminton rackets, Dumbbells..."
                className="w-full pl-10 pr-10 py-2 bg-slate-100 hover:bg-slate-200/60 focus:bg-white border border-transparent focus:border-[#E31B23] rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => {
                setActiveTab('home');
                setSelectedCategory('All Gear');
              }}
              className={`text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'home' ? 'text-[#E31B23]' : 'text-slate-700 hover:text-[#E31B23]'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => {
                setActiveTab('category');
                setSelectedCategory('All Gear');
              }}
              className={`text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'category' ? 'text-[#E31B23]' : 'text-slate-700 hover:text-[#E31B23]'
              }`}
            >
              Categories
            </button>

            <button
              onClick={() => setActiveTab('my-orders')}
              className={`text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'my-orders' ? 'text-[#E31B23]' : 'text-slate-700 hover:text-[#E31B23]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Orders</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-[#E31B23] border border-red-200 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-2xs relative"
            >
              <ShoppingBag className="w-4 h-4 text-[#E31B23]" />
              <span>Cart</span>
              {totalCartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#E31B23] text-white text-[10px] font-black flex items-center justify-center shadow-2xs">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Account / User Menu */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <button
                onClick={() => setActiveTab('account')}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                title="Account Settings"
              >
                <UserIcon className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MOBILE HEADER (lg:hidden) */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs lg:hidden p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div
            onClick={() => {
              setActiveTab('home');
              setSelectedCategory('All Gear');
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 bg-[#E31B23] rounded-lg flex items-center justify-center text-white font-black text-lg shadow-2xs">
              R
            </div>
            <span className="text-[#111827] font-black text-sm tracking-tight">
              RONIX <span className="text-[#E31B23]">SPORTS</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 rounded-xl bg-red-50 text-[#E31B23] border border-red-200 font-bold text-xs relative cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E31B23] text-white text-[9px] font-black flex items-center justify-center shadow-2xs">
                  {totalCartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
            >
              <UserIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeTab !== 'category') setActiveTab('category');
            }}
            placeholder="Search Ronix Sports equipment..."
            className="w-full pl-10 pr-9 py-2 bg-slate-100 border border-transparent focus:border-[#E31B23] focus:bg-white rounded-xl text-xs font-semibold text-slate-900 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 font-bold text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      {/* 3. MAIN WORKSPACE AREA */}
      <main className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        {/* ACTIVE TAB = HOME */}
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* HERO PROMOTIONAL CAROUSEL BANNER */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-600 via-red-700 to-slate-950 text-white p-6 sm:p-10 shadow-lg min-h-[220px] sm:min-h-[260px] flex flex-col justify-between">
              <div className="relative z-10 max-w-2xl space-y-2">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest border border-white/20">
                  {heroBanners[heroIndex].badge}
                </span>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  {heroBanners[heroIndex].title}
                </h1>
                <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
                  {heroBanners[heroIndex].subtitle}
                </p>
              </div>

              <div className="relative z-10 pt-4 flex items-center justify-between">
                <button
                  onClick={() => handleSelectCategory(heroBanners[heroIndex].category)}
                  className="px-6 py-2.5 bg-white hover:bg-slate-100 text-[#E31B23] rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95"
                >
                  {heroBanners[heroIndex].cta} →
                </button>

                {/* Carousel Indicators */}
                <div className="flex gap-1.5">
                  {heroBanners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setHeroIndex(i)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        heroIndex === i ? 'w-6 bg-white' : 'w-2 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* SHOP BY SPORT (HORIZONTAL SCROLLABLE CATEGORY CARDS) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>SHOP BY SPORT</span>
                  </h2>
                  <p className="text-xs text-slate-500">Explore authentic gear tailored for your game</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory('All Gear');
                    setActiveTab('category');
                  }}
                  className="text-xs font-bold text-[#E31B23] hover:underline cursor-pointer"
                >
                  View All Gear →
                </button>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
                {CATEGORY_ITEMS.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className="flex-none w-36 sm:w-44 bg-white hover:bg-red-50/50 p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer snap-start flex flex-col justify-between group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-red-50 group-hover:bg-[#E31B23] text-xl flex items-center justify-center transition-colors mb-3">
                      <span>{cat.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-[#E31B23] transition-colors">
                        {cat.label}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5 truncate">{cat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TOP PICKS FOR YOU (6-8 FEATURED PRODUCTS) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#E31B23]" />
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    TOP PICKS FOR YOU
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
                {products.slice(0, 8).map((p) => renderProductCard(p))}
              </div>
            </div>

            {/* DEALS FOR YOU BANNER & SECTION */}
            <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200/80 rounded-3xl p-5 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="px-2.5 py-0.5 bg-[#E31B23] text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                    SPECIAL SAVINGS
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">DEALS FOR YOU</h2>
                  <p className="text-xs text-slate-600">Exclusive pricing on top-tier training and match equipment</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {products.filter((p) => p.isFeatured || p.isBestSeller).slice(0, 4).map((p) => renderProductCard(p))}
              </div>
            </div>

            {/* CRICKET ESSENTIALS SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>🏏 CRICKET ESSENTIALS</span>
                </h3>
                <button
                  onClick={() => handleSelectCategory('Cricket')}
                  className="text-xs font-bold text-[#E31B23] hover:underline cursor-pointer"
                >
                  See all Cricket ({CATEGORY_ITEMS.find((c) => c.id === 'Cricket')?.count || 12}) →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
                {products.filter((p) => normalizeCategory(p.category) === 'cricket').slice(0, 4).map((p) => renderProductCard(p))}
              </div>
            </div>

            {/* FOOTBALL FAVORITES SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>⚽ FOOTBALL FAVORITES</span>
                </h3>
                <button
                  onClick={() => handleSelectCategory('Football')}
                  className="text-xs font-bold text-[#E31B23] hover:underline cursor-pointer"
                >
                  See all Football ({CATEGORY_ITEMS.find((c) => c.id === 'Football')?.count || 8}) →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
                {products.filter((p) => normalizeCategory(p.category) === 'football').slice(0, 4).map((p) => renderProductCard(p))}
              </div>
            </div>

            {/* BADMINTON COLLECTION SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>🏸 BADMINTON COLLECTION</span>
                </h3>
                <button
                  onClick={() => handleSelectCategory('Badminton')}
                  className="text-xs font-bold text-[#E31B23] hover:underline cursor-pointer"
                >
                  See all Badminton ({CATEGORY_ITEMS.find((c) => c.id === 'Badminton')?.count || 7}) →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
                {products.filter((p) => normalizeCategory(p.category) === 'badminton').slice(0, 4).map((p) => renderProductCard(p))}
              </div>
            </div>

            {/* FITNESS & TRAINING SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>🏋 FITNESS & TRAINING</span>
                </h3>
                <button
                  onClick={() => handleSelectCategory('Fitness & Gym')}
                  className="text-xs font-bold text-[#E31B23] hover:underline cursor-pointer"
                >
                  See all Fitness ({CATEGORY_ITEMS.find((c) => c.id === 'Fitness & Gym')?.count || 8}) →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
                {products.filter((p) => normalizeCategory(p.category) === 'fitness').slice(0, 4).map((p) => renderProductCard(p))}
              </div>
            </div>

            {/* SPORTSWEAR & ACCESSORIES SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>👕 SPORTSWEAR & ACCESSORIES</span>
                </h3>
                <button
                  onClick={() => handleSelectCategory('Sportswear & Accessories')}
                  className="text-xs font-bold text-[#E31B23] hover:underline cursor-pointer"
                >
                  See all Sportswear ({CATEGORY_ITEMS.find((c) => c.id === 'Sportswear & Accessories')?.count || 6}) →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
                {products.filter((p) => normalizeCategory(p.category) === 'sportswear').slice(0, 4).map((p) => renderProductCard(p))}
              </div>
            </div>

            {/* FOOTER ASSURANCE & PROOF */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-black text-sm text-slate-900">100% Original Equipment</h4>
                <p className="text-xs text-slate-500">Directly sourced from SG, SS, Nivia, Yonex, Cosco & Stag.</p>
              </div>

              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
                <h4 className="font-black text-sm text-slate-900">Express India Delivery</h4>
                <p className="text-xs text-slate-500">Fast dispatch with real-time tracking to your doorstep.</p>
              </div>

              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <h4 className="font-black text-sm text-slate-900">Hassle-Free Returns</h4>
                <p className="text-xs text-slate-500">Easy replacement guarantee for damaged or wrong sizes.</p>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE TAB = CATEGORY / CATALOG */}
        {activeTab === 'category' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Category Page Title Header */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {selectedCategory}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#E31B23] text-xs font-bold border border-red-200">
                    Showing {filteredProducts.length} of {products.length} Products
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Filter by sport, sub-category, brand, and price range.
                </p>
              </div>

              {/* Mobile Filter & Sort Triggers */}
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5 text-[#E31B23]" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Horizontal Category Selector Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => {
                  setSelectedCategory('All Gear');
                  setSelectedSubtype('All');
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === 'All Gear'
                    ? 'bg-[#E31B23] text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Gear ({products.length})
              </button>
              {CATEGORY_ITEMS.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubtype('All');
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-[#E31B23] text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label} ({cat.count})</span>
                </button>
              ))}
            </div>

            {/* Horizontal Subtype Chips (if available) */}
            {availableSubtypes.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none bg-slate-100/70 p-2 rounded-2xl border border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-2 shrink-0">Subtype:</span>
                {availableSubtypes.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubtype(sub)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedSubtype === sub
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}

            {/* Main Grid + Sidebar Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* DESKTOP LEFT FILTER SIDEBAR (lg:block) */}
              <div className="hidden lg:block lg:col-span-3 space-y-5">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-5 sticky top-20">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-black text-slate-900 text-xs flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-[#E31B23]" />
                      <span>FILTERS</span>
                    </h3>
                    {(selectedBrands.length > 0 || priceRange.min || priceRange.max || inStockOnly) && (
                      <button
                        onClick={() => {
                          setSelectedBrands([]);
                          setPriceRange({ min: '', max: '' });
                          setInStockOnly(false);
                        }}
                        className="text-[10px] font-bold text-[#E31B23] hover:underline cursor-pointer"
                      >
                        Reset All
                      </button>
                    )}
                  </div>

                  {/* Brand Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">Brand</label>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {availableBrands.map((b) => (
                        <label key={b} className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 hover:text-slate-900">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(b)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedBrands([...selectedBrands, b]);
                              else setSelectedBrands(selectedBrands.filter((item) => item !== b));
                            }}
                            className="w-3.5 h-3.5 rounded text-[#E31B23] focus:ring-[#E31B23] cursor-pointer"
                          />
                          <span className="font-semibold">{b}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">Price (₹)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Availability Filter */}
                  <div className="pt-3 border-t border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-800 font-bold">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-[#E31B23] focus:ring-[#E31B23] cursor-pointer"
                      />
                      <span>In Stock Only</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* PRODUCT GRID (lg:col-span-9) */}
              <div className="lg:col-span-9 space-y-4">
                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center mx-auto">
                      <Search className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-black text-slate-900">No Products Found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      We couldn't find any products matching your selected search or filter criteria.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All Gear');
                        setSelectedSubtype('All');
                        setSelectedBrands([]);
                        setPriceRange({ min: '', max: '' });
                        setInStockOnly(false);
                      }}
                      className="px-4 py-2 bg-[#E31B23] text-white font-bold text-xs rounded-xl shadow-2xs cursor-pointer"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
                    {filteredProducts.map((p) => renderProductCard(p))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE TAB = MY ORDERS */}
        {activeTab === 'my-orders' && (
          <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Package className="w-5 h-5 text-[#E31B23]" />
                <span>MY ORDERS</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">Track and review your recent equipment purchases</p>
            </div>

            {customerOrders.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-slate-900">No Orders Yet</h3>
                <p className="text-xs text-slate-500">You haven't placed any sports equipment orders yet.</p>
                <button
                  onClick={() => {
                    setActiveTab('home');
                    setSelectedCategory('All Gear');
                  }}
                  className="px-4 py-2 bg-[#E31B23] text-white font-bold text-xs rounded-xl shadow-2xs cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {customerOrders.map((ord) => (
                  <div key={ord.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                      <div>
                        <span className="font-mono font-black text-xs text-slate-900 block">{ord.orderNumber || ord.id}</span>
                        <span className="text-[11px] text-slate-500">{new Date(ord.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : ord.status === 'Shipped'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {ord.status}
                        </span>
                        <span className="text-sm font-black text-slate-900">₹{ord.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800">
                            {it.productName} × <strong className="text-slate-900">{it.quantity}</strong>
                          </span>
                          <span className="font-mono font-bold text-slate-700">₹{(it.unitPrice * it.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ACTIVE TAB = ACCOUNT */}
        {activeTab === 'account' && (
          <div className="space-y-6 max-w-md mx-auto animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#E31B23] text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md">
                {profile?.full_name ? profile.full_name[0].toUpperCase() : 'U'}
              </div>

              <div>
                <h2 className="text-base font-black text-slate-900">{profile?.full_name || 'Customer Account'}</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{profile?.email || 'customer@gmail.com'}</p>
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-red-50 text-[#E31B23] border border-red-200 text-[10px] font-black uppercase tracking-wider">
                  Verified Customer Account
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  onClick={async () => {
                    await signOut();
                    window.location.href = '/login';
                  }}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-[#E31B23] font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Store</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. MOBILE STICKY BOTTOM NAVIGATION (lg:hidden) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg lg:hidden px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => {
            setActiveTab('home');
            setSelectedCategory('All Gear');
          }}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'home' ? 'text-[#E31B23]' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className="text-base leading-none">⌂</span>
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('category');
            setSelectedCategory('All Gear');
          }}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'category' ? 'text-[#E31B23]' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className="text-base leading-none">▦</span>
          <span className="text-[10px] font-bold mt-0.5">Categories</span>
        </button>

        <button
          onClick={() => setActiveTab('my-orders')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'my-orders' ? 'text-[#E31B23]' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className="text-base leading-none">▣</span>
          <span className="text-[10px] font-bold mt-0.5">Orders</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center py-1 px-3 rounded-xl text-slate-500 hover:text-slate-900 transition-all cursor-pointer relative"
        >
          <span className="text-base leading-none">🛒</span>
          <span className="text-[10px] font-bold mt-0.5">Cart</span>
          {totalCartCount > 0 && (
            <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-[#E31B23] text-white text-[9px] font-black flex items-center justify-center shadow-2xs">
              {totalCartCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('account')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'account' ? 'text-[#E31B23]' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className="text-base leading-none">◯</span>
          <span className="text-[10px] font-bold mt-0.5">Account</span>
        </button>
      </nav>

      {/* 5. PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <ProductDetailPage
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
          onAddToCart={(prod, qty) => handleAddToCart(prod, qty)}
          onBuyNow={(prod, qty) => handleBuyNow(prod, qty)}
          onSelectProduct={(prod) => setSelectedProduct(prod)}
        />
      )}

      {/* 6. CART DRAWER */}
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

      {/* 7. CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItemsList}
        onCompleteOrder={handleCompleteOrder}
      />

      {/* 8. ORDER SUCCESS MODAL */}
      {placedOrderSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Order Placed Successfully!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Thank you for your order. Your items are being prepared for dispatch.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left font-mono text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Ref:</span>
                <span className="font-bold text-slate-900">{placedOrderSuccess.orderNumber || placedOrderSuccess.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Paid:</span>
                <span className="font-bold text-slate-900">₹{placedOrderSuccess.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setPlacedOrderSuccess(null);
                  setActiveTab('my-orders');
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                View My Orders
              </button>
              <button
                onClick={() => {
                  setPlacedOrderSuccess(null);
                  setActiveTab('home');
                }}
                className="flex-1 py-2.5 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold text-xs rounded-xl shadow-2xs cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
