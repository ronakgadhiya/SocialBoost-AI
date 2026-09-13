import {
  Wand2,
  Sparkles,
  Calendar,
  Layers,
  Clock,
  ArrowRight,
  Bookmark,
  Share2,
  Briefcase,
  PlayCircle,
  Copy,
  Check,
} from 'lucide-react';
import { ActiveTab, BusinessProfile, GenerationHistoryItem, CalendarPlan, UsageData } from '../types';
import { copyToClipboard } from '../utils/export';
import { useState } from 'react';

interface DashboardHomeProps {
  brandProfile: BusinessProfile | null;
  history: GenerationHistoryItem[];
  calendar: CalendarPlan | null;
  usage: UsageData;
  onNavigate: (tab: ActiveTab) => void;
  onLoadDemo: () => void;
  onUpgradeClick: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function DashboardHome({
  brandProfile,
  history,
  calendar,
  usage,
  onNavigate,
  onLoadDemo,
  onUpgradeClick,
  onShowToast,
}: DashboardHomeProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyRecent = async (item: GenerationHistoryItem) => {
    const text = `[${item.platform} - ${item.contentType}]\n${item.hook ? item.hook + '\n\n' : ''}${item.content}\n\n${item.cta || ''}`;
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(item.id);
      onShowToast('Content copied to clipboard!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const businessName = brandProfile?.businessName || 'Your Business';
  const remainingGenerations = Math.max(0, usage.maxFree - usage.count);

  const quickTools = [
    { title: 'Hook Generator', desc: '10 viral hooks', tab: 'ai-tools' },
    { title: 'Reel Script', desc: '30s short-form video', tab: 'ai-tools' },
    { title: 'Content Ideas', desc: '30 unique post angles', tab: 'ai-tools' },
    { title: 'Hashtags Optimizer', desc: 'Niche & reach tags', tab: 'ai-tools' },
  ];

  return (
    <div id="dashboard-home" className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Section */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Marketing Assistant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="text-indigo-300">{businessName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Generate platform-optimized social posts, hooks, and content schedules with Gemini AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dash-create-btn"
              onClick={() => onNavigate('generator')}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all"
            >
              <Wand2 className="w-4 h-4" />
              <span>Create New Post</span>
            </button>

            {!brandProfile && (
              <button
                id="dash-load-demo-btn"
                onClick={onLoadDemo}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2 transition-all"
              >
                <PlayCircle className="w-4 h-4 text-amber-400" />
                <span>Load Demo Store</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics & Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Usage */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Free Quota Remaining</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {remainingGenerations} <span className="text-xs font-normal text-slate-500">/ {usage.maxFree}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Resets monthly</span>
            <button onClick={onUpgradeClick} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Upgrade
            </button>
          </div>
        </div>

        {/* Metric 2: Saved Content */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Saved History</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {history.length} <span className="text-xs font-normal text-slate-500">posts</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Stored locally</span>
            <button onClick={() => onNavigate('history')} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              View all
            </button>
          </div>
        </div>

        {/* Metric 3: Brand Profile Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Brand Profile</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              {brandProfile ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="truncate">{brandProfile.businessName}</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-slate-500 font-normal">Not configured</span>
                </>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">{brandProfile ? brandProfile.businessType : 'Speed up generation'}</span>
            <button onClick={() => onNavigate('brand')} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              {brandProfile ? 'Edit' : 'Setup'}
            </button>
          </div>
        </div>

        {/* Metric 4: Calendar Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Content Calendar</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {calendar ? `${calendar.items.length} Days` : '0 Days'}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">{calendar ? 'Active plan' : 'Plan your week'}</span>
            <button onClick={() => onNavigate('calendar')} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              {calendar ? 'Open' : 'Create'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Content & Quick Tools */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Content */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Generated Content</h3>
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => onNavigate('history')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  View All ({history.length})
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Wand2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No content generated yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Click Create New Post to generate platform-ready social copy with Gemini AI.
                </p>
                <button
                  onClick={() => onNavigate('generator')}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Start Creating Now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                          {item.platform}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">• {item.contentType}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {item.hook && (
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {item.hook}
                        </p>
                      )}
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {item.content}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopyRecent(item)}
                      className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300 shrink-0"
                      title="Copy content"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick AI Tools Shortcuts */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Popular AI Tools</h3>
              </div>
              <button
                onClick={() => onNavigate('ai-tools')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                All 10 Tools
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickTools.map((tool, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigate('ai-tools')}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:border-indigo-200 dark:hover:border-indigo-800 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {tool.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{tool.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Calendar Preview & Upgrade Promo */}
        <div className="space-y-6">
          {/* Calendar Preview Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Content Calendar</h3>
              </div>
              <button
                onClick={() => onNavigate('calendar')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {calendar ? 'Open' : 'Plan'}
              </button>
            </div>

            {calendar && calendar.items.length > 0 ? (
              <div className="space-y-3">
                <div className="text-xs text-slate-500 font-medium">
                  {calendar.durationDays}-Day Strategic Schedule
                </div>
                {calendar.items.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/50 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>{item.date}</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{item.platform}</span>
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{item.topic}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Calendar className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No content calendar created yet.</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Generate 7, 14, or 30 days of strategic social topics.
                </p>
                <button
                  onClick={() => onNavigate('calendar')}
                  className="mt-3 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                >
                  Generate Calendar
                </button>
              </div>
            )}
          </div>

          {/* Upgrade Promo Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800/60 shadow-sm text-slate-900 dark:text-white space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold">Scale With SocialBoost Pro</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Unlock 100 generations/month, all 10 specialized AI tools, priority generation speed, and team workflows for ₹299/month.
              </p>
            </div>
            <button
              id="dash-upgrade-btn"
              onClick={onUpgradeClick}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <span>View Pricing Plans</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
