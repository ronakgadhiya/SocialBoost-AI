import { useState } from 'react';
import {
  Sparkles,
  Sun,
  Moon,
  Menu,
  X,
  PlayCircle,
  LayoutDashboard,
  Calendar,
  Layers,
  Wand2,
  Bookmark,
  Briefcase,
  CreditCard,
} from 'lucide-react';
import { ActiveTab, UsageData } from '../types';
import { ThemeMode } from '../utils/storage';
import { UsageCounter } from './UsageCounter';

interface NavbarProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  usage: UsageData;
  onLoadDemo: () => void;
  onUpgradeClick: () => void;
}

export function Navbar({
  activeTab,
  onNavigate,
  theme,
  onToggleTheme,
  usage,
  onLoadDemo,
  onUpgradeClick,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: Array<{ id: ActiveTab; label: string; icon: any }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'generator', label: 'Create Content', icon: Wand2 },
    { id: 'ai-tools', label: 'AI Tools', icon: Layers },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'history', label: 'History', icon: Bookmark },
    { id: 'brand', label: 'Brand Profile', icon: Briefcase },
    { id: 'pricing', label: 'Pricing', icon: CreditCard },
  ];

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            id="nav-logo-btn"
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                SocialBoost <span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                For Small Businesses
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5">
          {/* Quick Demo Button */}
          <button
            id="nav-load-demo-btn"
            onClick={onLoadDemo}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
            title="Load demo business data (Roviq Design Store)"
          >
            <PlayCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Load Demo</span>
          </button>

          {/* Usage Badge (Compact) */}
          <UsageCounter usage={usage} onUpgradeClick={onUpgradeClick} compact />

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            aria-label="Toggle light and dark mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* CTA Button */}
          {activeTab === 'landing' ? (
            <button
              id="nav-cta-btn"
              onClick={() => onNavigate('dashboard')}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
            >
              Open Dashboard
            </button>
          ) : (
            <button
              id="nav-create-fast-btn"
              onClick={() => onNavigate('generator')}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Generate
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 lg:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div
          id="mobile-nav-drawer"
          className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-1.5"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 text-indigo-500" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <button
              id="mobile-load-demo-btn"
              onClick={() => {
                onLoadDemo();
                setMobileOpen(false);
              }}
              className="flex-1 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-center"
            >
              Load Demo Store
            </button>
            <button
              id="mobile-upgrade-btn"
              onClick={() => {
                onUpgradeClick();
                setMobileOpen(false);
              }}
              className="flex-1 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white text-center"
            >
              Upgrade
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
