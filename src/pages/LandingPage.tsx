import { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  Share2,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Zap,
  Clock,
  Target,
  BarChart3,
  HelpCircle,
  ChevronDown,
  Wand2,
  Layers,
  Calendar,
} from 'lucide-react';
import { PRICING_PLANS, PricingCard } from '../components/PricingCard';
import { PricingPlan } from '../components/PricingCard';

interface LandingPageProps {
  onStartCreating: () => void;
  onTryDemo: () => void;
  onSelectPlan: (plan: PricingPlan) => void;
}

export function LandingPage({ onStartCreating, onTryDemo, onSelectPlan }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const platforms = [
    { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { name: 'LinkedIn', icon: Linkedin, color: 'text-sky-600' },
    { name: 'YouTube', icon: Youtube, color: 'text-red-600' },
    { name: 'WhatsApp', icon: Zap, color: 'text-emerald-500' },
    { name: 'Google Business', icon: Target, color: 'text-indigo-500' },
  ];

  const tools = [
    { title: 'Viral Hook Generator', desc: '10 scroll-stopping opening lines tailored to your target niche.' },
    { title: 'Reel & Short Script', desc: 'Full scene-by-scene visual cues and audio voiceovers.' },
    { title: 'High-Converting CTAs', desc: 'Action-oriented calls that turn viewers into buyers and leads.' },
    { title: 'Hashtags Optimizer', desc: 'Niche, reach, and community hashtags without hashtag stuffing.' },
    { title: '30-Day Calendar', desc: 'Strategic weekly and monthly editorial schedules in one click.' },
    { title: 'Content Rewriter', desc: 'Paste old drafts and revamp them into fresh, punchy angles.' },
  ];

  const faqs = [
    {
      q: 'How does SocialBoost AI generate content specific to my business?',
      a: 'SocialBoost AI analyzes your business type, unique selling proposition (USP), target audience, and active offers. Instead of generic AI responses, Gemini structures high-converting copy that matches your actual products and selected tone.',
    },
    {
      q: 'Does it support regional languages like Hindi and Gujarati?',
      a: 'Yes! SocialBoost AI supports English, Hindi, Gujarati, Hinglish, and bilingual blends (Hindi + English, Gujarati + English) so you can connect authentically with local customers.',
    },
    {
      q: 'Where is my brand information and generation history stored?',
      a: 'All brand profiles, recent generated posts, and calendars are stored directly in your browser using secure localStorage. Nothing requires an external database.',
    },
    {
      q: 'Can I edit the generated captions and hooks?',
      a: 'Absolutely. Every generation includes 3 variations (Professional, Creative, and High-Converting). You can toggle between them, edit inline, copy to clipboard, or export to TXT and JSON.',
    },
    {
      q: 'How does the free usage limit work?',
      a: 'The free MVP tier includes 5 complete AI generations per month. You can test real Gemini AI generation immediately. Upgrade anytime to unlock higher monthly quotas.',
    },
  ];

  return (
    <div id="landing-page" className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/10 via-violet-500/10 to-amber-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/80 text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Built with Gemini 3.8 Flash • Real Social AI</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15]">
            Create Better Social Media Content in Seconds
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Generate captions, reels, ads, content ideas, hashtags and marketing campaigns tailored to your business.
          </p>

          {/* Hero Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="hero-start-creating-btn"
              onClick={onStartCreating}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all"
            >
              <Wand2 className="w-4 h-4" />
              <span>Start Creating</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-try-demo-btn"
              onClick={onTryDemo}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <PlayCircle className="w-4 h-4 text-amber-500" />
              <span>Try Demo Store</span>
            </button>
          </div>

          {/* Social Platforms row */}
          <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-850">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-5">
              Optimized for top small business channels
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              {platforms.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.name} className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <Icon className={`w-4 h-4 ${p.color}`} />
                    <span>{p.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-slate-50/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Why Small Businesses Win With SocialBoost AI
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Stop staring at a blank screen. Turn your business offerings into authentic, engaging posts that convert.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Strict Anti-Hallucination Rules</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                We enforce strict AI constraints: no invented prices, fake discounts, fake certifications, or generic fluff. Your actual business details remain accurate.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">3 Genuinely Different Variations</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Receive Professional, Creative, and High-Converting variations in every generation. Switch seamlessly and pick the angle that resonates best with your audience.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Zero Setup & Instant Storage</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Your brand profile, post history, and custom calendars persist locally in your browser. Generate content now with zero complex database setup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Tools Grid */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Comprehensive Toolkit
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              10 Specialized AI Marketing Tools
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Each tool is custom-prompted for maximum engagement and platform performance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((t, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.title}</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 bg-slate-50/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">How It Works</h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              3 simple steps to high-performing social posts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-md shadow-indigo-500/20">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Enter Business Info</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Add your business name, product or service, target audience, and active offers (or load the demo).
              </p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-md shadow-indigo-500/20">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Configure & Generate</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Select your platform, content type, language, and tone. Gemini AI generates structured, platform-ready copy.
              </p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-md shadow-indigo-500/20">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit, Save & Publish</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Review 3 variations, tweak with the inline editor, copy with one click, or export to your scheduler.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="landing-pricing" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Transparent Pricing
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Plans Built For Growing Businesses
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Start with 5 free generations. Upgrade whenever your business demands more.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_PLANS.map((plan) => (
              <PricingCard key={plan.id} plan={plan} onSelectPlan={onSelectPlan} isCurrent={plan.id === 'free'} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-slate-50/70 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
                >
                  <button
                    id={`faq-toggle-${idx}`}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left font-bold text-sm flex items-center justify-between gap-4 text-slate-900 dark:text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">SocialBoost AI</span>
            <span>— AI Marketing Assistant for Small Businesses</span>
          </div>

          <div>Local Browser Storage • No Tracking • Real Gemini AI Engine</div>
        </div>
      </footer>
    </div>
  );
}
