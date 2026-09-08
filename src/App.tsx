import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { B2BOrderFlowView } from './components/B2BOrderFlowView';
import { B2CPosView } from './components/B2CPosView';
import { InventoryView } from './components/InventoryView';
import { ProductsView } from './components/ProductsView';
import { CustomersView } from './components/CustomersView';
import { PricingRulesView } from './components/PricingRulesView';
import { InvoicesView } from './components/InvoicesView';
import { QuotationsView } from './components/QuotationsView';
import { PaymentsView } from './components/PaymentsView';
import { ReportsView } from './components/ReportsView';
import { AuditTrailView } from './components/AuditTrailView';
import { SettingsView } from './components/SettingsView';
import { CustomerStorefront } from './components/storefront/CustomerStorefront';
import {
  AddProductModal,
  RecordPaymentModal,
  InventoryAdjustModal,
} from './components/Modals';

// Root Redirect component based on logged-in role
const RootRedirect: React.FC = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#E31B23] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            Loading Ronix Sports CRM...
          </span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.role === 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  if (profile.role === 'stock') {
    return <Navigate to="/inventory" replace />;
  }
  if (profile.role === 'customer') {
    return <Navigate to="/store" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

// Route wrapper for Login/Signup: Redirect authenticated users to their home
const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (profile) {
    if (profile.role === 'admin') return <Navigate to="/dashboard" replace />;
    if (profile.role === 'stock') return <Navigate to="/inventory" replace />;
    if (profile.role === 'customer') return <Navigate to="/store" replace />;
  }

  return <>{children}</>;
};

const CrmLayout: React.FC = () => {
  const { setActiveTab } = useStore();
  const { profile } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isInventoryAdjustOpen, setIsInventoryAdjustOpen] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState<string | undefined>(undefined);
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');

  const handleOpenAddStock = (productId?: string) => {
    setAdjustProductId(productId);
    setAdjustType('IN');
    setIsInventoryAdjustOpen(true);
  };

  const handleOpenRemoveStock = (productId?: string) => {
    setAdjustProductId(productId);
    setAdjustType('OUT');
    setIsInventoryAdjustOpen(true);
  };

  // Synchronize route pathname with activeTab
  useEffect(() => {
    const rawPath = location.pathname.replace(/^\//, '').split('/')[0] || 'dashboard';
    if (rawPath === 'store' || rawPath === 'storefront') {
      setActiveTab('storefront');
    } else if (rawPath) {
      setActiveTab(rawPath);
    }
  }, [location.pathname, setActiveTab]);

  const isStorefront = location.pathname.startsWith('/store') || location.pathname.startsWith('/customer-storefront');
  const isCustomerRole = profile?.role === 'customer';

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#111827] font-sans antialiased overflow-hidden selection:bg-[#E31B23] selection:text-white relative">
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && !isCustomerRole && (
        <div
          id="mobile-drawer-backdrop"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Left Navigation Sidebar (Hidden for Customer Role) */}
      {!isCustomerRole && <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header onMenuToggle={() => setMobileOpen(!mobileOpen)} />

        {/* Dynamic Main Workspace Content */}
        <main className={`flex-1 overflow-y-auto ${isStorefront || isCustomerRole ? 'p-4 sm:p-6 max-w-[1600px] w-full mx-auto' : 'p-4 sm:p-6 lg:p-6.5 max-w-[1600px] w-full mx-auto'}`}>
          <Routes>
            {/* Dashboard (Admin Only) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardView
                    onOpenAddProductModal={() => setIsAddProductOpen(true)}
                    onOpenRecordPaymentModal={() => setIsRecordPaymentOpen(true)}
                    onOpenInventoryAdjustModal={() => handleOpenAddStock()}
                  />
                </ProtectedRoute>
              }
            />

            {/* Inventory (Admin & Stock Staff) */}
            <Route
              path="/inventory"
              element={
                <ProtectedRoute allowedRoles={['admin', 'stock']}>
                  <InventoryView
                    onOpenAddProductModal={() => setIsAddProductOpen(true)}
                    onOpenAddStockModal={handleOpenAddStock}
                    onOpenRemoveStockModal={handleOpenRemoveStock}
                  />
                </ProtectedRoute>
              }
            />

            {/* Products (Admin & Stock Staff) */}
            <Route
              path="/products"
              element={
                <ProtectedRoute allowedRoles={['admin', 'stock']}>
                  <ProductsView
                    onOpenAddProductModal={() => setIsAddProductOpen(true)}
                    onOpenAdjustStockModal={handleOpenAddStock}
                  />
                </ProtectedRoute>
              }
            />

            {/* B2B Orders (Admin Only) */}
            <Route
              path="/b2b-orders"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <B2BOrderFlowView />
                </ProtectedRoute>
              }
            />

            {/* Quotations (Admin Only) */}
            <Route
              path="/quotations"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <QuotationsView />
                </ProtectedRoute>
              }
            />

            {/* Invoices (Admin Only) */}
            <Route
              path="/invoices"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <InvoicesView />
                </ProtectedRoute>
              }
            />

            {/* Customers (Admin Only) */}
            <Route
              path="/customers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CustomersView />
                </ProtectedRoute>
              }
            />

            {/* POS (Admin Only) */}
            <Route
              path="/b2c-pos"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <B2CPosView />
                </ProtectedRoute>
              }
            />

            {/* Reports (Admin Only) */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ReportsView />
                </ProtectedRoute>
              }
            />

            {/* Pricing Tiers (Admin Only) */}
            <Route
              path="/pricing"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PricingRulesView />
                </ProtectedRoute>
              }
            />

            {/* Payments (Admin Only) */}
            <Route
              path="/payments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PaymentsView onOpenRecordPaymentModal={() => setIsRecordPaymentOpen(true)} />
                </ProtectedRoute>
              }
            />

            {/* Audit Trail (Admin Only) */}
            <Route
              path="/audit-trail"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AuditTrailView />
                </ProtectedRoute>
              }
            />

            {/* Settings & User Management (Admin Only) */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SettingsView />
                </ProtectedRoute>
              }
            />

            {/* Customer Storefront (Admin & Customer) */}
            <Route
              path="/store"
              element={
                <ProtectedRoute allowedRoles={['admin', 'customer']}>
                  <CustomerStorefront />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer-storefront"
              element={
                <ProtectedRoute allowedRoles={['admin', 'customer']}>
                  <CustomerStorefront />
                </ProtectedRoute>
              }
            />
            <Route path="/storefront" element={<Navigate to="/store" replace />} />

            {/* Fallback & Root redirects */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </main>
      </div>

      {/* Global Modals */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
      />

      <InventoryAdjustModal
        isOpen={isInventoryAdjustOpen}
        onClose={() => setIsInventoryAdjustOpen(false)}
        defaultProductId={adjustProductId}
        defaultType={adjustType}
      />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicOnlyRoute>
                  <SignupPage />
                </PublicOnlyRoute>
              }
            />
            <Route path="/*" element={<CrmLayout />} />
          </Routes>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
