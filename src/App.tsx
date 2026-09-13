import { useState, useEffect } from 'react';
import { ActiveTab, BusinessProfile, GenerationHistoryItem, CalendarPlan, UsageData } from './types';
import {
  getTheme,
  saveTheme,
  ThemeMode,
  getBrandProfile,
  saveBrandProfile,
  getHistory,
  getCalendarPlan,
  getUsage,
} from './utils/storage';
import { DEMO_BUSINESS } from './data/demoData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer, ToastMessage } from './components/Toast';
import { PRICING_PLANS, PricingPlan } from './components/PricingCard';
import { PaymentCheckoutModal } from './components/PaymentCheckoutModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardHome } from './pages/DashboardHome';
import { GeneratorPage } from './pages/GeneratorPage';
import { AIToolsPage } from './pages/AIToolsPage';
import { CalendarPage } from './pages/CalendarPage';
import { HistoryPage } from './pages/HistoryPage';
import { BrandProfilePage } from './pages/BrandProfilePage';
import { PricingPage } from './pages/PricingPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('landing');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [brandProfile, setBrandProfile] = useState<BusinessProfile | null>(null);
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [calendar, setCalendar] = useState<CalendarPlan | null>(null);
  const [usage, setUsage] = useState<UsageData>({ count: 0, maxFree: 5, lastResetMonth: '' });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [upgradeModalPlan, setUpgradeModalPlan] = useState<PricingPlan | null>(null);

  // Initialize theme, profile, history, calendar, usage on mount
  useEffect(() => {
    const initialTheme = getTheme();
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setBrandProfile(getBrandProfile());
    setHistory(getHistory());
    setCalendar(getCalendarPlan());
    setUsage(getUsage());
  }, []);

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    saveTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshAppData = () => {
    setBrandProfile(getBrandProfile());
    setHistory(getHistory());
    setCalendar(getCalendarPlan());
    setUsage(getUsage());
  };

  const handleLoadDemo = () => {
    saveBrandProfile(DEMO_BUSINESS);
    setBrandProfile(DEMO_BUSINESS);
    showToast('Loaded demo store: Roviq Design Store!', 'success');
    setActiveTab('generator');
  };

  const handleOpenUpgradeModal = (plan?: PricingPlan) => {
    setUpgradeModalPlan(plan || PRICING_PLANS[1]); // Default to Pro
  };

  return (
    <div
      id="app-root"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150 selection:bg-indigo-500 selection:text-white"
    >
      {/* Global Navbar */}
      <Navbar
        activeTab={activeTab}
        onNavigate={(tab) => setActiveTab(tab)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        usage={usage}
        onLoadDemo={handleLoadDemo}
        onUpgradeClick={() => handleOpenUpgradeModal()}
      />

      {/* Main Viewport Content */}
      <div className="flex-1 flex">
        {activeTab === 'landing' ? (
          /* Landing Page: Full width */
          <main id="main-landing-view" className="w-full">
            <LandingPage
              onStartCreating={() => setActiveTab('generator')}
              onTryDemo={handleLoadDemo}
              onSelectPlan={(plan) => handleOpenUpgradeModal(plan)}
            />
          </main>
        ) : (
          /* Dashboard Layout: Sidebar + Main Content */
          <div id="main-dashboard-layout" className="flex-1 flex w-full">
            <Sidebar
              activeTab={activeTab}
              onNavigate={(tab) => {
                setActiveTab(tab);
                refreshAppData();
              }}
              usage={usage}
              onUpgradeClick={() => handleOpenUpgradeModal()}
            />

            <main
              id="dashboard-content-area"
              className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto"
            >
              {activeTab === 'dashboard' && (
                <DashboardHome
                  brandProfile={brandProfile}
                  history={history}
                  calendar={calendar}
                  usage={usage}
                  onNavigate={(tab) => {
                    setActiveTab(tab);
                    refreshAppData();
                  }}
                  onLoadDemo={handleLoadDemo}
                  onUpgradeClick={() => handleOpenUpgradeModal()}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'generator' && (
                <GeneratorPage
                  brandProfile={brandProfile}
                  onShowToast={showToast}
                  onUpgradeClick={() => handleOpenUpgradeModal()}
                  onUsageUpdate={refreshAppData}
                />
              )}

              {activeTab === 'ai-tools' && (
                <AIToolsPage
                  brandProfile={brandProfile}
                  onShowToast={showToast}
                  onUpgradeClick={() => handleOpenUpgradeModal()}
                  onUsageUpdate={refreshAppData}
                />
              )}

              {activeTab === 'calendar' && (
                <CalendarPage
                  brandProfile={brandProfile}
                  onShowToast={showToast}
                  onUpgradeClick={() => handleOpenUpgradeModal()}
                  onUsageUpdate={refreshAppData}
                />
              )}

              {activeTab === 'history' && (
                <HistoryPage
                  onShowToast={showToast}
                  onNavigateGenerator={() => setActiveTab('generator')}
                />
              )}

              {activeTab === 'brand' && (
                <BrandProfilePage
                  onProfileSaved={(profile) => {
                    setBrandProfile(profile);
                    refreshAppData();
                  }}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'pricing' && (
                <PricingPage onShowToast={showToast} />
              )}

              {activeTab === 'settings' && (
                <SettingsPage
                  theme={theme}
                  onToggleTheme={handleToggleTheme}
                  usage={usage}
                  onUsageUpdate={refreshAppData}
                  onShowToast={showToast}
                />
              )}
            </main>
          </div>
        )}
      </div>

      {/* Global Payment Checkout Modal */}
      {upgradeModalPlan && (
        <PaymentCheckoutModal
          plan={upgradeModalPlan}
          isOpen={!!upgradeModalPlan}
          onClose={() => setUpgradeModalPlan(null)}
          onSuccess={(receipt) => {
            refreshAppData();
            showToast(`🎉 Upgraded to ${receipt.planName} Plan! ${receipt.planId === 'agency' ? 'Unlimited' : upgradeModalPlan.maxGenerations} generations available.`, 'success');
          }}
        />
      )}

      {/* Global Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
