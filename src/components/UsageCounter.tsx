import { Sparkles, ArrowUpRight } from 'lucide-react';
import { UsageData } from '../types';

interface UsageCounterProps {
  usage: UsageData;
  onUpgradeClick: () => void;
  compact?: boolean;
}

export function UsageCounter({ usage, onUpgradeClick, compact = false }: UsageCounterProps) {
  const remaining = Math.max(0, usage.maxFree - usage.count);
  const percentage = Math.min(100, Math.round((usage.count / usage.maxFree) * 100));
  const isExhausted = remaining === 0;

  if (compact) {
    return (
      <div
        id="usage-counter-compact"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
          isExhausted
            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>
          {remaining} / {usage.maxFree} free left
        </span>
      </div>
    );
  }

  return (
    <div
      id="usage-counter-card"
      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/20 text-slate-800 dark:text-slate-200"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Free Plan Quota
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {remaining} / {usage.maxFree} generations remaining
            </div>
          </div>
        </div>
        <button
          id="usage-upgrade-btn"
          onClick={onUpgradeClick}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          Upgrade
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isExhausted ? 'bg-rose-500' : percentage > 60 ? 'bg-amber-500' : 'bg-indigo-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 dark:text-slate-400">
        <span>Resets monthly ({usage.lastResetMonth})</span>
        <span className="font-medium text-slate-400 dark:text-slate-500">Client MVP Limit</span>
      </div>

      {isExhausted && (
        <div className="mt-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <span>You have reached your free generation limit.</span>
          <button
            id="usage-exhausted-upgrade"
            onClick={onUpgradeClick}
            className="font-bold underline hover:no-underline ml-2"
          >
            Upgrade to Pro
          </button>
        </div>
      )}
    </div>
  );
}
