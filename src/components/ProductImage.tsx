import React, { useState, useEffect } from 'react';
import {
  Package,
  Shield,
  Trophy,
  Activity,
  Award,
  Layers,
  Circle,
  Dumbbell,
  Backpack,
  Zap,
} from 'lucide-react';
import { Product } from '../types';

interface ProductImageProps {
  src?: string;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  category?: string;
  name?: string;
  product?: Partial<Product> | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
}

const getCategoryDetails = (category?: string, name?: string) => {
  const text = `${category || ''} ${name || ''}`.toLowerCase();
  
  if (text.includes('bat') || text.includes('willow') || text.includes('cricket bat')) {
    return { icon: Trophy, label: 'Cricket Bat', bg: 'from-amber-50 to-orange-100', color: 'text-amber-800' };
  }
  if (text.includes('ball') || text.includes('tennis ball') || text.includes('leather ball')) {
    return { icon: Circle, label: 'Match Ball', bg: 'from-red-50 to-rose-100', color: 'text-rose-800' };
  }
  if (text.includes('helm') || text.includes('headguard')) {
    return { icon: Shield, label: 'Protective Helmet', bg: 'from-blue-50 to-indigo-100', color: 'text-blue-800' };
  }
  if (text.includes('glove') || text.includes('mitt')) {
    return { icon: Zap, label: 'Batting Gloves', bg: 'from-emerald-50 to-teal-100', color: 'text-emerald-800' };
  }
  if (text.includes('pad') || text.includes('guard') || text.includes('legguard')) {
    return { icon: Layers, label: 'Leg Guards', bg: 'from-purple-50 to-violet-100', color: 'text-purple-800' };
  }
  if (text.includes('football') || text.includes('soccer')) {
    return { icon: Activity, label: 'Match Football', bg: 'from-sky-50 to-blue-100', color: 'text-sky-800' };
  }
  if (text.includes('badminton') || text.includes('racket') || text.includes('shuttle')) {
    return { icon: Award, label: 'Badminton Racket', bg: 'from-lime-50 to-emerald-100', color: 'text-emerald-800' };
  }
  if (text.includes('basketball')) {
    return { icon: Circle, label: 'Basketball', bg: 'from-orange-50 to-amber-100', color: 'text-orange-800' };
  }
  if (text.includes('fitness') || text.includes('gym') || text.includes('dumbbell') || text.includes('band')) {
    return { icon: Dumbbell, label: 'Fitness Gear', bg: 'from-cyan-50 to-teal-100', color: 'text-teal-800' };
  }
  if (text.includes('bag') || text.includes('kit') || text.includes('accessories')) {
    return { icon: Backpack, label: 'Kit & Accessories', bg: 'from-slate-100 to-slate-200', color: 'text-slate-800' };
  }
  return { icon: Package, label: category || 'Ronix Sports', bg: 'from-slate-100 to-slate-200', color: 'text-slate-700' };
};

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-contain',
  fallbackClassName,
  category,
  name,
  product,
  size = 'custom',
}) => {
  const imageSrc = src || product?.image;
  const imageAlt = alt || product?.name || 'Ronix Sports Equipment';
  const prodCat = category || product?.category || '';
  const prodName = name || product?.name || '';

  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset states if image source changes
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [imageSrc]);

  const catDetails = getCategoryDetails(prodCat, prodName);
  const Icon = catDetails.icon;

  // Fallback card if image fails or missing
  if (!imageSrc || hasError) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${catDetails.bg} text-slate-600 rounded-xl p-2 select-none border border-slate-200/80 shadow-2xs ${
          fallbackClassName || ''
        }`}
        title={prodName || catDetails.label}
      >
        <div className={`w-8 h-8 rounded-lg bg-white/90 shadow-xs flex items-center justify-center ${catDetails.color} mb-1 shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-black tracking-wider text-slate-800 uppercase text-center leading-tight truncate max-w-full px-1">
          {catDetails.label}
        </span>
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
          RONIX
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-white">
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-50 animate-pulse flex items-center justify-center rounded-xl">
          <Package className="w-5 h-5 text-slate-300" />
        </div>
      )}
      <img
        src={imageSrc}
        alt={imageAlt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoaded(true)}
        referrerPolicy="no-referrer"
        loading="lazy"
      />
    </div>
  );
};
