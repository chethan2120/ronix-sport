import React, { useState, useEffect } from 'react';
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
  const sku = product?.sku || (product as any)?.SKU || '';
  const prodCat = category || product?.category || '';
  const prodName = name || product?.name || '';

  const skuAsset = getSkuProductAsset(sku, prodCat, prodName);

  const providedUrl =
    (product as any)?.image_url ||
    src ||
    product?.image ||
    (product as any)?.imageUrl ||
    (product as any)?.productImage ||
    (product as any)?.thumbnail ||
    (product as any)?.photo;

  const isDumbbellUrl = providedUrl && providedUrl.includes('photo-1584735935682-2f2b69dff9d2');
  const isFitnessProduct = prodCat.toLowerCase().includes('fit') || prodName.toLowerCase().includes('dumbbell') || prodName.toLowerCase().includes('weight');

  const validProvidedUrl = (isDumbbellUrl && !isFitnessProduct) ? null : providedUrl;

  const rawSrc = (skuAsset && skuAsset !== RASTER_FALLBACK_IMAGE)
    ? skuAsset
    : (validProvidedUrl || skuAsset || RASTER_FALLBACK_IMAGE);

  const initialImageSrc = rawSrc;

  const [currentSrc, setCurrentSrc] = useState<string>(initialImageSrc);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setCurrentSrc(rawSrc);
    setHasError(false);
    setIsLoaded(false);
  }, [rawSrc]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (skuAsset && currentSrc !== skuAsset) {
        setCurrentSrc(skuAsset);
      } else if (currentSrc !== RASTER_FALLBACK_IMAGE) {
        setCurrentSrc(RASTER_FALLBACK_IMAGE);
      }
    }
  };

  const imageAlt = alt || prodName || 'Ronix Sports Equipment';

  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-white p-1 ${fallbackClassName || ''}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse rounded-xl" />
      )}
      <img
        src={currentSrc}
        alt={imageAlt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
        onError={handleError}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};
