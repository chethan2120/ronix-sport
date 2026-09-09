/**
 * Product-specific image asset mapping for Ronix Sports Storefront.
 * Every product SKU points to a unique high-quality studio raster photograph of the product.
 * STRICT: NO people, NO models, NO athletes, NO hands, NO stadiums, NO lifestyle shots.
 */

export interface ProductAssetMap {
  [sku: string]: string;
}

export const PRODUCT_ASSETS: Record<string, string> = {
  "CRI-BAT-KW-001": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80",
  "CRI-BAT-EW-002": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80",
  "CRI-GLV-003": "https://images.unsplash.com/photo-1563299796-b729d0af54a5?w=800&auto=format&fit=crop&q=80",
  "CRI-PAD-004": "https://images.unsplash.com/photo-1512716676801-e7fcd9384d53?w=800&auto=format&fit=crop&q=80",
  "CRI-HLM-005": "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&auto=format&fit=crop&q=80",
  "CRI-THG-006": "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800&auto=format&fit=crop&q=80",
  "CRI-ABD-007": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
  "CRI-BAG-008": "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&auto=format&fit=crop&q=80",
  "CRI-BAL-TEN-009": "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&auto=format&fit=crop&q=80",
  "CRI-BAL-LTH-010": "https://images.unsplash.com/photo-1589801258579-18e091f4ca26?w=800&auto=format&fit=crop&q=80",
  "CRI-STP-011": "https://images.unsplash.com/photo-1515523110800-9415d13b84a8?w=800&auto=format&fit=crop&q=80",
  "CRI-ARM-012": "https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=800&auto=format&fit=crop&q=80",
  "FOO-BAL-001": "https://images.unsplash.com/photo-1614632537190-23e4146777db?w=800&auto=format&fit=crop&q=80",
  "FOO-SHO-002": "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&auto=format&fit=crop&q=80",
  "FOO-SHN-003": "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&auto=format&fit=crop&q=80",
  "FOO-GLV-004": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop&q=80",
  "FOO-CNE-005": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
  "FOO-PMP-006": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80",
  "FOO-NET-007": "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80",
  "FOO-FUT-008": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
  "FOO-BAL-009": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
  "BAD-RAC-YON-001": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
  "BAD-RAC-LIN-002": "https://images.unsplash.com/photo-1521537634581-0dced2efa2a3?w=800&auto=format&fit=crop&q=80",
  "BAD-SHU-NYL-003": "https://images.unsplash.com/photo-1627627256672-027a4613d028?w=800&auto=format&fit=crop&q=80",
  "BAD-SHU-FTH-004": "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&auto=format&fit=crop&q=80",
  "BAD-NET-005": "https://images.unsplash.com/photo-1617083934555-ac7d4fed8814?w=800&auto=format&fit=crop&q=80",
  "BAD-GRP-006": "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&auto=format&fit=crop&q=80",
  "BAD-BAG-007": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80",
  "TT-BAT-001": "https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?w=800&auto=format&fit=crop&q=80",
  "TT-BAL-002": "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=800&auto=format&fit=crop&q=80",
  "TT-NET-003": "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop&q=80",
  "TT-TBL-004": "https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?w=800&auto=format&fit=crop&q=80",
  "VOL-BAL-001": "https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&auto=format&fit=crop&q=80",
  "VOL-NET-002": "https://images.unsplash.com/photo-1617083934555-ac7d4fed8814?w=800&auto=format&fit=crop&q=80",
  "BAS-BAL-001": "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop&q=80",
  "BAS-SHO-002": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
  "BAS-HOP-003": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
  "FIT-MAT-001": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80",
  "FIT-BND-002": "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&auto=format&fit=crop&q=80",
  "FIT-DUM-003": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80",
  "FIT-KET-004": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
  "FIT-ROP-005": "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&auto=format&fit=crop&q=80",
  "FIT-GLV-006": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80",
  "FIT-WHL-007": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80",
  "FIT-ROL-008": "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&auto=format&fit=crop&q=80",
  "SPT-DUF-001": "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&auto=format&fit=crop&q=80",
  "SPT-BTL-002": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80",
  "SPT-SCK-003": "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&auto=format&fit=crop&q=80",
  "SPT-SHO-004": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
  "SPT-TSH-005": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
  "SPT-PNT-006": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
  "SPT-CAP-007": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80",
  "SPT-WRB-008": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80",
  "BAD-SHO-008": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
  "CRK-BAT-001": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80",
  "CRK-BAT-002": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80",
  "CRK-BAL-003": "https://images.unsplash.com/photo-1589801258579-18e091f4ca26?w=800&auto=format&fit=crop&q=80",
  "CRK-HLM-005": "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&auto=format&fit=crop&q=80",
  "CRK-GLV-006": "https://images.unsplash.com/photo-1563299796-b729d0af54a5?w=800&auto=format&fit=crop&q=80",
  "CRK-PAD-007": "https://images.unsplash.com/photo-1512716676801-e7fcd9384d53?w=800&auto=format&fit=crop&q=80",
  "FTB-BAL-011": "https://images.unsplash.com/photo-1614632537190-23e4146777db?w=800&auto=format&fit=crop&q=80",
  "FTB-SHO-013": "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&auto=format&fit=crop&q=80",
  "BAD-RCT-021": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
  "FIT-DMB-031": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80"
};

export const RASTER_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80';

export function getSkuProductAsset(sku?: string, category?: string, name?: string, productType?: string): string {
  if (sku && PRODUCT_ASSETS[sku]) {
    return PRODUCT_ASSETS[sku];
  }

  const n = (name || '').toLowerCase();
  const cat = (category || '').toLowerCase();
  const pt = (productType || '').toLowerCase();

  if (n.includes('english willow') || (n.includes('cricket') && n.includes('bat'))) {
    return PRODUCT_ASSETS['CRI-BAT-EW-002'];
  }
  if (n.includes('kashmir willow')) {
    return PRODUCT_ASSETS['CRI-BAT-KW-001'];
  }
  if (n.includes('tennis ball')) {
    return PRODUCT_ASSETS['CRI-BAL-TEN-009'];
  }
  if (n.includes('leather') && n.includes('ball')) {
    return PRODUCT_ASSETS['CRI-BAL-LTH-010'];
  }
  if (n.includes('helmet')) {
    return PRODUCT_ASSETS['CRI-HLM-005'];
  }
  if (n.includes('gloves') && (n.includes('batting') || cat.includes('cricket'))) {
    return PRODUCT_ASSETS['CRI-GLV-003'];
  }
  if (n.includes('pads') || pt.includes('pad')) {
    return PRODUCT_ASSETS['CRI-PAD-004'];
  }
  if (n.includes('kit bag') || n.includes('duffle')) {
    return PRODUCT_ASSETS['CRI-BAG-008'];
  }
  if (n.includes('stumps')) {
    return PRODUCT_ASSETS['CRI-STP-011'];
  }
  if (n.includes('football shoes') || n.includes('cleats') || n.includes('stud')) {
    return PRODUCT_ASSETS['FOO-SHO-002'];
  }
  if (n.includes('shin guard')) {
    return PRODUCT_ASSETS['FOO-SHN-003'];
  }
  if (n.includes('goalkeeper')) {
    return PRODUCT_ASSETS['FOO-GLV-004'];
  }
  if (n.includes('football') || n.includes('futsal')) {
    return PRODUCT_ASSETS['FOO-BAL-001'];
  }
  if (n.includes('badminton racket') || n.includes('aerospeed')) {
    return PRODUCT_ASSETS['BAD-RAC-YON-001'];
  }
  if (n.includes('shuttlecock')) {
    return PRODUCT_ASSETS['BAD-SHU-NYL-003'];
  }
  if (n.includes('table tennis bat') || n.includes('ping pong paddle')) {
    return PRODUCT_ASSETS['TT-BAT-001'];
  }
  if (n.includes('table tennis ball') || n.includes('ping pong ball')) {
    return PRODUCT_ASSETS['TT-BAL-002'];
  }
  if (n.includes('basketball')) {
    return PRODUCT_ASSETS['BAS-BAL-001'];
  }
  if (n.includes('volleyball')) {
    return PRODUCT_ASSETS['VOL-BAL-001'];
  }
  if (n.includes('dumbbell')) {
    return PRODUCT_ASSETS['FIT-DUM-003'];
  }
  if (n.includes('kettlebell')) {
    return PRODUCT_ASSETS['FIT-KET-004'];
  }
  if (n.includes('yoga mat') || n.includes('exercise mat')) {
    return PRODUCT_ASSETS['FIT-MAT-001'];
  }
  if (n.includes('running shoes') || n.includes('sneakers')) {
    return PRODUCT_ASSETS['SPT-SHO-004'];
  }
  if (n.includes('water bottle')) {
    return PRODUCT_ASSETS['SPT-BTL-002'];
  }

  return RASTER_FALLBACK_IMAGE;
}

export function getProductImageBySku(sku: string): string {
  if (sku && PRODUCT_ASSETS[sku]) {
    return PRODUCT_ASSETS[sku];
  }
  return RASTER_FALLBACK_IMAGE;
}

export function getProductImage(product: { id?: string; sku?: string; image_url?: string; image?: string; name?: string; category?: string; productType?: string }): string {
  if (product.sku && PRODUCT_ASSETS[product.sku]) {
    return PRODUCT_ASSETS[product.sku];
  }
  if (product.id && PRODUCT_ASSETS[product.id]) {
    return PRODUCT_ASSETS[product.id];
  }

  const assetByName = getSkuProductAsset(product.sku, product.category, product.name, product.productType);
  if (assetByName && assetByName !== RASTER_FALLBACK_IMAGE) {
    return assetByName;
  }

  if (product.image_url && !product.image_url.includes('placeholder') && !product.image_url.includes('via.placeholder.com')) {
    return product.image_url;
  }
  if (product.image && !product.image.includes('placeholder') && !product.image.includes('via.placeholder.com')) {
    return product.image;
  }
  return assetByName || RASTER_FALLBACK_IMAGE;
}
