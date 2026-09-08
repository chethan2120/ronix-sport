import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
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

const CrmLayout: React.FC = () => {
  const { setActiveTab } = useStore();
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

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#111827] font-sans antialiased overflow-hidden selection:bg-[#E31B23] selection:text-white">
      {/* Left Navigation Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header onMenuToggle={() => setMobileOpen(!mobileOpen)} />

        {/* Dynamic Main Workspace Content */}
        <main className={`flex-1 overflow-y-auto ${isStorefront ? 'p-0 w-full' : 'p-4 sm:p-6 lg:p-6.5 max-w-[1600px] w-full mx-auto'}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <DashboardView
                  onOpenAddProductModal={() => setIsAddProductOpen(true)}
                  onOpenRecordPaymentModal={() => setIsRecordPaymentOpen(true)}
                  onOpenInventoryAdjustModal={() => handleOpenAddStock()}
                />
              }
            />
            <Route path="/b2b-orders" element={<B2BOrderFlowView />} />
            <Route path="/b2c-pos" element={<B2CPosView />} />
            <Route
              path="/inventory"
              element={
                <InventoryView
                  onOpenAddProductModal={() => setIsAddProductOpen(true)}
                  onOpenAddStockModal={handleOpenAddStock}
                  onOpenRemoveStockModal={handleOpenRemoveStock}
                />
              }
            />
            <Route
              path="/products"
              element={
                <ProductsView
                  onOpenAddProductModal={() => setIsAddProductOpen(true)}
                  onOpenAdjustStockModal={handleOpenAddStock}
                />
              }
            />
            <Route path="/customers" element={<CustomersView />} />
            <Route path="/pricing" element={<PricingRulesView />} />
            <Route path="/invoices" element={<InvoicesView />} />
            <Route path="/quotations" element={<QuotationsView />} />
            <Route
              path="/payments"
              element={<PaymentsView onOpenRecordPaymentModal={() => setIsRecordPaymentOpen(true)} />}
            />
            <Route path="/reports" element={<ReportsView />} />
            <Route path="/audit-trail" element={<AuditTrailView />} />
            <Route path="/store" element={<CustomerStorefront />} />
            <Route path="/customer-storefront" element={<CustomerStorefront />} />
            <Route path="/storefront" element={<Navigate to="/store" replace />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
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

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/*" element={<CrmLayout />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AppRoutes />
      </StoreProvider>
    </BrowserRouter>
  );
}
