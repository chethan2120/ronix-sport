/**
 * Product-specific image asset mapping for Ronix Sports Storefront.
 * Every product SKU points to a unique high-quality raster photograph of the product.
 * NO generic stadium photos, NO people/models, NO SVG/vector graphics, NO duplicates.
 */

export interface ProductAssetMap {
  [sku: string]: string;
}

export const PRODUCT_ASSETS: Record<string, string> = {
  "CRK-BAT-001": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80",
  "CRK-BAT-002": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80",
  "CRK-BAL-003": "https://images.unsplash.com/photo-1589801258579-18e091f4ca26?w=800&auto=format&fit=crop&q=80",
  "CRK-BAL-004": "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80",
  "CRK-HLM-005": "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&auto=format&fit=crop&q=80",
  "CRK-GLV-006": "https://images.unsplash.com/photo-1563299796-b729d0af54a5?w=800&auto=format&fit=crop&q=80",
  "CRK-PAD-007": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
  "CRK-BAG-008": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
  "CRK-WKT-009": "https://images.unsplash.com/photo-1515523110800-9415d13b84a8?w=800&auto=format&fit=crop&q=80",
  "CRK-DRS-010": "https://images.unsplash.com/photo-1614632537190-23e4146777db?w=800&auto=format&fit=crop&q=80",
  "FTB-BAL-011": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
  "FTB-BAL-012": "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&auto=format&fit=crop&q=80",
  "FTB-SHO-013": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
  "FTB-SHO-014": "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&auto=format&fit=crop&q=80",
  "FTB-SHN-015": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop&q=80",
  "FTB-GLV-016": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
  "FTB-JER-017": "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80",
  "FTB-PNT-018": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80",
  "FTB-NET-019": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
  "FTB-PMP-020": "https://images.unsplash.com/photo-1627627256672-027a4613d028?w=800&auto=format&fit=crop&q=80",
  "BAD-RCT-021": "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&auto=format&fit=crop&q=80",
  "BAD-RCT-022": "https://images.unsplash.com/photo-1560012057-4372e14c5085?w=800&auto=format&fit=crop&q=80",
  "BAD-SHT-023": "https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?w=800&auto=format&fit=crop&q=80",
  "BAD-SHT-024": "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=800&auto=format&fit=crop&q=80",
  "TNN-RCT-025": "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop&q=80",
  "TNN-BAL-026": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80",
  "TT-BAT-027": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80",
  "TT-BAL-028": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80",
  "TT-BAL-029": "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&auto=format&fit=crop&q=80",
  "RKT-BAG-030": "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&auto=format&fit=crop&q=80",
  "FIT-DMB-031": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80",
  "FIT-DMB-032": "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&auto=format&fit=crop&q=80",
  "FIT-KTL-033": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80",
  "FIT-MAT-034": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
  "FIT-BND-035": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80",
  "FIT-BNC-036": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
  "FIT-BAR-037": "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&auto=format&fit=crop&q=80",
  "FIT-PLT-038": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80",
  "FIT-GLV-039": "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800&auto=format&fit=crop&q=80",
  "FIT-BEL-040": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
  "ACC-BOT-041": "https://images.unsplash.com/photo-1580086319619-3ed498161c77?w=800&auto=format&fit=crop&q=80",
  "FIT-ROP-042": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
  "ACC-TOW-043": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80",
  "ACC-BAG-044": "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&auto=format&fit=crop&q=80",
  "ACC-SCK-045": "https://images.unsplash.com/photo-1517438322307-e67111335449?w=800&auto=format&fit=crop&q=80",
  "ACC-CAP-046": "https://images.unsplash.com/photo-1520256862855-398228c41684?w=800&auto=format&fit=crop&q=80",
  "ACC-WRB-047": "https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=800&auto=format&fit=crop&q=80",
  "ACC-KNE-048": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
  "ACC-MAT-049": "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop&q=80",
  "ACC-FAK-050": "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80"
};

export const RASTER_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80';

export function getSkuProductAsset(sku?: string, category?: string): string {
  if (sku && PRODUCT_ASSETS[sku]) {
    return PRODUCT_ASSETS[sku];
  }
  return RASTER_FALLBACK_IMAGE;
}

export function getProductImageBySku(sku: string): string {
  if (sku && PRODUCT_ASSETS[sku]) {
    return PRODUCT_ASSETS[sku];
  }
  return RASTER_FALLBACK_IMAGE;
}

export function getProductImage(product: { id?: string; sku?: string; image_url?: string; image?: string; name?: string }): string {
  if (product.sku && PRODUCT_ASSETS[product.sku]) {
    return PRODUCT_ASSETS[product.sku];
  }
  if (product.id && PRODUCT_ASSETS[product.id]) {
    return PRODUCT_ASSETS[product.id];
  }
  if (product.image_url && !product.image_url.includes('placeholder') && !product.image_url.includes('via.placeholder.com')) {
    return product.image_url;
  }
  if (product.image && !product.image.includes('placeholder') && !product.image.includes('via.placeholder.com')) {
    return product.image;
  }
  return RASTER_FALLBACK_IMAGE;
}
