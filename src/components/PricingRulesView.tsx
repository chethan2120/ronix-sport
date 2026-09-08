import React, { useState } from 'react';
import {
  Tag,
  Lock,
  Percent,
  Plus,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Sparkles,
  Calculator,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const PricingRulesView: React.FC = () => {
  const { pricingRules, products, customers, getPriceForCustomer, currentUser } = useStore();

  const [testCustomerId, setTestCustomerId] = useState<string>(customers[0]?.id || '');
  const [testProductId, setTestProductId] = useState<string>(products[0]?.id || '');
  const [testQuantity, setTestQuantity] = useState<number>(100);

  const pricingResult = getPriceForCustomer(testProductId, testCustomerId, testQuantity);
  const testProduct = products.find((p) => p.id === testProductId) || products[0];
  const testCustomer = customers.find((c) => c.id === testCustomerId) || customers[0];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[#111827] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#E31B23]" />
            <span>CENTRALIZED PRICING ENGINE</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FFF1F2] text-[#E31B23] border border-red-200 px-2 py-0.5 rounded-full">
              Admin Locked
            </span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Single source of truth for contract rates, volume breaks, and customer price tiers.
          </p>
        </div>
      </div>

      {/* Grid: Pricing Engine Simulator + Rules Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Simulator (Columns 1-5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Calculator className="w-4 h-4 text-[#E31B23]" />
              <h3 className="text-sm font-bold text-slate-900">Live Price Engine Calculator</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Verify the exact locked price calculated for any customer tier and quantity.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Customer</label>
                <select
                  value={testCustomerId}
                  onChange={(e) => setTestCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.priceTier} Tier)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Product</label>
                <select
                  value={testProductId}
                  onChange={(e) => setTestProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (MSRP: ₹{p.retailPrice})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Order Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={testQuantity}
                  onChange={(e) => setTestQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
                />
              </div>
            </div>

            {/* Calculated Output Box */}
            <div className="mt-5 p-4 bg-[#FFF1F2] border border-red-200 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Applied Rule:</span>
                <span className="font-bold text-[#E31B23] bg-white border border-red-200 px-2 py-0.5 rounded-md">
                  {pricingResult.ruleApplied}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Retail MSRP:</span>
                <span className="line-through text-slate-400 font-semibold">
                  ₹ {(testProduct?.retailPrice ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Contract Rate (Per Unit):</span>
                <span className="font-black text-[#E31B23] text-sm">
                  ₹ {(pricingResult?.unitPrice ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-2 border-t border-red-200 flex justify-between items-center text-sm font-black text-slate-900">
                <span>Total Amount:</span>
                <span className="text-base text-[#E31B23]">
                  ₹ {((pricingResult?.unitPrice ?? 0) * (testQuantity || 1)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Sales reps cannot manually override without Admin key.</span>
          </div>
        </div>

        {/* Active Rules Table (Columns 6-12) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#E31B23]" />
                <h3 className="text-sm font-bold text-slate-900">Configured Pricing Rules & Tiers</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">{pricingRules.length} Active Rules</span>
            </div>

            <div className="mt-4 space-y-3">
              {pricingRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{rule.productName}</h4>
                      <span className="text-[10px] font-bold text-[#E31B23] bg-[#FFF1F2] border border-red-200 px-2 py-0.5 rounded-full">
                        {rule.bulkTiers.length > 0 ? 'Bulk Tier' : 'Standard'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 font-mono">
                      Standard: ₹{rule.standardPrice.toLocaleString('en-IN')} | Tiers: {rule.bulkTiers.length}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-[#E31B23] bg-[#FFF1F2] px-2.5 py-1 rounded-lg border border-red-200">
                      {rule.bulkTiers[0]?.discountLabel || 'Standard Price'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Pricing changes require Admin authorization and are logged to the permanent audit trail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
