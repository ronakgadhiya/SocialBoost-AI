import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Trash2,
  RotateCcw,
  ShieldCheck,
  HardDrive,
  Sparkles,
  Check,
} from 'lucide-react';
import { ThemeMode, getUsage, resetUsage, clearAllSocialBoostData, getHistory, getBrandProfile, getCalendarPlan } from '../utils/storage';
import { UsageData } from '../types';

interface SettingsPageProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  usage: UsageData;
  onUsageUpdate: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function SettingsPage({
  theme,
  onToggleTheme,
  usage,
  onUsageUpdate,
  onShowToast,
}: SettingsPageProps) {
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetQuota = () => {
    resetUsage();
    onUsageUpdate();
    setResetSuccess(true);
    onShowToast('Free quota reset to 0/5 for testing!', 'success');
    setTimeout(() => setResetSuccess(false), 2500);
  };

  const handlePurgeAll = () => {
    if (
      window.confirm(
        'Warning: This will delete your Brand Profile, Saved History, Content Calendar, and Usage Counter from this browser. Are you sure?'
      )
    ) {
      clearAllSocialBoostData();
      onUsageUpdate();
      onShowToast('All local application storage has been cleared.', 'info');
      setTimeout(() => window.location.reload(), 800);
    }
  };

  const historyCount = getHistory().length;
  const hasBrand = !!getBrandProfile();
  const hasCalendar = !!getCalendarPlan();

  return (
    <div id="settings-page" className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
          <SettingsIcon className="w-4 h-4" />
          <span>Preferences & Storage</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your interface appearance, testing tools, and browser data storage.
        </p>
      </div>

      {/* Appearance & Theme */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Appearance
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Interface Theme</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Switch between daylight high-contrast and low-light dark aesthetics.
            </div>
          </div>

          <button
            id="settings-theme-btn"
            onClick={onToggleTheme}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Dark Mode (Active)</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span>Light Mode (Active)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Testing & Quota Control */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Usage & Testing Controls
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-xs font-bold uppercase text-slate-500">Monthly Free Generations Quota</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              {usage.count} of {usage.maxFree} used ({Math.max(0, usage.maxFree - usage.count)} remaining)
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Testing convenience: Click reset to clear generation counters anytime.
            </div>
          </div>

          <button
            id="reset-quota-btn"
            onClick={handleResetQuota}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            {resetSuccess ? <Check className="w-4 h-4 text-emerald-500" /> : <RotateCcw className="w-4 h-4" />}
            <span>{resetSuccess ? 'Quota Reset!' : 'Reset Quota to 0'}</span>
          </button>
        </div>
      </div>

      {/* Browser LocalStorage Inspection */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Local Storage Footprint
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/40 text-xs">
            <span className="text-slate-400 font-semibold block">Brand Profile</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm mt-1 block">
              {hasBrand ? 'Saved locally' : 'Empty'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/40 text-xs">
            <span className="text-slate-400 font-semibold block">History Records</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm mt-1 block">
              {historyCount} / 20 posts
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/40 text-xs">
            <span className="text-slate-400 font-semibold block">Content Calendar</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm mt-1 block">
              {hasCalendar ? 'Plan saved' : 'Empty'}
            </span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500">
            Clear all local state if you want a completely fresh install.
          </div>
          <button
            id="purge-all-data-btn"
            onClick={handlePurgeAll}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge All Storage</span>
          </button>
        </div>
      </div>

      {/* Privacy Guarantee */}
      <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm">
          <span className="font-bold text-indigo-950 dark:text-indigo-200">Local-First Architecture</span>
          <p className="text-indigo-900/80 dark:text-indigo-300/80 leading-relaxed text-xs">
            SocialBoost AI doesn't store your marketing data or customer info in any external database. All brand details, saved copy variations, and editorial schedules remain stored directly in your browser's localStorage.
          </p>
        </div>
      </div>
    </div>
  );
}
