import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  User as UserIcon,
  X,
  Filter,
  SlidersHorizontal,
  Star,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  LogOut,
  Package,
  Tag,
  Zap,
  CheckCircle2,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Flame,
  Heart,
  Eye,
  ShieldCheck,
  Headphones,
  Lock,
  Award,
  Users,
  Trophy,
  Truck,
  Dumbbell,
  Target,
  Shield,
} from 'lucide-react';
import { useStore, normalizeCategory } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Product, CustomerOrder, getEffectiveProductPrice } from '../../types';
import { ProductImage } from '../ProductImage';
import { ProductDetailPage } from './ProductDetailPage';
import { CartDrawer, CartItemType } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import { getTypesForCategory } from '../../data/productTypes';
import { SportsCategoryCarousel, CategorySlideData } from '../ui/sports-category-carousel';
import { PasswordChangeModal } from '../auth/PasswordChangeModal';

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

  // Account Menu Popup & Password Change State
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filters State
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');

  // Hero Banners Carousel Index
  const [heroIndex, setHeroIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);

  const heroSlides = [
    {
      badge: 'SEASON PICKS',
      headline: 'PLAY HARD. GEAR SMART.',
      subtext: 'Cricket, Football, Badminton, Fitness & more.',
      cta: 'Shop Now',
      category: 'All Gear',
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80',
      bg: 'bg-gradient-to-r from-[#111827] via-[#990B11] to-[#E31B23]',
    },
    {
      badge: 'CRICKET SEASON',
      headline: 'MASTER THE CREASE.',
      subtext: 'English Willow Bats • Match Leather Balls • Protective Gear',
      cta: 'Shop Cricket',
      category: 'Cricket',
      image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80',
      bg: 'bg-gradient-to-r from-[#1E293B] via-[#7F1D1D] to-[#E31B23]',
    },
    {
      badge: 'FOOTBALL ESSENTIALS',
      headline: 'DOMINATE THE PITCH.',
      subtext: 'Pro Match Balls • Turf Studs • Training Accessories',
      cta: 'Shop Football',
      category: 'Football',
      image: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=800&auto=format&fit=crop&q=80',
      bg: 'bg-gradient-to-r from-[#064E3B] via-[#0F766E] to-[#0284C7]',
    },
    {
      badge: 'FITNESS & TRAINING',
      headline: 'BUILD YOUR STRENGTH.',
      subtext: 'Hex Dumbbells • Kettlebells • Mats • Resistance Gear',
      cta: 'Shop Fitness',
      category: 'Fitness & Gym',
      image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
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

  // Categories definition with raster product photos
  const categoriesList = [
    { name: 'Cricket', count: 12, desc: 'Bats, Balls & Protection', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&auto=format&fit=crop&q=80', bgTint: 'bg-red-50/60' },
    { name: 'Football', count: 8, desc: 'Balls, Studs & Training', image: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=400&auto=format&fit=crop&q=80', bgTint: 'bg-emerald-50/60' },
    { name: 'Badminton', count: 7, desc: 'Rackets, Shuttles & Grips', image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&auto=format&fit=crop&q=80', bgTint: 'bg-sky-50/60' },
    { name: 'Table Tennis', count: 4, desc: 'Bats, Balls & Nets', image: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=400&auto=format&fit=crop&q=80', bgTint: 'bg-amber-50/60' },
    { name: 'Volleyball', count: 2, desc: 'Match Balls & Nets', image: 'https://images.unsplash.com/photo-1592656094267-764a45160876?w=400&auto=format&fit=crop&q=80', bgTint: 'bg-blue-50/60' },
    { name: 'Basketball', count: 3, desc: 'Balls, Shoes & Hoops', image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400&auto=format&fit=crop&q=80', bgTint: 'bg-orange-50/60' },
    { name: 'Fitness & Gym', count: 8, desc: 'Weights, Mats & Bands', image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&auto=format&fit=crop&q=80', bgTint: 'bg-indigo-50/60' },
    { name: 'Sportswear & Accessories', count: 6, desc: 'Apparel, Shoes & Bags', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80', bgTint: 'bg-purple-50/60' },
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
    return products.filter((p) => ['Cricket', 'Bats', 'Balls', 'Helmets', 'Gloves', 'Pads'].includes(p.category) || ['Cricket', 'Bats', 'Balls', 'Helmets', 'Gloves', 'Pads'].includes(normalizeCategory(p.category))).slice(0, 8);
  }, [products]);

  const footballSectionProducts = useMemo(() => {
    return products.filter((p) => p.category === 'Football' || normalizeCategory(p.category) === 'Football').slice(0, 8);
  }, [products]);

  const badmintonSectionProducts = useMemo(() => {
    return products.filter((p) => p.category === 'Badminton' || normalizeCategory(p.category) === 'Badminton').slice(0, 8);
  }, [products]);

  const fitnessSectionProducts = useMemo(() => {
    return products.filter((p) => p.category === 'Fitness' || p.category === 'Fitness & Gym' || normalizeCategory(p.category) === 'Fitness').slice(0, 8);
  }, [products]);

  const sportswearSectionProducts = useMemo(() => {
    return products.filter((p) => ['Footwear', 'Bags', 'Accessories', 'Sportswear & Accessories', 'Apparel'].includes(p.category) || ['Footwear', 'Bags', 'Accessories'].includes(normalizeCategory(p.category))).slice(0, 8);
  }, [products]);

  const [bookSlideIndex, setBookSlideIndex] = useState(0);
  const trendingScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollTrending = (dir: 'left' | 'right') => {
    if (trendingScrollRef.current) {
      const scrollAmount = dir === 'left' ? -320 : 320;
      trendingScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleLogoClick = () => {
    setActiveTab('home');
    setSelectedCategory('All Gear');
    setSelectedSubtype('All');
    setSearchQuery('');
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const bookSlides = useMemo<CategorySlideData[]>(() => [
    {
      id: 'football',
      title: 'FOOTBALL FAVORITES',
      category: 'Football',
      badge: 'MATCH READY GEAR',
      desc: 'Match-ready footballs, stud shoes, goalkeeper gloves, and agility training gear.',
      products: footballSectionProducts.slice(0, 2),
      bgTint: 'bg-emerald-50/70',
      badgeStyle: 'text-emerald-800 bg-emerald-100 border-emerald-300',
      buttonStyle: 'bg-emerald-700 hover:bg-emerald-800 text-white',
      accentBorder: 'border-emerald-200/90',
    },
    {
      id: 'badminton',
      title: 'BADMINTON ESSENTIALS',
      category: 'Badminton',
      badge: 'PRO PERFORMANCE',
      desc: 'Rackets, shuttlecocks, grips, nets, and training accessories for every rally.',
      products: badmintonSectionProducts.slice(0, 2),
      bgTint: 'bg-sky-50/70',
      badgeStyle: 'text-sky-800 bg-sky-100 border-sky-300',
      buttonStyle: 'bg-sky-700 hover:bg-sky-800 text-white',
      accentBorder: 'border-sky-200/90',
    },
    {
      id: 'fitness',
      title: 'FITNESS & GYM GEAR',
      category: 'Fitness & Gym',
      badge: 'WORKOUT READY',
      desc: 'Dumbbells, resistance bands, mats, and essential home workout equipment.',
      products: fitnessSectionProducts.slice(0, 2),
      bgTint: 'bg-indigo-50/70',
      badgeStyle: 'text-indigo-800 bg-indigo-100 border-indigo-300',
      buttonStyle: 'bg-indigo-700 hover:bg-indigo-800 text-white',
      accentBorder: 'border-indigo-200/90',
    },
    {
      id: 'sportswear',
      title: 'SPORTSWEAR & ACCESSORIES',
      category: 'Sportswear & Accessories',
      badge: 'ATHLETIC WEAR & GEAR',
      desc: 'Performance apparel, kit bags, socks, caps, and everyday sports essentials.',
      products: sportswearSectionProducts.slice(0, 2),
      bgTint: 'bg-purple-50/70',
      badgeStyle: 'text-purple-800 bg-purple-100 border-purple-300',
      buttonStyle: 'bg-purple-700 hover:bg-purple-800 text-white',
      accentBorder: 'border-purple-200/90',
    },
  ], [footballSectionProducts, badmintonSectionProducts, fitnessSectionProducts, sportswearSectionProducts]);

  // Handle Category click
  const handleSelectCategory = (catName: string) => {
    setSelectedCategory(catName);
    setSelectedSubtype('All');
    setActiveTab('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render Product Card
  const renderProductCard = (prod: Product) => {
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
        <div className="relative aspect-square w-full bg-slate-50/60 p-3 sm:p-4 flex items-center justify-center border-b border-slate-100 overflow-hidden">
          {/* Discount Badge */}
          {discInfo.hasDiscount && (
            <div className="absolute top-2 left-2 z-10">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E31B23] text-white shadow-2xs">
                {discInfo.discountLabel}
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => toggleWishlist(prod.id, e)}
            className="absolute top-2 right-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#E31B23] hover:scale-110 transition-all shadow-xs"
            title="Add to Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-[#E31B23] text-[#E31B23]' : ''}`} />
          </button>

          {/* Product Image */}
          <ProductImage
            src={prod.image_url || prod.image}
            alt={prod.name}
            category={prod.category}
            name={prod.name}
            product={prod}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
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
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-semibold mb-0.5">
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
              <div className="flex items-baseline gap-1">
                <span className="text-sm sm:text-base font-black text-slate-900">
                  ₹{discInfo.finalPrice.toLocaleString('en-IN')}
                </span>
                {discInfo.hasDiscount && (
                  <span className="text-[11px] text-slate-400 line-through font-medium">
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

            {/* Add to Cart button */}
            <button
              onClick={(e) => handleAddToCart(prod, 1, e)}
              disabled={isOutOfStock}
              className={`w-full py-1.5 sm:py-2 px-3 rounded-xl font-black text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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

  // Render Product Section Grid dynamically based on item count
  const renderProductSectionGrid = (productList: Product[]) => (
    <ProductSectionGrid
      productList={productList}
      onSelectProduct={(prod) => {
        setSelectedProduct(prod);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      onAddToCart={handleAddToCart}
      inventory={inventory}
      wishlist={wishlist}
      onToggleWishlist={toggleWishlist}
    />
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-16 md:pb-0 overflow-x-hidden">
      {/* CLEAN BRIGHT STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md text-slate-900 border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* DESKTOP HEADER LAYOUT */}
          <div className="hidden md:flex items-center justify-between gap-6">
            {/* Logo + Brand Name */}
            <div
              onClick={handleLogoClick}
              className="flex items-center space-x-3 cursor-pointer shrink-0 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E31B23] flex items-center justify-center text-white font-black text-xl shadow-sm group-hover:scale-105 transition-transform">
                R
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 block leading-none">
                  RONIX <span className="text-[#E31B23]">SPORTS</span>
                </span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mt-0.5">
                  PERFORMANCE STORE
                </span>
              </div>
            </div>

            {/* Desktop Search Bar (Centered) */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim() && activeTab !== 'category') {
                    setActiveTab('category');
                  }
                }}
                placeholder="Search equipment, gear, sports..."
                className="w-full pl-9 pr-8 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E31B23] focus:bg-white focus:border-transparent transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Desktop Right Controls (Cart, Profile) */}
            <div className="flex items-center space-x-3 shrink-0">
              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-800 hover:text-[#E31B23] border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 px-3.5"
                title="View Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4 text-[#E31B23]" />
                <span className="text-xs font-bold">Cart</span>
                {totalCartCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-[#E31B23] text-white text-[10px] font-black rounded-full shadow-2xs">
                    {totalCartCount}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                  className="flex items-center space-x-2 p-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                >
                  <div className="w-6 h-6 rounded-full bg-[#E31B23] text-white flex items-center justify-center font-black text-xs">
                    {profile?.full_name?.charAt(0) || 'R'}
                  </div>
                  <span className="font-extrabold text-slate-800">Profile</span>
                </button>

                {showAccountDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-black text-slate-900 truncate">{profile?.full_name || 'Rahul'}</p>
                      <p className="text-[10px] text-slate-500 truncate">{profile?.email || 'customer@gmail.com'}</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('account');
                        setShowAccountDropdown(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer flex items-center justify-between"
                    >
                      <span>Address Management</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('my-orders');
                        setShowAccountDropdown(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer flex items-center justify-between"
                    >
                      <span>My Orders</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('account');
                        setShowAccountDropdown(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer flex items-center justify-between"
                    >
                      <span>Saved Items / Wishlist</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('account');
                        setShowAccountDropdown(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer flex items-center justify-between"
                    >
                      <span>Account Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAccountDropdown(false);
                        setIsPasswordModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer flex items-center gap-2"
                    >
                      <Lock className="w-3.5 h-3.5 text-[#E31B23]" />
                      <span>Security / Change Password</span>
                    </button>
                    {onBackToCRM && (
                      <button
                        onClick={() => {
                          setShowAccountDropdown(false);
                          onBackToCRM();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-[#E31B23] hover:bg-red-50 cursor-pointer border-t border-slate-100"
                      >
                        <span>Admin CRM</span>
                      </button>
                    )}
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border-t border-slate-100 cursor-pointer flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MOBILE HEADER LAYOUT */}
          <div className="md:hidden space-y-2.5">
            <div className="flex items-center justify-between">
              <div
                onClick={handleLogoClick}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#E31B23] flex items-center justify-center text-white font-black text-lg shadow-xs">
                  R
                </div>
                <div>
                  <span className="text-base font-black tracking-tight text-slate-900 block leading-none">
                    RONIX <span className="text-[#E31B23]">SPORTS</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#E31B23]" />
                  {totalCartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E31B23] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {totalCartCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setActiveTab('account');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center space-x-1.5 p-1 px-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold cursor-pointer border border-slate-200"
                >
                  <div className="w-5 h-5 rounded-full bg-[#E31B23] text-white flex items-center justify-center font-black text-[10px]">
                    {profile?.full_name?.charAt(0) || 'R'}
                  </div>
                  <span className="font-bold">Profile</span>
                </button>
              </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="relative">
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
                className="w-full pl-9 pr-8 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
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
          {/* BRIGHT OFF-WHITE PREMIUM HERO */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
            <div className="relative rounded-3xl overflow-hidden shadow-sm bg-gradient-to-br from-slate-50 via-white to-red-50/20 text-slate-900 border border-slate-200/90 min-h-[440px] md:min-h-[480px] flex items-center">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 lg:p-12 w-full items-center relative z-10">
                {/* Left Content Column */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Eyebrow */}
                  <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-black tracking-widest text-[#E31B23] uppercase shadow-2xs">
                    <Trophy className="w-3.5 h-3.5 text-[#E31B23]" />
                    <span>RONIX SPORTS STORE</span>
                  </div>

                  {/* Heading */}
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none uppercase text-slate-900">
                    GEAR FOR EVERY <br className="hidden sm:inline" />
                    <span className="text-[#E31B23]">GAME.</span>
                  </h1>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-slate-600 font-medium max-w-xl leading-relaxed">
                    Match-ready equipment, pro supplies, and training essentials for athletes and academies.
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-wrap items-center gap-3.5 pt-1">
                    <button
                      onClick={() => {
                        handleSelectCategory('All Gear');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-7 py-3.5 rounded-xl bg-[#E31B23] hover:bg-[#B5121B] text-white font-black text-xs sm:text-sm shadow-md shadow-red-500/20 transition-all cursor-pointer flex items-center gap-2 group active:scale-95"
                    >
                      <span>Shop All Gear</span>
                      <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('category');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-extrabold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                    >
                      <span>Explore Categories</span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>

                  {/* Compact Credibility Stats */}
                  <div className="pt-4 border-t border-slate-200/80 grid grid-cols-3 gap-3 max-w-lg">
                    <div className="flex items-center space-x-2 text-slate-700">
                      <ShieldCheck className="w-4 h-4 text-[#E31B23] shrink-0" />
                      <span className="text-[11px] sm:text-xs font-bold leading-tight">Quality Tested</span>
                    </div>

                    <div className="flex items-center space-x-2 text-slate-700">
                      <Award className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-[11px] sm:text-xs font-bold leading-tight">Bulk B2B Pricing</span>
                    </div>

                    <div className="flex items-center space-x-2 text-slate-700">
                      <Truck className="w-4 h-4 text-sky-500 shrink-0" />
                      <span className="text-[11px] sm:text-xs font-bold leading-tight">Fast Dispatch</span>
                    </div>
                  </div>
                </div>

                {/* Right Equipment Visual Composition (NO Humans/Models) */}
                <div className="lg:col-span-5 hidden lg:flex flex-col items-center justify-center relative">
                  <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-5 shadow-lg space-y-4 relative overflow-hidden group">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        PRO EQUIPMENT MATRIX
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#E31B23] border border-red-200">
                        100% GENUINE
                      </span>
                    </div>

                    {/* 2x2 Clean Studio Equipment Composition */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50/80 rounded-2xl p-2.5 h-28 flex flex-col items-center justify-center border border-slate-200/80 relative shadow-2xs hover:scale-105 transition-transform duration-300">
                        <img
                          src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400&auto=format&fit=crop&q=80"
                          alt="Cricket Bat"
                          className="w-full h-20 object-contain"
                          loading="lazy"
                        />
                        <span className="text-[10px] font-black text-slate-800 mt-1">Cricket Bat</span>
                      </div>

                      <div className="bg-slate-50/80 rounded-2xl p-2.5 h-28 flex flex-col items-center justify-center border border-slate-200/80 relative shadow-2xs hover:scale-105 transition-transform duration-300">
                        <img
                          src="https://images.unsplash.com/photo-1614632537190-23e4146777db?w=400&auto=format&fit=crop&q=80"
                          alt="Pro Football"
                          className="w-full h-20 object-contain"
                          loading="lazy"
                        />
                        <span className="text-[10px] font-black text-slate-800 mt-1">Match Football</span>
                      </div>

                      <div className="bg-slate-50/80 rounded-2xl p-2.5 h-28 flex flex-col items-center justify-center border border-slate-200/80 relative shadow-2xs hover:scale-105 transition-transform duration-300">
                        <img
                          src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&auto=format&fit=crop&q=80"
                          alt="Badminton Racket"
                          className="w-full h-20 object-contain"
                          loading="lazy"
                        />
                        <span className="text-[10px] font-black text-slate-800 mt-1">Pro Racket</span>
                      </div>

                      <div className="bg-slate-50/80 rounded-2xl p-2.5 h-28 flex flex-col items-center justify-center border border-slate-200/80 relative shadow-2xs hover:scale-105 transition-transform duration-300">
                        <img
                          src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&auto=format&fit=crop&q=80"
                          alt="Hex Dumbbell"
                          className="w-full h-20 object-contain"
                          loading="lazy"
                        />
                        <span className="text-[10px] font-black text-slate-800 mt-1">Gym Dumbbell</span>
                      </div>
                    </div>
                  </div>
                </div>
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

            {/* RESPONSIVE CATEGORY CARDS: 4 Desktop, 2 Tablet/Mobile, 1 Small */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {categoriesList.map((cat) => (
                <div
                  key={cat.name}
                  onClick={() => handleSelectCategory(cat.name)}
                  className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer h-[190px] sm:h-[210px] transform hover:-translate-y-1 border border-slate-200/60"
                >
                  {/* Background Image Hero */}
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Dark Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent group-hover:from-black/90 transition-colors" />

                  {/* Top Right Item Count Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="text-[10px] sm:text-xs font-black text-white bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                      {cat.count} Items
                    </span>
                  </div>

                  {/* Bottom Text Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 z-10 space-y-1">
                    <h3 className="text-base sm:text-lg font-black text-white group-hover:text-red-400 transition-colors leading-tight">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-white/80 font-medium line-clamp-1">
                      {cat.desc}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-white pt-1 group-hover:translate-x-1.5 transition-transform">
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#E31B23]" />
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
                  <img src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&auto=format&fit=crop&q=80" alt="Cricket Kit" className="w-full h-full object-contain rounded-2xl" loading="lazy" decoding="async" />
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
                  <img src="https://images.unsplash.com/photo-1614632537190-23e4146777db?w=400&auto=format&fit=crop&q=80" alt="Football Pack" className="w-full h-full object-contain rounded-2xl" loading="lazy" decoding="async" />
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
                  <img src="https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&auto=format&fit=crop&q=80" alt="Home Gym Setup" className="w-full h-full object-contain rounded-2xl" loading="lazy" decoding="async" />
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
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                      <Flame className="w-6 h-6 text-amber-300 fill-amber-300" />
                      <span>DEALS FOR YOU</span>
                    </h2>
                  </div>
                  <p className="text-xs text-white/80 font-semibold max-w-xs">
                    Hand-picked active discounts configured directly by Ronix Admin.
                  </p>
                </div>

                {renderProductSectionGrid(activeDiscountDeals.slice(0, 4))}
              </div>
            </section>
          )}

          {/* BEST SELLERS */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-xs font-black text-[#E31B23] uppercase tracking-widest block">MOST POPULAR GEAR</span>
                <h2 className="text-2xl font-black text-[#111827] tracking-tight flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#E31B23] fill-[#E31B23]" />
                  <span>Best Sellers</span>
                </h2>
              </div>
              <button
                onClick={() => handleSelectCategory('All Gear')}
                className="text-xs font-bold text-[#E31B23] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Products</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {renderProductSectionGrid(bestSellerProducts)}
          </section>

          {/* TRENDING NOW (HORIZONTAL SCROLL) */}
          <section className="bg-slate-100/70 py-10 border-y border-slate-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-black text-[#E31B23] uppercase tracking-widest block">HOT THIS WEEK</span>
                  <h2 className="text-2xl font-black text-[#111827] tracking-tight flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#E31B23] fill-[#E31B23]" />
                    <span>Trending Now</span>
                  </h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => scrollTrending('left')}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-[#E31B23] flex items-center justify-center transition-all shadow-xs cursor-pointer"
                    title="Scroll Left"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => scrollTrending('right')}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-[#E31B23] flex items-center justify-center transition-all shadow-xs cursor-pointer"
                    title="Scroll Right"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div
                ref={trendingScrollRef}
                className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
              >
                {trendingProducts.map((prod) => (
                  <div key={prod.id} className="w-[220px] sm:w-[245px] shrink-0">
                    {renderProductCard(prod)}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CRICKET ESSENTIALS SECTION */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200/80 pb-3">
              <div>
                <span className="text-xs font-black text-[#E31B23] uppercase tracking-widest block">SEASON SPECIAL</span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-[#E31B23]" />
                  <span>CRICKET ESSENTIALS</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Match-ready bats, balls, protective equipment, and training essentials for every level of cricket.
                </p>
              </div>
              <button
                onClick={() => handleSelectCategory('Cricket')}
                className="text-xs font-bold text-[#E31B23] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>View All Cricket Gear</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Promo Box */}
              <div className="lg:col-span-4 bg-gradient-to-br from-[#E31B23] via-[#B5121B] to-[#800A0F] rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col justify-between h-full min-h-[380px] space-y-6">
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full border border-white/20 inline-block">
                    MATCH READY DEALS
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                    EQUIPMENT FOR CHAMPIONS
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
                    Designed for peak performance from net practice to match day.
                  </p>

                  {/* 3 Benefit Points */}
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center gap-2.5 bg-black/20 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/10">
                      <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
                      <span className="text-xs font-bold text-white">Match-Ready Quality</span>
                    </div>
                    <div className="flex items-center gap-2.5 bg-black/20 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/10">
                      <Tag className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span className="text-xs font-bold text-white">Bulk B2B Pricing Available</span>
                    </div>
                    <div className="flex items-center gap-2.5 bg-black/20 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/10">
                      <Truck className="w-4 h-4 text-sky-300 shrink-0" />
                      <span className="text-xs font-bold text-white">Fast Nationwide Delivery</span>
                    </div>
                  </div>
                </div>

                {/* Mini Equipment Visual Badges */}
                <div className="relative py-2 flex items-center justify-center">
                  <div className="flex items-center space-x-2.5 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/20 shadow-inner">
                    <div className="px-2.5 py-1 rounded-lg bg-white/20 text-white text-[11px] font-black tracking-wider flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-300" />
                      <span>BATS</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-white/20 text-white text-[11px] font-black tracking-wider flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-red-300" />
                      <span>BALLS</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-white/20 text-white text-[11px] font-black tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
                      <span>PADS</span>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => handleSelectCategory('Cricket')}
                    className="w-full py-3.5 rounded-xl bg-white text-[#111827] font-black text-xs sm:text-sm hover:bg-slate-100 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 group"
                  >
                    <span>View All Cricket Gear</span>
                    <ArrowRight className="w-4 h-4 text-[#E31B23] group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Right Product Grid */}
              <div className="lg:col-span-8">
                {renderProductSectionGrid(cricketSectionProducts.slice(0, 6))}
              </div>
            </div>
          </section>

          {/* MATCH READY GEAR CATEGORY CAROUSEL */}
          <SportsCategoryCarousel
            slides={bookSlides}
            onSelectCategory={handleSelectCategory}
            onSelectProduct={(prod) => {
              setSelectedProduct(prod);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAddToCart={handleAddToCart}
            inventory={inventory}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
          />

          {/* SHOP BY NEED SECTION */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-1">
              <span className="text-xs font-black text-[#E31B23] uppercase tracking-widest">CURATED COLLECTIONS</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2.5">
                <Target className="w-6 h-6 text-[#E31B23]" />
                <span>SHOP BY NEED</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Find precisely what you need for tournament matches, daily drills, or team supplies.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { title: 'Match Day Gear', category: 'Cricket', desc: 'Tournament grade equipment', icon: Trophy, color: 'from-red-500 to-rose-700' },
                { title: 'Training Essentials', category: 'Football', desc: 'Cones, pumps & agility gear', icon: Zap, color: 'from-emerald-600 to-teal-800' },
                { title: 'Team & Academy Supplies', category: 'All Gear', desc: 'Bulk sets & club bundles', icon: Users, color: 'from-blue-600 to-indigo-800' },
                { title: 'Home Fitness', category: 'Fitness & Gym', desc: 'Weights, mats & bands', icon: Dumbbell, color: 'from-amber-500 to-orange-700' },
                { title: 'Beginner Kits', category: 'Badminton', desc: 'Complete starter sets', icon: Award, color: 'from-purple-600 to-violet-800' },
              ].map((need, idx) => {
                const IconComp = need.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectCategory(need.category)}
                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-red-300 hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${need.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 group-hover:text-[#E31B23] transition-colors leading-tight">
                          {need.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                          {need.desc}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-[11px] font-bold text-[#E31B23] pt-3 group-hover:translate-x-1 transition-transform">
                      <span>Explore</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* WHY SHOP WITH RONIX SPORTS SECTION */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="text-xs font-black text-[#E31B23] uppercase tracking-widest">THE RONIX DIFFERENCE</span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2.5">
                  <Award className="w-6 h-6 text-[#E31B23]" />
                  <span>WHY SHOP WITH RONIX SPORTS</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-slate-100 space-y-3 text-center sm:text-left hover:border-red-200 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#E31B23] flex items-center justify-center mx-auto sm:mx-0 shadow-xs">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900">Quality Sports Equipment</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      100% genuine products sourced directly from official manufacturers and competition grade batches.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-slate-100 space-y-3 text-center sm:text-left hover:border-red-200 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#E31B23] flex items-center justify-center mx-auto sm:mx-0 shadow-xs">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900">B2B Bulk Pricing</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      Exclusive wholesale tiers for sports academies, schools, colleges, and registered sporting clubs.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-slate-100 space-y-3 text-center sm:text-left hover:border-red-200 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#E31B23] flex items-center justify-center mx-auto sm:mx-0 shadow-xs">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900">Secure Ordering</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      Encrypted payments with instant GST compliant invoice generation and verified transaction security.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-slate-100 space-y-3 text-center sm:text-left hover:border-red-200 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#E31B23] flex items-center justify-center mx-auto sm:mx-0 shadow-xs">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900">Fast Support & Delivery</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      Express dispatch from central warehouses within 24 hours with dedicated phone and email support.
                    </p>
                  </div>
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
            <aside className="hidden md:block md:col-span-3 space-y-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs h-fit sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#E31B23]" />
                  Shop by Sport
                </span>
                <button
                  onClick={() => {
                    setSelectedCategory('All Gear');
                    setSelectedSubtype('All');
                    setSelectedBrands([]);
                    setPriceRange({ min: '', max: '' });
                    setInStockOnly(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-[11px] text-[#E31B23] font-bold hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              </div>

              {/* Main Categories Navigation List */}
              <div className="space-y-1">
                {[
                  'All Gear',
                  'Cricket',
                  'Football',
                  'Badminton',
                  'Table Tennis',
                  'Fitness & Gym',
                  'Sportswear & Accessories',
                ].map((catName) => {
                  const isSelected = selectedCategory === catName;
                  const subTypes = catName !== 'All Gear' ? getTypesForCategory(catName) : [];

                  return (
                    <div key={catName} className="space-y-1">
                      <button
                        onClick={() => {
                          setSelectedCategory(catName);
                          setSelectedSubtype('All');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#E31B23] text-white shadow-xs'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span>{catName}</span>
                        {subTypes.length > 0 && (
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90 text-white' : 'text-slate-400'}`} />
                        )}
                      </button>

                      {/* Expandable Subcategories Accordion - ONLY rendered when selected */}
                      {isSelected && subTypes.length > 0 && (
                        <div className="pl-3 pr-1 py-1 space-y-1 border-l-2 border-red-200 ml-3 animate-in fade-in duration-150">
                          <button
                            onClick={() => {
                              setSelectedSubtype('All');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                              selectedSubtype === 'All'
                                ? 'bg-red-50 text-[#E31B23]'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            All {catName} Items
                          </button>
                          {subTypes.map((st) => (
                            <button
                              key={st}
                              onClick={() => {
                                setSelectedSubtype(st);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all truncate block ${
                                selectedSubtype === st
                                  ? 'bg-red-50 text-[#E31B23]'
                                  : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* In Stock Only */}
              <div className="pt-3 border-t border-slate-100">
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
              <h2 className="text-xl font-black text-slate-900">{profile?.full_name || 'Rahul'}</h2>
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

      {/* COMPLETE RONIX SPORTS FOOTER */}
      <footer className="bg-[#0B0F17] text-slate-300 border-t border-slate-800 pt-12 pb-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Col 1: Brand Info & Contact */}
            <div className="space-y-4">
              <div
                onClick={() => {
                  setActiveTab('home');
                  setSelectedCategory('All Gear');
                  setSelectedSubtype('All');
                  setSearchQuery('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-[#E31B23] flex items-center justify-center text-white font-black text-xl shadow-md">
                  R
                </div>
                <div>
                  <span className="text-lg font-black tracking-tight text-white block leading-none">
                    RONIX <span className="text-[#E31B23]">SPORTS</span>
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                    SPORTS & FITNESS STORE
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Quality sports equipment, fitness gear and accessories for players, teams and everyday athletes.
              </p>

              <div className="space-y-1.5 text-xs text-slate-300 font-medium">
                <p className="flex items-center gap-2">
                  <span className="text-[#E31B23] font-bold">Phone:</span>
                  <span>+91 98765 43210</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-[#E31B23] font-bold">Email:</span>
                  <span>support@ronixsports.com</span>
                </p>
              </div>
            </div>

            {/* Col 2: Shop Shortcuts */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                Shop Shortcuts
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-400">
                {[
                  'Cricket',
                  'Football',
                  'Badminton',
                  'Table Tennis',
                  'Volleyball',
                  'Basketball',
                  'Fitness & Gym',
                  'Sportswear & Accessories',
                ].map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => handleSelectCategory(cat)}
                      className="hover:text-[#E31B23] transition-colors cursor-pointer text-left"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Quick Links */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                Quick Links
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-400">
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('home');
                      setSelectedCategory('All Gear');
                      setSelectedSubtype('All');
                      setSearchQuery('');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#E31B23] transition-colors cursor-pointer"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSelectCategory('All Gear')}
                    className="hover:text-[#E31B23] transition-colors cursor-pointer"
                  >
                    Shop All
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('my-orders');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#E31B23] transition-colors cursor-pointer"
                  >
                    My Orders
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="hover:text-[#E31B23] transition-colors cursor-pointer"
                  >
                    Cart ({totalCartCount})
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('account');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#E31B23] transition-colors cursor-pointer"
                  >
                    Account
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Customer Service */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                Customer Service
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-400">
                <li>Order Tracking</li>
                <li>Shipping Information</li>
                <li>Returns & Replacement</li>
                <li>Warranty & Guarantee</li>
                <li>Contact & Support</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium gap-3">
            <p>© 2026 Ronix Sports. All rights reserved.</p>
            <p>
              Designed and Maintained by{' '}
              <a
                href="https://webnxt.co/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#E31B23] font-bold transition-colors underline"
              >
                WebNxt
              </a>
            </p>
          </div>
        </div>
      </footer>

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
          <HomeIcon className="w-5 h-5" />
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

      {/* PASSWORD CHANGE MODAL */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

// Helper Home Icon
function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

interface ProductSectionGridProps {
  productList: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, e?: React.MouseEvent) => void;
  inventory: Record<string, any>;
  wishlist: Record<string, boolean>;
  onToggleWishlist: (productId: string, e: React.MouseEvent) => void;
}

export const ProductSectionGrid: React.FC<ProductSectionGridProps> = ({
  productList,
  onSelectProduct,
  onAddToCart,
  inventory,
  wishlist,
  onToggleWishlist,
}) => {
  if (!productList || productList.length === 0) {
    return <p className="text-xs text-slate-500 font-medium py-2">No products currently available.</p>;
  }

  const renderCard = (prod: Product) => {
    const inv = inventory[prod.id];
    const available = inv ? Math.max(0, inv.onHand - inv.reserved) : 0;
    const isOutOfStock = available <= 0;
    const isLowStock = available > 0 && available <= 10;
    const discInfo = getEffectiveProductPrice(prod);
    const isWishlisted = Boolean(wishlist[prod.id]);

    return (
      <div
        key={prod.id}
        onClick={() => onSelectProduct(prod)}
        className="group relative bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-red-300 transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
      >
        <div className="relative aspect-square w-full bg-slate-50/60 p-3 sm:p-4 flex items-center justify-center border-b border-slate-100 overflow-hidden">
          {discInfo.hasDiscount && (
            <div className="absolute top-2 left-2 z-10">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E31B23] text-white shadow-2xs">
                {discInfo.discountLabel}
              </span>
            </div>
          )}

          <button
            onClick={(e) => onToggleWishlist(prod.id, e)}
            className="absolute top-2 right-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#E31B23] hover:scale-110 transition-all shadow-xs"
            title="Add to Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-[#E31B23] text-[#E31B23]' : ''}`} />
          </button>

          <ProductImage
            src={prod.image_url || prod.image}
            alt={prod.name}
            category={prod.category}
            name={prod.name}
            product={prod}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />

          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <span className="bg-white/95 text-slate-900 font-extrabold text-[11px] px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-[#E31B23]" />
              <span>Quick View</span>
            </span>
          </div>
        </div>

        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-semibold mb-0.5">
              <span>{prod.brand}</span>
              <span className="text-[#E31B23] font-bold">{prod.category}</span>
            </div>

            <h3 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-2 leading-snug group-hover:text-[#E31B23] transition-colors">
              {prod.name}
            </h3>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-sm sm:text-base font-black text-slate-900">
                  ₹{discInfo.finalPrice.toLocaleString('en-IN')}
                </span>
                {discInfo.hasDiscount && (
                  <span className="text-[11px] text-slate-400 line-through font-medium">
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
              onClick={(e) => onAddToCart(prod, 1, e)}
              disabled={isOutOfStock}
              className={`w-full py-1.5 sm:py-2 px-3 rounded-xl font-black text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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

  if (productList.length === 1) {
    return <div className="w-full max-w-xs">{renderCard(productList[0])}</div>;
  }
  if (productList.length === 2) {
    return <div className="grid grid-cols-2 max-w-xl gap-4 sm:gap-5">{productList.map(renderCard)}</div>;
  }
  if (productList.length === 3) {
    return <div className="grid grid-cols-2 sm:grid-cols-3 max-w-3xl gap-4 sm:gap-5">{productList.map(renderCard)}</div>;
  }
  return <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">{productList.map(renderCard)}</div>;
};
