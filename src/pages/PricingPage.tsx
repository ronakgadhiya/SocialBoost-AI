import { useState, useEffect } from 'react';
import { Check, Sparkles, ShieldCheck, HelpCircle, Shield, Zap } from 'lucide-react';
import { PRICING_PLANS, PricingCard, PricingPlan } from '../components/PricingCard';
import { PaymentCheckoutModal } from '../components/PaymentCheckoutModal';
import { getSubscription, UserSubscription } from '../utils/storage';
import { PaymentReceipt } from '../types';

interface PricingPageProps {
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function PricingPage({ onShowToast }: PricingPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [currentSub, setCurrentSub] = useState<UserSubscription>(() => getSubscription());

  useEffect(() => {
    setCurrentSub(getSubscription());
  }, []);

  const handleSelectPlan = (plan: PricingPlan) => {
    if (plan.id === currentSub.planId) {
      onShowToast(`You are currently on the ${plan.name} plan.`, 'info');
      return;
    }
    setSelectedPlan(plan);
  };

  const handlePaymentSuccess = (receipt: PaymentReceipt) => {
    setCurrentSub(getSubscription());
    onShowToast(`🎉 Congratulations! You have upgraded to the ${receipt.planName} Plan!`, 'success');
  };

  const featureComparison = [
    { feature: 'Monthly AI Generations', free: '5', pro: '100', business: '500', agency: 'Unlimited*' },
    { feature: 'Gemini 3.8 Flash AI Model', free: 'Yes', pro: 'Yes', business: 'Priority Speed', agency: 'Dedicated API' },
    { feature: 'Supported Social Platforms', free: 'Basic (IG, FB)', pro: 'All 8 Platforms', business: 'All 8 Platforms', agency: 'All 8 Platforms' },
    { feature: '10 Specialized AI Tools', free: 'Basic', pro: 'Full Access', business: 'Full Access', agency: 'Full Access' },
    { feature: 'Content Calendar Generator', free: 'No', pro: '7, 14, 30 Days', business: '7, 14, 30 Days', agency: 'Full Multi-Brand' },
    { feature: 'Regional Languages (Hindi, Gujarati, Hinglish)', free: 'Yes', pro: 'Yes', business: 'Yes', agency: 'Custom Dialects' },
    { feature: 'Export Formats', free: 'TXT, Clipboard', pro: 'TXT, JSON, Clipboard', business: 'TXT, JSON, CSV', agency: 'Bulk White-Label' },
    { feature: 'Brand Profiles Saved', free: '1 (Local)', pro: '1 (Local)', business: '5 Profiles', agency: 'Unlimited Brands' },
  ];

  return (
    <div id="pricing-page" className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Active Plan: {currentSub.planName} ({currentSub.maxGenerations >= 9999 ? 'Unlimited' : `${currentSub.maxGenerations} gens/mo`})</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Pick the Right Plan for Your Growth
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Scale your social media marketing with instant checkout via UPI, Cards, and Net Banking. Instant quota activation.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRICING_PLANS.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            onSelectPlan={handleSelectPlan}
            isCurrent={currentSub.planId === plan.id}
          />
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Feature Breakdown by Plan</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transparent comparison of what is included in each tier.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Feature</th>
                <th className="py-3 px-3">Free (₹0)</th>
                <th className="py-3 px-3 text-indigo-600 dark:text-indigo-400 font-bold">Pro (₹299)</th>
                <th className="py-3 px-3">Business (₹799)</th>
                <th className="py-3 px-3">Agency (₹1,999)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {featureComparison.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{row.feature}</td>
                  <td className="py-3 px-3">{row.free}</td>
                  <td className="py-3 px-3 font-semibold text-indigo-600 dark:text-indigo-400">{row.pro}</td>
                  <td className="py-3 px-3">{row.business}</td>
                  <td className="py-3 px-3">{row.agency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Security Assurance Box */}
      <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs sm:text-sm text-indigo-900 dark:text-indigo-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Instant Online Payment Integration Active</p>
          <p className="text-indigo-800/90 dark:text-indigo-300/90 leading-relaxed text-xs">
            SocialBoost AI supports instant checkout via UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards, Net Banking, and instant sandbox simulation. Quota upgrades and tax invoices are issued immediately upon payment completion.
          </p>
        </div>
      </div>

      {/* Real Payment Checkout Modal */}
      {selectedPlan && (
        <PaymentCheckoutModal
          plan={selectedPlan}
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
