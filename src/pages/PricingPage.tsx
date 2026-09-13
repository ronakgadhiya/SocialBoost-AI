import { useState } from 'react';
import { Check, Sparkles, AlertCircle, HelpCircle, Shield, Zap } from 'lucide-react';
import { PRICING_PLANS, PricingCard, PricingPlan } from '../components/PricingCard';
import { Modal } from '../components/Modal';

interface PricingPageProps {
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function PricingPage({ onShowToast }: PricingPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  const handleSelectPlan = (plan: PricingPlan) => {
    if (plan.isFree) {
      onShowToast('You are currently on the Free Starter plan.', 'info');
      return;
    }
    setSelectedPlan(plan);
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
          <span>Simple, Scalable Subscriptions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Pick the Right Plan for Your Growth
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Start generating real social media copy for free. Upgrade anytime to unlock 100+ generations and full editorial planning.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRICING_PLANS.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            onSelectPlan={handleSelectPlan}
            isCurrent={plan.id === 'free'}
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

      {/* Honest MVP Notice Box */}
      <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Payment Gateway Integration Notice</p>
          <p className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed text-xs">
            SocialBoost AI is currently operating in public MVP mode. Payment gateways (Stripe / Razorpay) will be enabled in an upcoming release. Free generations are enabled for all users.
          </p>
        </div>
      </div>

      {/* Modal for Upgrade Notification */}
      {selectedPlan && (
        <Modal
          id="pricing-upgrade-modal"
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
          title={`Upgrade to ${selectedPlan.name}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {selectedPlan.name} Plan — {selectedPlan.price}/{selectedPlan.period}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{selectedPlan.description}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-left text-xs space-y-2 text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white block uppercase text-[10px]">
                Included Perks:
              </span>
              {selectedPlan.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-300 font-semibold">
              Payment integration coming soon.
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              Razorpay & Stripe checkout modules are scheduled for the next deployment. In the meantime, you can test all features using your free generations quota.
            </p>

            <button
              id="confirm-upgrade-dialog-btn"
              onClick={() => {
                setSelectedPlan(null);
                onShowToast('Payment integration coming soon. Thank you for your interest!', 'info');
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all"
            >
              Got It
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
