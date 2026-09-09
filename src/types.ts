export type UserRole = 'Admin' | 'Staff' | 'B2B_Buyer';

export type AppRole = 'admin' | 'stock' | 'customer';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: AppRole;
  status: 'Active' | 'Inactive';
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title: string;
  organizationId?: string;
  organizationName?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  isDefault?: boolean;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: 'Bats' | 'Balls' | 'Helmets' | 'Gloves' | 'Pads' | 'Bags' | 'Accessories' | 'Footwear' | 'Cricket' | 'Football' | 'Badminton' | 'Basketball' | 'Fitness' | string;
  brand: string;
  image: string;
  description: string;
  costPrice: number;
  retailPrice: number;
  b2bPrice: number;
  minStockLevel: number;
  gstPercent: number;
  status: 'Active' | 'Inactive' | 'Draft';
  createdAt: string;
  mrp?: number;
  rating?: number;
  reviewsCount?: number;
  features?: string[];
  specifications?: Record<string, string>;
  gallery?: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  unit?: string;
  hsnCode?: string;
  productType?: string;
  subCategory?: string;
  isDemo?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface InventoryItem {
  productId: string;
  onHand: number;
  reserved: number;
  available: number;
  locationStock: { [locationId: string]: number };
}

export interface InventoryMovement {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  sku: string;
  change: number; // positive for in, negative for out
  prevStock: number;
  newStock: number;
  reason: string;
  user: string;
  reference: string;
  orderId?: string;
  warehouseId?: string;
  isDemo?: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  image: string;
  price: number; // Locked historical price
  quantity: number;
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  total: number;
}

export interface B2BOrder {
  id: string;
  orderNumber: string;
  organizationId: string;
  organizationName: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  gstTotal: number;
  total: number;
  status: 'Confirmed' | 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  paidAmount: number;
  notes?: string;
  invoiceId?: string;
  createdBy: string;
  isDemo?: boolean;
}

export type CustomerOrderStatus = 'New' | 'Confirmed' | 'Processing' | 'Ready' | 'Shipped' | 'Delivered' | 'Cancelled';
export type CustomerPaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface CustomerOrderItem {
  id?: string;
  orderId?: string;
  productId: string;
  productName: string;
  sku: string;
  image?: string;
  productType?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  date: string;
  createdAt: string;
  items: CustomerOrderItem[];
  subtotal: number;
  total: number;
  status: CustomerOrderStatus;
  paymentStatus: CustomerPaymentStatus;
  restockedOnCancel?: boolean;
  notes?: string;
  isDemo?: boolean;
}

export interface B2CSale {
  id: string;
  saleNumber: string;
  date: string;
  time: string;
  items: OrderItem[];
  subtotal: number;
  gstTotal: number;
  total: number;
  paymentStatus: 'Paid' | 'Unpaid';
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Other';
  staffName: string;
  invoiceId?: string;
  customerName?: string;
  isDemo?: boolean;
}

export interface Customer {
  id: string;
  type: 'B2B' | 'B2C';
  name: string;
  organizationName?: string;
  organizationType?: 'College' | 'University' | 'Sports Academy' | 'School' | 'Club' | 'Institution' | 'Individual' | string;
  contactPerson: string;
  phone: string;
  email: string;
  billingAddress: string;
  shippingAddress: string;
  gstNumber?: string;
  creditLimit: number;
  availableCredit: number;
  creditDays?: number;
  outstandingBalance?: number;
  priceTier?: 'Standard' | 'Silver' | 'Gold' | 'Platinum' | 'B2B Tier 1' | 'B2B Tier 2' | string;
  paymentTerms?: string;
  notes?: string;
  authorizedUsers: string[];
  customPricing: { [productId: string]: number };
  totalOrders: number;
  totalSpend: number;
  status: 'Active' | 'Blocked';
  joinedDate: string;
  isDemo?: boolean;
}

export interface PricingRule {
  id: string;
  productId: string;
  productName: string;
  standardPrice: number;
  bulkTiers: { minQty: number; price: number; discountLabel: string }[];
  customerPrices: { customerId: string; customerName: string; price: number }[];
  updatedAt: string;
  updatedBy: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId?: string;
  orderType: 'B2B' | 'B2C';
  customerId?: string;
  customerName: string;
  organizationName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  billingAddress: string;
  shippingAddress?: string;
  gstNumber?: string;
  placeOfSupply?: string;
  date: string;
  dueDate: string;
  paymentTerms?: string;
  referenceNumber?: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount?: number;
  gstTotal: number;
  total: number;
  paidAmount?: number;
  balanceDue?: number;
  paymentStatus: 'Paid' | 'Pending' | 'Partial' | 'Overdue' | 'Unpaid';
  paymentMethod?: string;
  transactionRef?: string;
  notes?: string;
  createdBy?: string;
  isDemo?: boolean;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  headline?: string;
  reference?: string;
  currency?: string;
  customerId: string;
  customerName: string;
  organizationName: string;
  contactPerson: string;
  phone: string;
  email: string;
  billingAddress?: string;
  shippingAddress?: string;
  clientGstNumber?: string;
  placeOfSupply?: string;
  date: string;
  validUntil: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  gstTotal: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Converted' | 'Expired';
  notes?: string;
  terms?: string;
  convertedOrderId?: string;
  createdBy: string;
  isDemo?: boolean;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId?: string;
  orderId?: string;
  orderType: 'B2B' | 'B2C';
  customerName: string;
  organizationName?: string;
  amount: number;
  method: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Razorpay' | 'NEFT' | 'RTGS' | 'Cheque' | 'Other';
  status: 'Paid' | 'Pending' | 'Partial' | 'Failed' | 'Refunded';
  date: string;
  transactionRef: string;
  razorpayOrderId?: string;
  isDemo?: boolean;
  staffName: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  module: 'B2B Orders' | 'B2C POS' | 'Inventory' | 'Products' | 'Pricing' | 'Customers' | 'Invoices' | 'Quotations' | 'Payments' | 'Settings' | 'Users';
  details: string;
  oldValue?: string;
  newValue?: string;
  referenceId?: string;
  ip?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'alert' | 'order' | 'payment' | 'inventory';
  read: boolean;
  linkTab?: string;
}
