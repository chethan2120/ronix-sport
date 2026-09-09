import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Product,
  InventoryItem,
  InventoryMovement,
  B2BOrder,
  B2CSale,
  Customer,
  PricingRule,
  Invoice,
  Quotation,
  Payment,
  AuditLog,
  Warehouse,
  User,
  NotificationItem,
  OrderItem,
  CustomerOrder,
  CustomerOrderItem,
  CustomerOrderStatus,
  CustomerPaymentStatus,
} from '../types';
import {
  INITIAL_WAREHOUSES,
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_INVENTORY,
  INITIAL_CUSTOMERS,
  INITIAL_B2B_ORDERS,
  INITIAL_B2C_SALES,
  INITIAL_INVENTORY_LEDGER,
  INITIAL_PRICING_RULES,
  INITIAL_INVOICES,
  INITIAL_QUOTATIONS,
  INITIAL_PAYMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CUSTOMER_ORDERS,
} from '../data/initialData';
import { getSkuProductAsset } from '../data/productAssets';

// Demo Tracking Sets to identify initial sample/demo records reliably
export const DEMO_PRODUCT_IDS = new Set(INITIAL_PRODUCTS.map((p) => p.id));
export const DEMO_CUSTOMER_IDS = new Set(INITIAL_CUSTOMERS.map((c) => c.id));
export const DEMO_ORDER_IDS = new Set(INITIAL_B2B_ORDERS.map((o) => o.id));
export const DEMO_CUSTOMER_ORDER_IDS = new Set(INITIAL_CUSTOMER_ORDERS.map((o) => o.id));
export const DEMO_SALE_IDS = new Set(INITIAL_B2C_SALES.map((s) => s.id));
export const DEMO_INVOICE_IDS = new Set(INITIAL_INVOICES.map((i) => i.id));
export const DEMO_QUOTATION_IDS = new Set(INITIAL_QUOTATIONS.map((q) => q.id));
export const DEMO_PAYMENT_IDS = new Set(INITIAL_PAYMENTS.map((p) => p.id));
export const DEMO_LEDGER_IDS = new Set(INITIAL_INVENTORY_LEDGER.map((l) => l.id));

export const isDemoRecord = (item: { id?: string; isDemo?: boolean; productId?: string }, demoIdSet: Set<string>): boolean => {
  if (item.isDemo === true) return true;
  if (item.isDemo === false) return false;
  if (item.id && demoIdSet.has(item.id)) return true;
  if (item.productId && DEMO_PRODUCT_IDS.has(item.productId)) return true;
  return false;
};

export function filterByDemoMode<T extends { id?: string; isDemo?: boolean; productId?: string }>(
  records: T[] | undefined | null,
  isDemoMode: boolean,
  demoIdSet: Set<string>
): T[] {
  const safeRecords = Array.isArray(records) ? records : [];
  return isDemoMode
    ? safeRecords
    : safeRecords.filter((item) => !isDemoRecord(item, demoIdSet));
}

interface StoreContextType {
  // Current user & location state
  currentUser: User;
  currentWarehouse: Warehouse;
  users: User[];
  warehouses: Warehouse[];
  setCurrentUser: (user: User) => void;
  setCurrentWarehouse: (warehouse: Warehouse) => void;

  // Active navigation tab
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Products
  products: Product[];
  categories: string[];
  addCategory: (categoryName: string) => string;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>, openingStock: number, warehouseId?: string) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Inventory
  inventory: Record<string, InventoryItem>;
  inventoryLedger: InventoryMovement[];
  adjustStock: (
    arg1: string | { productId: string; quantity?: number; quantityChange?: number; type?: 'IN' | 'OUT'; reason?: string; warehouse?: string; warehouseId?: string },
    quantityChange?: number,
    type?: 'IN' | 'OUT',
    reason?: string,
    warehouseId?: string
  ) => boolean;
  
  // Atomic Stock Control
  reserveStockAtomic: (productId: string, requestedQty: number, entityRef: string) => { success: boolean; available: number; reservedQty: number; error?: string };
  releaseStockReservation: (productId: string, qty: number, entityRef: string) => void;

  // B2B Orders
  b2bOrders: B2BOrder[];
  placeB2BOrder: (orderData: {
    customerId: string;
    items: { productId: string; quantity: number }[];
    notes?: string;
  }) => { success: boolean; order?: B2BOrder; error?: string };
  updateB2BOrderStatus: (orderId: string, status: B2BOrder['status']) => void;

  // Customer Storefront Orders
  customerOrders: CustomerOrder[];
  placeCustomerOrder: (orderData: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    shippingAddress?: string;
    items: { productId: string; quantity: number }[];
  }) => { success: boolean; order?: CustomerOrder; error?: string };
  updateCustomerOrderStatus: (orderId: string, status: CustomerOrderStatus, paymentStatus?: CustomerPaymentStatus) => void;

  // B2C Sales (POS) & D2C Storefront
  b2cSales: B2CSale[];
  createB2CSale: (saleData: {
    items: { productId: string; quantity: number }[];
    paymentMethod: B2CSale['paymentMethod'];
    paymentStatus: B2CSale['paymentStatus'];
    customerName?: string;
  }) => { success: boolean; sale?: B2CSale; error?: string };
  placeD2COrder: (orderData: {
    customerName: string;
    phone: string;
    email: string;
    address: string;
    items: { productId: string; quantity: number }[];
    paymentMethod: 'UPI' | 'Card' | 'Net Banking' | 'COD' | string;
  }) => { success: boolean; sale?: B2CSale; invoiceId?: string; error?: string };

  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'totalOrders' | 'totalSpend' | 'joinedDate'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Pricing
  pricingRules: PricingRule[];
  updatePricingRule: (productId: string, updates: Partial<PricingRule>) => boolean;
  getPriceForCustomer: (productId: string, customerId?: string, quantity?: number) => { unitPrice: number; ruleApplied: string; savingsPercent?: number };

  // Invoices & Quotations
  invoices: Invoice[];
  createInvoice: (invoice: Partial<Invoice> & { customerName: string; items: OrderItem[]; total: number }) => Invoice;
  updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => void;
  updateInvoiceStatus: (invoiceId: string, status: Invoice['paymentStatus']) => void;
  deleteInvoice: (invoiceId: string) => void;
  
  quotations: Quotation[];
  createQuotation: (data: Partial<Quotation> & {
    customerId?: string;
    items?: { productId: string; quantity: number }[] | OrderItem[];
    validDays?: number;
    discountAmount?: number;
    notes?: string;
  }) => Quotation;
  updateQuotation: (quotationId: string, updates: Partial<Quotation>) => void;
  deleteQuotation: (quotationId: string) => void;
  convertQuotationToOrder: (quotationId: string) => { success: boolean; order?: B2BOrder; error?: string };

  // Payments
  payments: Payment[];
  recordPayment: (payment: {
    invoiceId?: string;
    orderId?: string;
    orderType?: 'B2B' | 'B2C';
    customerId?: string;
    customerName?: string;
    organizationName?: string;
    amount: number;
    method: Payment['method'] | string;
    transactionRef?: string;
    referenceNumber?: string;
    notes?: string;
  }) => Payment;

  // Audit Logs
  auditLogs: AuditLog[];
  logAudit: (action: string, module: AuditLog['module'], details: string, oldValue?: string, newValue?: string, referenceId?: string) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Search & KPI helpers
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  resetToDemoData: () => void;

  // Demo Mode
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  toggleDemoMode: () => void;
  resetDemoData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ronix_sports_crm_db_v1';

export const normalizeCategory = (cat?: string): string => {
  if (!cat) return 'Accessories';
  const c = cat.trim().toLowerCase();
  if (c === 'cricket bats' || c === 'cricket bat' || c === 'bats' || c === 'bat') return 'Bats';
  if (c === 'cricket balls' || c === 'cricket ball' || c === 'balls' || c === 'ball') return 'Balls';
  if (c === 'kit bags' || c === 'kit bag' || c === 'bags' || c === 'bag') return 'Bags';
  if (c === 'helmets' || c === 'helmet') return 'Helmets';
  if (c === 'gloves' || c === 'glove') return 'Gloves';
  if (c === 'pads' || c === 'pad') return 'Pads';
  if (c === 'footwear' || c === 'shoes' || c === 'shoe') return 'Footwear';
  if (c === 'football' || c === 'soccer') return 'Football';
  if (c === 'badminton') return 'Badminton';
  if (c === 'basketball') return 'Basketball';
  if (c === 'fitness') return 'Fitness';
  if (c === 'accessories') return 'Accessories';
  return cat.trim();
};

export const sanitizeProduct = (p: Product): Product => {
  const normCat = normalizeCategory(p.category);
  let prodType = p.productType || p.subCategory || '';

  // Fix specific misplaced product BAG-04 / BAG-KIT-04 or any bag product under Bats
  if (p.sku === 'BAG-04' || p.sku === 'BAG-KIT-04' || (p.name.toLowerCase().includes('bag') && normCat === 'Bats')) {
    return {
      ...p,
      category: 'Bags',
      productType: prodType || 'Kit Bag',
    };
  }

  return {
    ...p,
    category: normCat,
    productType: prodType,
  };
};

export const DEFAULT_CATEGORIES = [
  'Bats',
  'Balls',
  'Helmets',
  'Gloves',
  'Pads',
  'Bags',
  'Footwear',
  'Football',
  'Badminton',
  'Basketball',
  'Fitness',
  'Accessories',
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load saved state or default
  const [users] = useState<User[]>(INITIAL_USERS);
  const [warehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Arjun Staff
  const [currentWarehouse, setCurrentWarehouse] = useState<Warehouse>(INITIAL_WAREHOUSES[0]); // HQ
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Demo Mode State (ON by default for showcase/testing, toggleable in Settings)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_demo_mode`);
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_demo_mode`, JSON.stringify(isDemoMode));
  }, [isDemoMode]);

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
  };

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  // Helper to ensure demo tag
  const tagWithDemo = <T extends { isDemo?: boolean }>(items: T[]): T[] => {
    return items.map((it) => ({ ...it, isDemo: it.isDemo ?? true }));
  };

  // Primary Entities with local storage sync
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_products`);
    const loaded: Product[] = saved ? JSON.parse(saved) : tagWithDemo(INITIAL_PRODUCTS);
    return loaded.map((p) => {
      const sanitized = sanitizeProduct(p);
      const skuAsset = getSkuProductAsset(sanitized.sku, sanitized.category, sanitized.name, sanitized.productType);
      const imgUrl = (skuAsset && skuAsset !== RASTER_FALLBACK_IMAGE)
        ? skuAsset
        : getProductImage(sanitized);
      return {
        ...sanitized,
        image_url: imgUrl,
        image: imgUrl,
      };
    });
  });

  // Custom categories with local storage sync
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_categories`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_categories`, JSON.stringify(customCategories));
  }, [customCategories]);

  // Dynamic list of categories (defaults + custom + existing product categories)
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    DEFAULT_CATEGORIES.forEach((c) => map.set(c.toLowerCase(), c));
    (customCategories || []).forEach((c) => {
      if (c && !map.has(c.toLowerCase())) {
        map.set(c.toLowerCase(), c);
      }
    });
    (products || []).forEach((p) => {
      if (p?.category && !map.has(p.category.toLowerCase())) {
        map.set(p.category.toLowerCase(), p.category);
      }
    });
    return Array.from(map.values());
  }, [customCategories, products]);

  const addCategory = (categoryName: string): string => {
    const trimmed = categoryName ? categoryName.trim() : '';
    if (!trimmed) return '';

    const existing = categories.find((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      return existing;
    }

    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

    setCustomCategories((prev) => {
      if (prev.some((c) => c.toLowerCase() === formatted.toLowerCase())) {
        return prev;
      }
      return [...prev, formatted];
    });

    return formatted;
  };

  const [inventory, setInventory] = useState<Record<string, InventoryItem>>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_inventory`);
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [inventoryLedger, setInventoryLedger] = useState<InventoryMovement[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_ledger`);
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY_LEDGER;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_customers`);
    return saved ? JSON.parse(saved) : tagWithDemo(INITIAL_CUSTOMERS);
  });

  const [b2bOrders, setB2bOrders] = useState<B2BOrder[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_b2b_orders`);
    return saved ? JSON.parse(saved) : tagWithDemo(INITIAL_B2B_ORDERS);
  });

  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_customer_orders`);
    return saved ? JSON.parse(saved) : tagWithDemo(INITIAL_CUSTOMER_ORDERS);
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_customer_orders`, JSON.stringify(customerOrders));
  }, [customerOrders]);

  const [b2cSales, setB2cSales] = useState<B2CSale[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_b2c_sales`);
    return saved ? JSON.parse(saved) : tagWithDemo(INITIAL_B2C_SALES);
  });

  const [pricingRules, setPricingRules] = useState<PricingRule[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_pricing`);
    return saved ? JSON.parse(saved) : INITIAL_PRICING_RULES;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_invoices`);
    return saved ? JSON.parse(saved) : tagWithDemo(INITIAL_INVOICES);
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_quotations`);
    return saved ? JSON.parse(saved) : tagWithDemo(INITIAL_QUOTATIONS);
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_payments`);
    return saved ? JSON.parse(saved) : tagWithDemo(INITIAL_PAYMENTS);
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_notifs`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Sync to local storage on change
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_inventory`, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_ledger`, JSON.stringify(inventoryLedger));
  }, [inventoryLedger]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_customers`, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_b2b_orders`, JSON.stringify(b2bOrders));
  }, [b2bOrders]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_b2c_sales`, JSON.stringify(b2cSales));
  }, [b2cSales]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_pricing`, JSON.stringify(pricingRules));
  }, [pricingRules]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_invoices`, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_quotations`, JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_payments`, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_notifs`, JSON.stringify(notifications));
  }, [notifications]);

  // Central audit logger
  const logAudit = (
    action: string,
    module: AuditLog['module'],
    details: string,
    oldValue?: string,
    newValue?: string,
    referenceId?: string
  ) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }),
      user: currentUser.name,
      role: currentUser.role === 'Admin' ? 'Admin' : currentUser.role === 'Staff' ? 'Store Staff' : 'B2B Buyer',
      action,
      module,
      details,
      oldValue,
      newValue,
      referenceId,
      ip: '192.168.1.45 (Ronix Internal Net)',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Pricing helper
  const getPriceForCustomer = (
    productId: string,
    customerId?: string,
    quantity: number = 1
  ): { unitPrice: number; ruleApplied: string; savingsPercent?: number } => {
    const product = products.find((p) => p.id === productId);
    if (!product) return { unitPrice: 0, ruleApplied: 'Default' };

    const rule = pricingRules.find((r) => r.productId === productId);
    const standardRetail = product.retailPrice;

    // 1. Check Customer Specific Price
    if (customerId) {
      const customer = customers.find((c) => c.id === customerId);
      if (customer?.customPricing && customer.customPricing[productId]) {
        const custPrice = customer.customPricing[productId];
        const savings = Math.round(((standardRetail - custPrice) / standardRetail) * 100);
        return {
          unitPrice: custPrice,
          ruleApplied: `Contract Price (${customer.name})`,
          savingsPercent: savings > 0 ? savings : undefined,
        };
      }
      if (rule) {
        const matchedCustRule = rule.customerPrices.find((cp) => cp.customerId === customerId);
        if (matchedCustRule) {
          const savings = Math.round(((standardRetail - matchedCustRule.price) / standardRetail) * 100);
          return {
            unitPrice: matchedCustRule.price,
            ruleApplied: `Customer Custom Sheet`,
            savingsPercent: savings > 0 ? savings : undefined,
          };
        }
      }
    }

    // 2. Check Bulk Tiers
    if (rule && rule.bulkTiers && rule.bulkTiers.length > 0) {
      // Sort tiers descending
      const sortedTiers = [...rule.bulkTiers].sort((a, b) => b.minQty - a.minQty);
      for (const tier of sortedTiers) {
        if (quantity >= tier.minQty) {
          const savings = Math.round(((standardRetail - tier.price) / standardRetail) * 100);
          return {
            unitPrice: tier.price,
            ruleApplied: `Bulk Tier (${tier.minQty}+ units - ${tier.discountLabel})`,
            savingsPercent: savings > 0 ? savings : undefined,
          };
        }
      }
    }

    // 3. Fallback to B2B or Retail standard
    if (customerId) {
      const cust = customers.find((c) => c.id === customerId);
      if (cust?.type === 'B2B') {
        const savings = Math.round(((standardRetail - product.b2bPrice) / standardRetail) * 100);
        return {
          unitPrice: product.b2bPrice,
          ruleApplied: `Standard B2B Institutional Rate`,
          savingsPercent: savings > 0 ? savings : undefined,
        };
      }
    }

    return {
      unitPrice: product.retailPrice,
      ruleApplied: 'Standard Retail Price',
    };
  };

  // ATOMIC STOCK RESERVATION ENGINE
  const reserveStockAtomic = (
    productId: string,
    requestedQty: number,
    entityRef: string
  ): { success: boolean; available: number; reservedQty: number; error?: string } => {
    const item = inventory[productId];
    const product = products.find((p) => p.id === productId);
    if (!item || !product) {
      return { success: false, available: 0, reservedQty: 0, error: 'Product not found in inventory.' };
    }

    const currentAvailable = item.onHand - item.reserved;

    if (requestedQty <= 0) {
      return { success: false, available: currentAvailable, reservedQty: 0, error: 'Invalid quantity.' };
    }

    if (requestedQty > currentAvailable) {
      return {
        success: false,
        available: currentAvailable,
        reservedQty: 0,
        error: `Insufficient stock! Requested ${requestedQty} units, but only ${currentAvailable} units available.`,
      };
    }

    // Atomically reserve
    const newReserved = item.reserved + requestedQty;
    const newAvailable = item.onHand - newReserved;

    setInventory((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        reserved: newReserved,
        available: newAvailable,
      },
    }));

    // Record in ledger
    const ledgerEntry: InventoryMovement = {
      id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      productId,
      productName: product.name,
      sku: product.sku,
      change: -requestedQty,
      prevStock: currentAvailable,
      newStock: newAvailable,
      reason: 'B2B Order Reserve (Atomic Lock)',
      user: currentUser.name,
      reference: entityRef,
      warehouseId: currentWarehouse.id,
    };

    setInventoryLedger((prev) => [ledgerEntry, ...prev]);

    return {
      success: true,
      available: newAvailable,
      reservedQty: requestedQty,
    };
  };

  const releaseStockReservation = (productId: string, qty: number, entityRef: string) => {
    const item = inventory[productId];
    const product = products.find((p) => p.id === productId);
    if (!item || !product) return;

    const newReserved = Math.max(0, item.reserved - qty);
    const newAvailable = item.onHand - newReserved;

    setInventory((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        reserved: newReserved,
        available: newAvailable,
      },
    }));

    const ledgerEntry: InventoryMovement = {
      id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      productId,
      productName: product.name,
      sku: product.sku,
      change: +qty,
      prevStock: item.available,
      newStock: newAvailable,
      reason: 'B2B Reservation Released',
      user: currentUser.name,
      reference: entityRef,
      warehouseId: currentWarehouse.id,
    };

    setInventoryLedger((prev) => [ledgerEntry, ...prev]);
  };

  // Stock Adjustment (Add Stock / Remove Stock)
  const adjustStock = (
    arg1: string | { productId: string; quantity?: number; quantityChange?: number; type?: 'IN' | 'OUT'; reason?: string; warehouse?: string; warehouseId?: string },
    arg2?: number,
    arg3?: 'IN' | 'OUT',
    arg4?: string,
    arg5?: string
  ): boolean => {
    let productId: string;
    let quantityChange: number;
    let type: 'IN' | 'OUT';
    let reason: string;
    let warehouseId: string;

    if (typeof arg1 === 'object') {
      productId = arg1.productId;
      quantityChange = arg1.quantityChange ?? arg1.quantity ?? 0;
      type = arg1.type || 'IN';
      reason = arg1.reason || (type === 'IN' ? 'Stock Received' : 'Stock Adjustment');
      warehouseId = arg1.warehouseId || currentWarehouse.id;
    } else {
      productId = arg1;
      quantityChange = arg2 ?? 0;
      type = arg3 || 'IN';
      reason = arg4 || (type === 'IN' ? 'Stock Received' : 'Stock Adjustment');
      warehouseId = arg5 || currentWarehouse.id;
    }

    const item = inventory[productId];
    const product = products.find((p) => p.id === productId);
    if (!item || !product) return false;

    const delta = type === 'IN' ? Math.abs(quantityChange) : -Math.abs(quantityChange);
    const prevAvailable = item.onHand - item.reserved;
    const newOnHand = item.onHand + delta;

    if (newOnHand < 0) {
      return false;
    }

    const newAvailable = newOnHand - item.reserved;
    if (newAvailable < 0) {
      return false;
    }

    const currentLocStock = item.locationStock[warehouseId] || 0;
    const newLocStock = Math.max(0, currentLocStock + delta);

    setInventory((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        onHand: newOnHand,
        available: newAvailable,
        locationStock: {
          ...prev[productId].locationStock,
          [warehouseId]: newLocStock,
        },
      },
    }));

    // Record ledger entry
    const ledgerEntry: InventoryMovement = {
      id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      productId,
      productName: product.name,
      sku: product.sku,
      change: delta,
      prevStock: prevAvailable,
      newStock: newAvailable,
      reason: `${type === 'IN' ? 'Stock In' : 'Stock Out'}: ${reason}`,
      user: currentUser.name,
      reference: `ADJ-${Date.now().toString().slice(-4)}`,
      warehouseId,
    };

    setInventoryLedger((prev) => [ledgerEntry, ...prev]);

    logAudit(
      type === 'IN' ? 'Added Stock' : 'Removed Stock',
      'Inventory',
      `${type === 'IN' ? 'Added' : 'Removed'} ${Math.abs(quantityChange)} units of ${product.name}. Reason: ${reason}`,
      `${prevAvailable} available`,
      `${newAvailable} available`,
      product.sku
    );

    return true;
  };

  // Place B2B Order (3-Click flow execution)
  const placeB2BOrder = (orderData: {
    customerId: string;
    items: { productId: string; quantity: number }[];
    notes?: string;
  }): { success: boolean; order?: B2BOrder; error?: string } => {
    const customer = customers.find((c) => c.id === orderData.customerId);
    if (!customer) {
      return { success: false, error: 'Please select a valid institutional customer.' };
    }

    if (orderData.items.length === 0) {
      return { success: false, error: 'Please add at least one product.' };
    }

    // Step 1: Pre-verify atomic stock availability for all items
    for (const reqItem of orderData.items) {
      const inv = inventory[reqItem.productId];
      const prod = products.find((p) => p.id === reqItem.productId);
      if (!inv || !prod) {
        return { success: false, error: `Product ${reqItem.productId} not found.` };
      }
      const avail = inv.onHand - inv.reserved;
      if (reqItem.quantity > avail) {
        return {
          success: false,
          error: `Insufficient stock for ${prod.name}! Only ${avail} units available, requested ${reqItem.quantity}.`,
        };
      }
    }

    const orderNumber = `ORD-B2B-05${Math.floor(25 + b2bOrders.length)}`;
    const invoiceNumber = `INV-B2B-2025-${Math.floor(525 + b2bOrders.length)}`;
    let subtotal = 0;
    let gstTotal = 0;

    // Step 2: Build OrderItems with Historical Price Lock
    const orderItems: OrderItem[] = orderData.items.map((item) => {
      const prod = products.find((p) => p.id === item.productId)!;
      const pricing = getPriceForCustomer(item.productId, customer.id, item.quantity);
      const itemSubtotal = pricing.unitPrice * item.quantity;
      const gstAmt = (itemSubtotal * prod.gstPercent) / 100;
      subtotal += itemSubtotal;
      gstTotal += gstAmt;

      // Deduct inventory atomically (mark as reserved / fulfilled)
      reserveStockAtomic(prod.id, item.quantity, orderNumber);

      return {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        image: prod.image,
        price: pricing.unitPrice, // Historical Price Lock
        quantity: item.quantity,
        subtotal: itemSubtotal,
        gstPercent: prod.gstPercent,
        gstAmount: gstAmt,
        total: itemSubtotal + gstAmt,
      };
    });

    const total = subtotal + gstTotal;

    const newOrder: B2BOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      isDemo: false,
      organizationId: customer.id,
      organizationName: customer.organizationName || customer.name,
      contactPerson: customer.contactPerson,
      contactPhone: customer.phone,
      contactEmail: customer.email,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      items: orderItems,
      subtotal,
      gstTotal,
      total,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      paidAmount: total,
      notes: orderData.notes || 'Institutional procurement order',
      invoiceId: invoiceNumber,
      createdBy: currentUser.name,
    };

    // Auto-generate invoice
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      isDemo: false,
      orderId: newOrder.id,
      orderType: 'B2B',
      customerName: customer.contactPerson,
      organizationName: customer.organizationName || customer.name,
      billingAddress: customer.billingAddress,
      shippingAddress: customer.shippingAddress,
      gstNumber: customer.gstNumber,
      date: newOrder.date,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      items: orderItems,
      subtotal,
      gstTotal,
      total,
      paymentStatus: 'Paid',
      paymentMethod: 'Bank Transfer / PO',
      transactionRef: `PO-${customer.name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-5)}`,
      notes: 'Generated automatically from B2B order',
    };

    // Auto create payment record
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      paymentNumber: `PAY-2025-${Math.floor(100 + payments.length)}`,
      invoiceId: newInvoice.id,
      orderId: newOrder.id,
      orderType: 'B2B',
      customerName: customer.contactPerson,
      organizationName: customer.organizationName || customer.name,
      amount: total,
      method: 'Bank Transfer',
      status: 'Paid',
      date: newOrder.date,
      transactionRef: newInvoice.transactionRef || `TRX-${Date.now()}`,
      staffName: currentUser.name,
    };

    // Update customer stats & available credit
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customer.id) {
          return {
            ...c,
            totalOrders: c.totalOrders + 1,
            totalSpend: c.totalSpend + total,
            availableCredit: Math.max(0, c.availableCredit - total),
          };
        }
        return c;
      })
    );

    setB2bOrders((prev) => [newOrder, ...prev]);
    setInvoices((prev) => [newInvoice, ...prev]);
    setPayments((prev) => [newPayment, ...prev]);

    logAudit(
      'Created B2B Order',
      'B2B Orders',
      `Placed order ${orderNumber} for ${customer.name} with total ₹${total.toLocaleString('en-IN')}`,
      undefined,
      `₹${total.toLocaleString('en-IN')}`,
      orderNumber
    );

    // Notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'New B2B Order Placed',
        message: `${customer.name} placed ${orderNumber} for ₹${total.toLocaleString('en-IN')}`,
        time: 'Just now',
        type: 'order',
        read: false,
        linkTab: 'b2b-orders',
      },
      ...prev,
    ]);

    return { success: true, order: newOrder };
  };

  const updateB2BOrderStatus = (orderId: string, status: B2BOrder['status']) => {
    setB2bOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          logAudit('Updated Order Status', 'B2B Orders', `Order ${ord.orderNumber} status changed from ${ord.status} to ${status}`, ord.status, status, ord.orderNumber);
          return { ...ord, status };
        }
        return ord;
      })
    );
  };

  // Customer Storefront Order Placement & Shared Inventory Deduction
  const placeCustomerOrder = (orderData: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    shippingAddress?: string;
    items: { productId: string; quantity: number }[];
  }): { success: boolean; order?: CustomerOrder; error?: string } => {
    if (!orderData.items || orderData.items.length === 0) {
      return { success: false, error: 'Your order is empty. Please select products.' };
    }

    // Atomic Stock Check
    for (const item of orderData.items) {
      const inv = inventory[item.productId];
      const prod = products.find((p) => p.id === item.productId);
      if (!inv || !prod) {
        return { success: false, error: `Product not found in inventory: ${item.productId}` };
      }
      const avail = Math.max(0, inv.onHand - inv.reserved);
      if (item.quantity > avail) {
        return {
          success: false,
          error: `Only ${avail} unit(s) available for "${prod.name}".`,
        };
      }
    }

    const orderNumber = `ORD-${Math.floor(1002 + customerOrders.length)}`;
    let total = 0;
    let subtotal = 0;

    const orderItems: CustomerOrderItem[] = orderData.items.map((item) => {
      const prod = products.find((p) => p.id === item.productId)!;
      const disc = getEffectiveProductPrice(prod);
      const effectivePrice = disc.finalPrice;
      const itemTotal = effectivePrice * item.quantity;
      total += itemTotal;
      subtotal += itemTotal;

      // Deduct stock from shared inventory immediately
      adjustStock(
        prod.id,
        item.quantity,
        'OUT',
        `Customer Order ${orderNumber}`,
        'wh-ret'
      );

      return {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        image: prod.image,
        productType: prod.productType,
        quantity: item.quantity,
        unitPrice: effectivePrice,
        subtotal: itemTotal,
      };
    });

    const newOrder: CustomerOrder = {
      id: `ord-cust-${Date.now()}`,
      orderNumber,
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone || '',
      shippingAddress: orderData.shippingAddress || '',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      createdAt: new Date().toISOString(),
      items: orderItems,
      subtotal,
      total,
      status: 'New',
      paymentStatus: 'Pending',
      isDemo: false,
    };

    setCustomerOrders((prev) => [newOrder, ...prev]);

    logAudit(
      'Placed Customer Order',
      'B2C POS',
      `Customer ${orderData.customerName} placed order ${orderNumber} for ₹${total.toLocaleString('en-IN')}`,
      undefined,
      `₹${total.toLocaleString('en-IN')}`,
      orderNumber
    );

    setNotifications((prev) => [
      {
        id: `notif-cust-${Date.now()}`,
        title: 'New Customer Order Received',
        message: `${orderData.customerName} placed ${orderNumber} (₹${total.toLocaleString('en-IN')})`,
        time: 'Just now',
        type: 'order',
        read: false,
        linkTab: 'customer-orders',
      },
      ...prev,
    ]);

    return { success: true, order: newOrder };
  };

  const updateCustomerOrderStatus = (
    orderId: string,
    status: CustomerOrderStatus,
    paymentStatus?: CustomerPaymentStatus
  ) => {
    setCustomerOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const isCancelling = status === 'Cancelled' && ord.status !== 'Cancelled';
          const shouldRestock = isCancelling && !ord.restockedOnCancel;

          if (shouldRestock) {
            // Restore deducted stock for each item in the order
            ord.items.forEach((item) => {
              adjustStock(
                item.productId,
                item.quantity,
                'IN',
                `Order Cancelled ${ord.orderNumber}`,
                'wh-ret'
              );
            });
          }

          logAudit(
            'Updated Customer Order Status',
            'B2C POS',
            `Order ${ord.orderNumber} status changed from ${ord.status} to ${status}${shouldRestock ? ' (Stock Restored)' : ''}`,
            ord.status,
            status,
            ord.orderNumber
          );

          return {
            ...ord,
            status,
            ...(paymentStatus ? { paymentStatus } : {}),
            ...(shouldRestock ? { restockedOnCancel: true } : {}),
          };
        }
        return ord;
      })
    );
  };

  // Create B2C Sale (2-3 Click POS execution)
  const createB2CSale = (saleData: {
    items: { productId: string; quantity: number }[];
    paymentMethod: B2CSale['paymentMethod'];
    paymentStatus: B2CSale['paymentStatus'];
    customerName?: string;
  }): { success: boolean; sale?: B2CSale; error?: string } => {
    if (saleData.items.length === 0) {
      return { success: false, error: 'Cart is empty. Please select products.' };
    }

    // Verify stock
    for (const item of saleData.items) {
      const inv = inventory[item.productId];
      const prod = products.find((p) => p.id === item.productId);
      if (!inv || !prod) return { success: false, error: 'Product not found.' };
      const avail = inv.onHand - inv.reserved;
      if (item.quantity > avail) {
        return {
          success: false,
          error: `Insufficient stock for ${prod.name}! Only ${avail} available.`,
        };
      }
    }

    const saleNumber = `INV-20250519-0${Math.floor(124 + b2cSales.length)}`;
    let total = 0;
    let subtotal = 0;
    let gstTotal = 0;

    const saleItems: OrderItem[] = saleData.items.map((item) => {
      const prod = products.find((p) => p.id === item.productId)!;
      const itemTotal = prod.retailPrice * item.quantity;
      const basePrice = itemTotal / (1 + prod.gstPercent / 100);
      const gstAmt = itemTotal - basePrice;

      total += itemTotal;
      subtotal += basePrice;
      gstTotal += gstAmt;

      // Adjust inventory immediately for B2C retail counter
      adjustStock(prod.id, item.quantity, 'OUT', `B2C Sale (${saleNumber})`, 'wh-ret');

      return {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        image: prod.image,
        price: prod.retailPrice,
        quantity: item.quantity,
        subtotal: basePrice,
        gstPercent: prod.gstPercent,
        gstAmount: gstAmt,
        total: itemTotal,
      };
    });

    const newSale: B2CSale = {
      id: `sale-${Date.now()}`,
      saleNumber,
      isDemo: false,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      items: saleItems,
      subtotal,
      gstTotal,
      total,
      paymentStatus: saleData.paymentStatus,
      paymentMethod: saleData.paymentMethod,
      staffName: currentUser.name,
      customerName: saleData.customerName || 'Walk-in Customer',
      invoiceId: saleNumber,
    };

    // Auto create invoice & payment
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: saleNumber,
      isDemo: false,
      orderId: newSale.id,
      orderType: 'B2C',
      customerName: newSale.customerName || 'Walk-in Customer',
      billingAddress: 'Ronix Sports Retail Counter',
      date: newSale.date,
      dueDate: newSale.date,
      items: saleItems,
      subtotal,
      gstTotal,
      total,
      paymentStatus: saleData.paymentStatus === 'Paid' ? 'Paid' : 'Pending',
      paymentMethod: saleData.paymentMethod,
      transactionRef: `POS-${Date.now().toString().slice(-4)}`,
      notes: 'POS Counter Receipt',
    };

    if (saleData.paymentStatus === 'Paid') {
      const newPayment: Payment = {
        id: `pay-${Date.now()}`,
        paymentNumber: `PAY-2025-POS-${Math.floor(200 + payments.length)}`,
        isDemo: false,
        invoiceId: newInvoice.id,
        orderId: newSale.id,
        orderType: 'B2C',
        customerName: newSale.customerName || 'Walk-in Customer',
        amount: total,
        method: saleData.paymentMethod === 'UPI' ? 'UPI' : saleData.paymentMethod === 'Card' ? 'Card' : 'Cash',
        status: 'Paid',
        date: newSale.date,
        transactionRef: `POS-${saleData.paymentMethod.toUpperCase()}-${Date.now().toString().slice(-4)}`,
        staffName: currentUser.name,
      };
      setPayments((prev) => [newPayment, ...prev]);
    }

    setB2cSales((prev) => [newSale, ...prev]);
    setInvoices((prev) => [newInvoice, ...prev]);

    logAudit(
      'Completed B2C Sale',
      'B2C POS',
      `Processed POS sale ${saleNumber} for ₹${total.toLocaleString('en-IN')} via ${saleData.paymentMethod}`,
      undefined,
      `₹${total.toLocaleString('en-IN')}`,
      saleNumber
    );

    return { success: true, sale: newSale };
  };

  // Place D2C Storefront Order (Shared Inventory)
  const placeD2COrder = (orderData: {
    customerName: string;
    phone: string;
    email: string;
    address: string;
    items: { productId: string; quantity: number }[];
    paymentMethod: 'UPI' | 'Card' | 'Net Banking' | 'COD' | string;
  }): { success: boolean; sale?: B2CSale; invoiceId?: string; error?: string } => {
    if (!orderData.items || orderData.items.length === 0) {
      return { success: false, error: 'Your cart is empty.' };
    }

    // Atomic stock check
    for (const item of orderData.items) {
      const inv = inventory[item.productId];
      const prod = products.find((p) => p.id === item.productId);
      if (!inv || !prod) {
        return { success: false, error: `Product not found in inventory: ${item.productId}` };
      }
      const avail = inv.onHand - inv.reserved;
      if (item.quantity > avail) {
        return {
          success: false,
          error: `Only ${avail} unit(s) of "${prod.name}" are currently available in stock.`,
        };
      }
    }

    const orderNumber = `ORD-D2C-${Date.now().toString().slice(-6)}`;
    let total = 0;
    let subtotal = 0;
    let gstTotal = 0;

    const saleItems: OrderItem[] = orderData.items.map((item) => {
      const prod = products.find((p) => p.id === item.productId)!;
      const itemTotal = prod.retailPrice * item.quantity;
      const basePrice = Math.round((itemTotal / (1 + prod.gstPercent / 100)) * 100) / 100;
      const gstAmt = itemTotal - basePrice;

      total += itemTotal;
      subtotal += basePrice;
      gstTotal += gstAmt;

      // SHARED INVENTORY DEDUCTION IMMEDIATELY
      adjustStock(prod.id, item.quantity, 'OUT', `D2C Storefront Order (${orderNumber})`, 'wh-ret');

      return {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        image: prod.image,
        price: prod.retailPrice,
        quantity: item.quantity,
        subtotal: basePrice,
        gstPercent: prod.gstPercent,
        gstAmount: gstAmt,
        total: itemTotal,
      };
    });

    const isPaid = orderData.paymentMethod !== 'COD';

    const newSale: B2CSale = {
      id: `sale-d2c-${Date.now()}`,
      saleNumber: orderNumber,
      isDemo: false,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      items: saleItems,
      subtotal,
      gstTotal,
      total,
      paymentStatus: isPaid ? 'Paid' : 'Unpaid',
      paymentMethod: orderData.paymentMethod === 'UPI' ? 'UPI' : orderData.paymentMethod === 'Card' ? 'Card' : 'Other',
      staffName: 'Online Customer (D2C)',
      customerName: orderData.customerName,
      invoiceId: `INV-${orderNumber}`,
    };

    const newInvoice: Invoice = {
      id: `inv-d2c-${Date.now()}`,
      invoiceNumber: `INV-${orderNumber}`,
      isDemo: false,
      orderId: newSale.id,
      orderType: 'B2C',
      customerName: orderData.customerName,
      billingAddress: orderData.address,
      date: newSale.date,
      dueDate: newSale.date,
      items: saleItems,
      subtotal,
      gstTotal,
      total,
      paymentStatus: isPaid ? 'Paid' : 'Pending',
      paymentMethod: orderData.paymentMethod as any,
      transactionRef: `TXN-D2C-${Date.now().toString().slice(-6)}`,
      notes: `Online D2C Order placed via customer storefront. Contact: ${orderData.phone}, Email: ${orderData.email}`,
    };

    if (isPaid) {
      const newPayment: Payment = {
        id: `pay-d2c-${Date.now()}`,
        paymentNumber: `PAY-D2C-${Date.now().toString().slice(-5)}`,
        isDemo: false,
        invoiceId: newInvoice.id,
        orderId: newSale.id,
        orderType: 'B2C',
        customerName: orderData.customerName,
        amount: total,
        method: orderData.paymentMethod === 'UPI' ? 'UPI' : orderData.paymentMethod === 'Card' ? 'Card' : 'Cash',
        status: 'Paid',
        date: newSale.date,
        transactionRef: newInvoice.transactionRef,
        staffName: 'Online Gateway',
      };
      setPayments((prev) => [newPayment, ...prev]);
    }

    setB2cSales((prev) => [newSale, ...prev]);
    setInvoices((prev) => [newInvoice, ...prev]);

    logAudit(
      'D2C Storefront Order Placed',
      'B2C POS',
      `Online customer ${orderData.customerName} placed order ${orderNumber} for ₹${total.toLocaleString('en-IN')}`,
      undefined,
      `₹${total.toLocaleString('en-IN')}`,
      orderNumber
    );

    setNotifications((prev) => [
      {
        id: `notif-d2c-${Date.now()}`,
        title: 'New Online D2C Store Order',
        message: `${orderData.customerName} placed ${orderNumber} (₹${total.toLocaleString('en-IN')})`,
        time: 'Just now',
        type: 'order',
        read: false,
        linkTab: 'invoices',
      },
      ...prev,
    ]);

    return { success: true, sale: newSale, invoiceId: newInvoice.invoiceNumber };
  };

  // Add new Product
  const addProduct = (
    productData: Omit<Product, 'id' | 'createdAt'>,
    openingStock: number = 0,
    warehouseId: string = currentWarehouse.id
  ): Product => {
    const newId = `prod-${Date.now().toString().slice(-6)}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
      isDemo: false,
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Register category if new
    if (productData.category) {
      addCategory(productData.category);
    }

    setProducts((prev) => [newProduct, ...prev]);

    // Setup inventory
    setInventory((prev) => ({
      ...prev,
      [newId]: {
        productId: newId,
        onHand: openingStock,
        reserved: 0,
        available: openingStock,
        locationStock: {
          [warehouseId]: openingStock,
        },
      },
    }));

    if (openingStock > 0) {
      const ledgerEntry: InventoryMovement = {
        id: `mov-${Date.now()}`,
        timestamp: new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        productId: newId,
        productName: newProduct.name,
        sku: newProduct.sku,
        change: openingStock,
        prevStock: 0,
        newStock: openingStock,
        reason: 'Opening Stock for New Product',
        user: currentUser.name,
        reference: 'INIT-STOCK',
        warehouseId,
      };
      setInventoryLedger((prev) => [ledgerEntry, ...prev]);
    }

    // Default pricing rule
    const newPricingRule: PricingRule = {
      id: `price-${newId}`,
      productId: newId,
      productName: newProduct.name,
      standardPrice: newProduct.retailPrice,
      bulkTiers: [
        { minQty: 100, price: Math.round(newProduct.b2bPrice * 1.05), discountLabel: '5% Bulk Tier' },
        { minQty: 500, price: newProduct.b2bPrice, discountLabel: 'Standard B2B Tier' },
      ],
      customerPrices: [],
      updatedAt: new Date().toISOString().split('T')[0],
      updatedBy: currentUser.name,
    };
    setPricingRules((prev) => [newPricingRule, ...prev]);

    logAudit(
      'Created Product',
      'Products',
      `Added new product ${newProduct.name} (${newProduct.sku}) with opening stock of ${openingStock} units`,
      undefined,
      `${newProduct.name} - SKU: ${newProduct.sku}`,
      newProduct.sku
    );

    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    if (updates.category) {
      addCategory(updates.category);
    }
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          logAudit('Updated Product', 'Products', `Modified product details for ${p.name}`, JSON.stringify(p), JSON.stringify({ ...p, ...updates }), p.sku);
          return { ...p, ...updates };
        }
        return p;
      })
    );
  };

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      logAudit('Deleted Product', 'Products', `Deactivated product ${prod.name} (${prod.sku})`, prod.name, 'Deleted', prod.sku);
    }
  };

  // Customer Management
  const addCustomer = (customerData: Omit<Customer, 'id' | 'totalOrders' | 'totalSpend' | 'joinedDate'>): Customer => {
    const newId = `cust-${Date.now().toString().slice(-6)}`;
    const newCustomer: Customer = {
      ...customerData,
      id: newId,
      isDemo: false,
      totalOrders: 0,
      totalSpend: 0,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    logAudit('Created Customer', 'Customers', `Registered new ${newCustomer.type} customer: ${newCustomer.name}`, undefined, newCustomer.name, newId);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          logAudit('Updated Customer', 'Customers', `Updated details for customer ${c.name}`, undefined, undefined, c.id);
          return { ...c, ...updates };
        }
        return c;
      })
    );
  };

  const deleteCustomer = (id: string) => {
    const cust = customers.find((c) => c.id === id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    if (cust) {
      logAudit('Deleted Customer', 'Customers', `Removed customer record: ${cust.name}`, cust.name, undefined, id);
    }
  };

  // Pricing Rules Management
  const updatePricingRule = (productId: string, updates: Partial<PricingRule>): boolean => {
    if (currentUser.role !== 'Admin') {
      alert('Permission Denied: Only Admin can modify pricing rules!');
      return false;
    }

    setPricingRules((prev) =>
      prev.map((rule) => {
        if (rule.productId === productId) {
          logAudit('Updated Pricing Rules', 'Pricing', `Updated price rule for product ${rule.productName}`, JSON.stringify(rule), JSON.stringify({ ...rule, ...updates }), rule.productId);
          return {
            ...rule,
            ...updates,
            updatedAt: new Date().toISOString().split('T')[0],
            updatedBy: currentUser.name,
          };
        }
        return rule;
      })
    );
    return true;
  };

  // Invoices & Quotations
  const createInvoice = (invoiceData: Partial<Invoice> & { customerName: string; items: OrderItem[]; total: number }): Invoice => {
    const invoiceNumber = invoiceData.invoiceNumber || `INV-${invoiceData.orderType || 'B2B'}-2025-${Math.floor(600 + invoices.length)}`;
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      isDemo: false,
      orderType: invoiceData.orderType || 'B2B',
      customerName: invoiceData.customerName,
      organizationName: invoiceData.organizationName,
      contactPerson: invoiceData.contactPerson,
      phone: invoiceData.phone,
      email: invoiceData.email,
      billingAddress: invoiceData.billingAddress || 'Default Address',
      shippingAddress: invoiceData.shippingAddress,
      gstNumber: invoiceData.gstNumber,
      placeOfSupply: invoiceData.placeOfSupply,
      date: invoiceData.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      paymentTerms: invoiceData.paymentTerms || 'Net 30 Days',
      referenceNumber: invoiceData.referenceNumber,
      items: invoiceData.items,
      subtotal: invoiceData.subtotal ?? invoiceData.items.reduce((acc, i) => acc + i.subtotal, 0),
      discountAmount: invoiceData.discountAmount || 0,
      gstTotal: invoiceData.gstTotal ?? invoiceData.items.reduce((acc, i) => acc + (i.gstAmount || 0), 0),
      total: invoiceData.total,
      paymentStatus: invoiceData.paymentStatus || 'Pending',
      paymentMethod: invoiceData.paymentMethod,
      transactionRef: invoiceData.transactionRef,
      notes: invoiceData.notes,
      createdBy: currentUser.name,
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    logAudit('Created Invoice', 'Invoices', `Generated invoice ${invoiceNumber} for ${newInvoice.customerName}`, undefined, `₹${newInvoice.total.toLocaleString('en-IN')}`, invoiceNumber);
    return newInvoice;
  };

  const updateInvoice = (invoiceId: string, updates: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          logAudit(
            'Updated Invoice',
            'Invoices',
            `Updated invoice details for ${inv.invoiceNumber}`,
            undefined,
            undefined,
            inv.invoiceNumber
          );
          return { ...inv, ...updates };
        }
        return inv;
      })
    );
  };

  const updateInvoiceStatus = (invoiceId: string, status: Invoice['paymentStatus']) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          logAudit('Updated Invoice Status', 'Invoices', `Invoice ${inv.invoiceNumber} status marked as ${status}`, inv.paymentStatus, status, inv.invoiceNumber);
          return { ...inv, paymentStatus: status };
        }
        return inv;
      })
    );
  };

  const deleteInvoice = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));
    if (inv) {
      logAudit('Deleted Invoice', 'Invoices', `Removed tax invoice: ${inv.invoiceNumber}`, inv.invoiceNumber, undefined, invoiceId);
    }
  };

  const createQuotation = (data: Partial<Quotation> & {
    customerId?: string;
    items?: { productId: string; quantity: number }[] | OrderItem[];
    validDays?: number;
    discountAmount?: number;
    notes?: string;
  }): Quotation => {
    const customer = customers.find((c) => c.id === data.customerId);
    const quoteNumber = data.quoteNumber || `QT-2025-${Math.floor(1002 + quotations.length)}`;
    const validDays = data.validDays || 30;

    let subtotal = 0;
    let gstTotal = 0;

    const rawItems = data.items || [];
    const quoteItems: OrderItem[] = rawItems.map((item: any) => {
      // Check if it's already an OrderItem
      if (item.productName && item.price !== undefined) {
        subtotal += item.subtotal || item.price * item.quantity;
        gstTotal += item.gstAmount || ((item.price * item.quantity * (item.gstPercent || 18)) / 100);
        return item as OrderItem;
      }
      const prod = products.find((p) => p.id === item.productId)!;
      const pricing = getPriceForCustomer(item.productId, customer?.id, item.quantity);
      const itemSubtotal = pricing.unitPrice * item.quantity;
      const gstAmt = (itemSubtotal * (prod?.gstPercent || 18)) / 100;
      subtotal += itemSubtotal;
      gstTotal += gstAmt;

      return {
        productId: prod?.id || item.productId,
        productName: prod?.name || 'Custom Product',
        sku: prod?.sku || 'SKU-GEN',
        image: prod?.image || '',
        price: pricing.unitPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        gstPercent: prod?.gstPercent || 18,
        gstAmount: gstAmt,
        total: itemSubtotal + gstAmt,
      };
    });

    const discount = data.discountAmount || 0;
    const finalTotal = data.total ?? Math.max(0, subtotal - discount + gstTotal);

    const newQuote: Quotation = {
      id: `quote-${Date.now()}`,
      isDemo: false,
      quoteNumber,
      headline: data.headline || 'Quotation for Sports Equipment',
      reference: data.reference || `REF-${Date.now().toString().slice(-4)}`,
      currency: data.currency || 'INR',
      customerId: customer?.id || data.customerId || 'guest',
      customerName: data.customerName || customer?.contactPerson || customer?.name || 'Prospective Buyer',
      organizationName: data.organizationName || customer?.organizationName || customer?.name || 'Institutional Client',
      contactPerson: data.contactPerson || customer?.contactPerson || 'Sir / Madam',
      phone: data.phone || customer?.phone || '',
      email: data.email || customer?.email || '',
      billingAddress: data.billingAddress || customer?.billingAddress || '',
      shippingAddress: data.shippingAddress || customer?.shippingAddress || '',
      clientGstNumber: data.clientGstNumber || customer?.gstNumber || '',
      placeOfSupply: data.placeOfSupply || 'Maharashtra (27)',
      date: data.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      validUntil: data.validUntil || new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      items: quoteItems,
      subtotal: data.subtotal ?? subtotal,
      discountAmount: discount,
      gstTotal: data.gstTotal ?? gstTotal,
      total: finalTotal,
      status: data.status || 'Draft',
      notes: data.notes || 'Institutional quotation valid for 30 days. All standard warranties apply.',
      terms: data.terms || '1. 50% advance along with confirmed PO.\n2. Delivery within 7 working days from date of advance.\n3. Goods once sold cannot be returned.',
      createdBy: currentUser.name,
    };

    setQuotations((prev) => [newQuote, ...prev]);
    logAudit('Created Quotation', 'Quotations', `Generated Quotation ${quoteNumber} for ${newQuote.organizationName} (₹${finalTotal.toLocaleString('en-IN')})`, undefined, quoteNumber, quoteNumber);

    return newQuote;
  };

  const updateQuotation = (quotationId: string, updates: Partial<Quotation>) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === quotationId) {
          logAudit('Updated Quotation', 'Quotations', `Updated quotation ${q.quoteNumber}`, undefined, undefined, q.quoteNumber);
          return { ...q, ...updates };
        }
        return q;
      })
    );
  };

  const deleteQuotation = (quotationId: string) => {
    const q = quotations.find((item) => item.id === quotationId);
    setQuotations((prev) => prev.filter((item) => item.id !== quotationId));
    if (q) {
      logAudit('Deleted Quotation', 'Quotations', `Deleted quotation: ${q.quoteNumber}`, q.quoteNumber, undefined, quotationId);
    }
  };

  const convertQuotationToOrder = (quotationId: string): { success: boolean; order?: B2BOrder; error?: string } => {
    const quote = quotations.find((q) => q.id === quotationId);
    if (!quote) return { success: false, error: 'Quotation not found.' };

    if (quote.status === 'Converted') {
      return { success: false, error: 'This quotation has already been converted to an order.' };
    }

    // Place B2B order from quote items
    const result = placeB2BOrder({
      customerId: quote.customerId,
      items: quote.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      notes: `Converted from Quotation ${quote.quoteNumber}. ${quote.notes || ''}`,
    });

    if (result.success && result.order) {
      setQuotations((prev) =>
        prev.map((q) => {
          if (q.id === quotationId) {
            return { ...q, status: 'Converted', convertedOrderId: result.order?.orderNumber };
          }
          return q;
        })
      );
      logAudit('Converted Quotation to Order', 'Quotations', `Converted ${quote.quoteNumber} to ${result.order.orderNumber}`, quote.quoteNumber, result.order.orderNumber, quote.quoteNumber);
    }

    return result;
  };

  // Payments
  const recordPayment = (paymentData: {
    invoiceId?: string;
    orderId?: string;
    orderType?: 'B2B' | 'B2C';
    customerId?: string;
    customerName?: string;
    organizationName?: string;
    amount: number;
    method: Payment['method'] | string;
    transactionRef?: string;
    referenceNumber?: string;
    notes?: string;
  }): Payment => {
    const customer = paymentData.customerId ? customers.find((c) => c.id === paymentData.customerId) : null;
    const paymentNumber = `PAY-2025-${Math.floor(300 + payments.length)}`;
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      paymentNumber,
      isDemo: false,
      invoiceId: paymentData.invoiceId,
      orderId: paymentData.orderId,
      orderType: paymentData.orderType || 'B2B',
      customerName: paymentData.customerName || customer?.contactPerson || customer?.name || 'Valued Customer',
      organizationName: paymentData.organizationName || customer?.organizationName || customer?.name,
      amount: Number(paymentData.amount),
      method: (paymentData.method as Payment['method']) || 'NEFT',
      status: 'Paid',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      transactionRef: paymentData.transactionRef || paymentData.referenceNumber || `TXN-${Date.now().toString().slice(-6)}`,
      staffName: currentUser.name,
      notes: paymentData.notes,
    };

    setPayments((prev) => [newPayment, ...prev]);

    // If linked to invoice, mark invoice paid
    if (paymentData.invoiceId) {
      updateInvoiceStatus(paymentData.invoiceId, 'Paid');
    }

    logAudit('Recorded Payment', 'Payments', `Recorded payment of ₹${Number(paymentData.amount).toLocaleString('en-IN')} via ${paymentData.method} for ${newPayment.customerName}`, undefined, paymentNumber, paymentNumber);

    return newPayment;
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Reset to initial demo data without touching user records
  const resetDemoData = () => {
    // Keep user-created items (where isDemo is false and id not in demo IDs)
    const userProducts = products.filter((p) => p.isDemo === false && !DEMO_PRODUCT_IDS.has(p.id));
    const userCustomers = customers.filter((c) => c.isDemo === false && !DEMO_CUSTOMER_IDS.has(c.id));
    const userInvoices = invoices.filter((i) => i.isDemo === false && !DEMO_INVOICE_IDS.has(i.id));
    const userQuotations = quotations.filter((q) => q.isDemo === false && !DEMO_QUOTATION_IDS.has(q.id));
    const userB2bOrders = b2bOrders.filter((o) => o.isDemo === false && !DEMO_ORDER_IDS.has(o.id));
    const userB2cSales = b2cSales.filter((s) => s.isDemo === false && !DEMO_SALE_IDS.has(s.id));
    const userPayments = payments.filter((p) => p.isDemo === false && !DEMO_PAYMENT_IDS.has(p.id));

    // Preserve user products inventory and ledger
    const userProdIds = new Set(userProducts.map((p) => p.id));
    const userInventory: Record<string, InventoryItem> = {};
    for (const [k, v] of Object.entries(inventory)) {
      if (userProdIds.has(k) && !DEMO_PRODUCT_IDS.has(k) && v) {
        userInventory[k] = v as InventoryItem;
      }
    }
    const userLedger = inventoryLedger.filter((l) => (l.productId && userProdIds.has(l.productId)) || (l.isDemo === false && !DEMO_LEDGER_IDS.has(l.id)));

    const freshDemoProducts = tagWithDemo(INITIAL_PRODUCTS);
    const freshDemoCustomers = tagWithDemo(INITIAL_CUSTOMERS);
    const freshDemoInvoices = tagWithDemo(INITIAL_INVOICES);
    const freshDemoQuotations = tagWithDemo(INITIAL_QUOTATIONS);
    const freshDemoB2bOrders = tagWithDemo(INITIAL_B2B_ORDERS);
    const freshDemoB2cSales = tagWithDemo(INITIAL_B2C_SALES);
    const freshDemoPayments = tagWithDemo(INITIAL_PAYMENTS);

    setProducts([...freshDemoProducts, ...userProducts]);
    setCustomers([...freshDemoCustomers, ...userCustomers]);
    setInvoices([...freshDemoInvoices, ...userInvoices]);
    setQuotations([...freshDemoQuotations, ...userQuotations]);
    setB2bOrders([...freshDemoB2bOrders, ...userB2bOrders]);
    setB2cSales([...freshDemoB2cSales, ...userB2cSales]);
    setPayments([...freshDemoPayments, ...userPayments]);
    setInventory({ ...INITIAL_INVENTORY, ...userInventory });
    setInventoryLedger([...INITIAL_INVENTORY_LEDGER, ...userLedger]);
    setPricingRules(INITIAL_PRICING_RULES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  const resetToDemoData = () => {
    resetDemoData();
  };

  // Filter lists based on Demo Mode setting
  const visibleProducts = useMemo(
    () => (isDemoMode ? products : products.filter((p) => !isDemoRecord(p, DEMO_PRODUCT_IDS))),
    [isDemoMode, products]
  );
  const visibleCustomers = useMemo(
    () => (isDemoMode ? customers : customers.filter((c) => !isDemoRecord(c, DEMO_CUSTOMER_IDS))),
    [isDemoMode, customers]
  );
  const visibleInvoices = useMemo(
    () => (isDemoMode ? invoices : invoices.filter((i) => !isDemoRecord(i, DEMO_INVOICE_IDS))),
    [isDemoMode, invoices]
  );
  const visibleQuotations = useMemo(
    () => (isDemoMode ? quotations : quotations.filter((q) => !isDemoRecord(q, DEMO_QUOTATION_IDS))),
    [isDemoMode, quotations]
  );
  const visibleB2bOrders = useMemo(
    () => (isDemoMode ? b2bOrders : b2bOrders.filter((o) => !isDemoRecord(o, DEMO_ORDER_IDS))),
    [isDemoMode, b2bOrders]
  );
  const visibleCustomerOrders = useMemo(
    () => (isDemoMode ? customerOrders : customerOrders.filter((o) => !isDemoRecord(o, DEMO_CUSTOMER_ORDER_IDS))),
    [isDemoMode, customerOrders]
  );
  const visibleB2cSales = useMemo(
    () => (isDemoMode ? b2cSales : b2cSales.filter((s) => !isDemoRecord(s, DEMO_SALE_IDS))),
    [isDemoMode, b2cSales]
  );
  const visiblePayments = useMemo(
    () => (isDemoMode ? payments : payments.filter((p) => !isDemoRecord(p, DEMO_PAYMENT_IDS))),
    [isDemoMode, payments]
  );

  // Filter inventory: when demo mode is OFF, hide demo product stock
  const visibleInventory: Record<string, InventoryItem> = useMemo(() => {
    if (isDemoMode) return inventory;
    const filtered: Record<string, InventoryItem> = {};
    const visibleProdIds = new Set(visibleProducts.map((p) => p.id));
    for (const [id, item] of Object.entries(inventory || {})) {
      if (visibleProdIds.has(id) && item) {
        filtered[id] = item as InventoryItem;
      }
    }
    return filtered;
  }, [isDemoMode, inventory, visibleProducts]);

  // Filter ledger: when demo mode is OFF, hide demo product movements
  const visibleInventoryLedger = useMemo(() => {
    if (isDemoMode) return inventoryLedger;
    const visibleProdIds = new Set(visibleProducts.map((p) => p.id));
    return inventoryLedger.filter(
      (mov) =>
        mov &&
        visibleProdIds.has(mov.productId) &&
        !isDemoRecord(mov, DEMO_LEDGER_IDS)
    );
  }, [isDemoMode, inventoryLedger, visibleProducts]);

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        currentWarehouse,
        users,
        warehouses,
        setCurrentUser,
        setCurrentWarehouse,
        activeTab,
        setActiveTab,
        products: visibleProducts,
        categories,
        addCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        inventory: visibleInventory,
        inventoryLedger: visibleInventoryLedger,
        adjustStock,
        reserveStockAtomic,
        releaseStockReservation,
        b2bOrders: visibleB2bOrders,
        placeB2BOrder,
        updateB2BOrderStatus,
        customerOrders: visibleCustomerOrders,
        placeCustomerOrder,
        updateCustomerOrderStatus,
        b2cSales: visibleB2cSales,
        createB2CSale,
        placeD2COrder,
        customers: visibleCustomers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        pricingRules,
        updatePricingRule,
        getPriceForCustomer,
        invoices: visibleInvoices,
        createInvoice,
        updateInvoice,
        updateInvoiceStatus,
        deleteInvoice,
        quotations: visibleQuotations,
        createQuotation,
        updateQuotation,
        deleteQuotation,
        convertQuotationToOrder,
        payments: visiblePayments,
        recordPayment,
        auditLogs,
        logAudit,
        notifications,
        markNotificationRead,
        clearNotifications,
        searchTerm,
        setSearchTerm,
        resetToDemoData,
        isDemoMode,
        setDemoMode,
        toggleDemoMode,
        resetDemoData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
