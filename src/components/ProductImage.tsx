import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { Product } from '../types';
import { getSkuProductAsset, RASTER_FALLBACK_IMAGE } from '../data/productAssets';

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

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-contain',
  fallbackClassName,
  category,
  name,
  product,
}) => {
  const rawSrc =
    src ||
    product?.image ||
    (product as any)?.imageUrl ||
    (product as any)?.image_url ||
    (product as any)?.productImage ||
    (product as any)?.thumbnail ||
    (product as any)?.photo;

  const sku = product?.sku || (product as any)?.SKU || '';
  const prodCat = category || product?.category || '';
  const prodName = name || product?.name || '';

  // Get primary SKU raster image asset or fallback
  const skuAsset = getSkuProductAsset(sku, prodCat);

  // Resolution order: rawSrc > skuAsset > RASTER_FALLBACK_IMAGE
  const initialImageSrc = rawSrc || skuAsset || RASTER_FALLBACK_IMAGE;

  const [currentSrc, setCurrentSrc] = useState<string>(initialImageSrc);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const newSrc = rawSrc || skuAsset || RASTER_FALLBACK_IMAGE;
    setCurrentSrc(newSrc);
    setHasError(false);
    setIsLoaded(false);
  }, [rawSrc, sku, skuAsset]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (currentSrc !== RASTER_FALLBACK_IMAGE) {
        setCurrentSrc(RASTER_FALLBACK_IMAGE);
      }
    }
  };

  const imageAlt = alt || prodName || 'Ronix Sports Equipment';

  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-white p-1 ${fallbackClassName || ''}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-50 animate-pulse flex items-center justify-center rounded-xl">
          <Package className="w-5 h-5 text-slate-300" />
        </div>
      )}
      <img
        src={currentSrc}
        alt={imageAlt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
        onError={handleError}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
      />
    </div>
  );
};
