import { Check, Sparkles, ArrowRight } from 'lucide-react';

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  priceNumeric: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  isFree?: boolean;
  maxGenerations: number;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    priceNumeric: 0,
    period: 'forever',
    description: 'Perfect for small local sellers testing social marketing.',
    features: [
      '5 generations per month',
      'Basic social platforms (Instagram, FB)',
      'Basic AI tools access',
      'Local browser history (up to 20)',
      'Standard text copy & TXT export',
    ],
    buttonText: 'Current Plan',
    isFree: true,
    maxGenerations: 5,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹299',
    priceNumeric: 299,
    period: 'per month',
    description: 'Designed for growing brands & active store owners.',
    popular: true,
    features: [
      '100 generations per month',
      'All 8 social platforms supported',
      'All 10 specialized AI tools',
      'Content Calendar generator (7/14/30 days)',
      'TXT & JSON export options',
      'Faster response times',
    ],
    buttonText: 'Upgrade to Pro',
    maxGenerations: 100,
  },
  {
    id: 'business',
    name: 'Business',
    price: '₹799',
    priceNumeric: 799,
    period: 'per month',
    description: 'For growing e-commerce stores & multi-product brands.',
    features: [
      '500 generations per month',
      'Multiple brand profiles',
      'Advanced prompt customization',
      'Priority AI queue',
      'Full campaign sequence generators',
      'Dedicated email support',
    ],
    buttonText: 'Upgrade to Business',
    maxGenerations: 500,
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '₹1,999',
    priceNumeric: 1999,
    period: 'per month',
    description: 'For marketing agencies & freelance social managers.',
    features: [
      'Unlimited high-capacity generation',
      'Manage unlimited client brands',
      'Agency workflow & bulk export',
      'Custom tone & regional dialects fine-tuning',
      'Multi-team seat permissions',
      'Dedicated account manager',
    ],
    buttonText: 'Upgrade to Agency',
    maxGenerations: 9999,
  },
];

interface PricingCardProps {
  key?: string;
  plan: PricingPlan;
  onSelectPlan: (plan: PricingPlan) => void;
  isCurrent?: boolean;
}

export function PricingCard({ plan, onSelectPlan, isCurrent = false }: PricingCardProps) {
  return (
    <div
      id={`pricing-card-${plan.id}`}
      className={`relative flex flex-col p-6 rounded-2xl transition-all duration-200 border ${
        plan.popular
          ? 'bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/30 dark:to-slate-900 border-indigo-500/80 shadow-xl ring-1 ring-indigo-500/40'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {plan.popular && (
        <div
          id="pricing-popular-badge"
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md"
        >
          <Sparkles className="w-3 h-3" />
          Most Popular
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">{plan.description}</p>
      </div>

      <div className="mb-6 flex items-baseline gap-1">
        <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{plan.price}</span>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">/{plan.period}</span>
      </div>

      <ul className="space-y-3 mb-6 flex-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        id={`plan-btn-${plan.id}`}
        disabled={isCurrent}
        onClick={() => !isCurrent && onSelectPlan(plan)}
        className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
          isCurrent
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-default'
            : plan.popular
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 cursor-pointer'
            : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 cursor-pointer'
        }`}
      >
        <span>{isCurrent ? 'Current Plan' : plan.buttonText}</span>
        {!isCurrent && <ArrowRight className="w-4 h-4" />}
      </button>
    </div>
  );
}
