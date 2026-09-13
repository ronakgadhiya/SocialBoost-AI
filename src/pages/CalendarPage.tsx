import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Sparkles,
  Loader2,
  Download,
  Copy,
  Check,
  Trash2,
  Layers,
  LayoutGrid,
  List,
  Wand2,
  FileText,
  FileJson,
  ArrowRight,
} from 'lucide-react';
import { CalendarPlan, CalendarItem, BusinessProfile, Platform } from '../types';
import { generateContentCalendarPlan } from '../services/geminiService';
import { saveCalendarPlan, getCalendarPlan, clearCalendarPlan } from '../utils/storage';
import { copyToClipboard, downloadAsTxt, downloadAsJson } from '../utils/export';

interface CalendarPageProps {
  brandProfile: BusinessProfile | null;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onUpgradeClick: () => void;
  onUsageUpdate?: () => void;
}

export function CalendarPage({
  brandProfile,
  onShowToast,
  onUpgradeClick,
  onUsageUpdate,
}: CalendarPageProps) {
  const [calendar, setCalendar] = useState<CalendarPlan | null>(null);
  const [duration, setDuration] = useState<7 | 14 | 30>(7);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form customizer
  const [businessName, setBusinessName] = useState(brandProfile?.businessName || '');
  const [productService, setProductService] = useState(brandProfile?.productService || '');
  const [targetAudience, setTargetAudience] = useState(brandProfile?.targetAudience || '');

  useEffect(() => {
    const saved = getCalendarPlan();
    if (saved) {
      setCalendar(saved);
      setDuration(saved.durationDays);
    }
  }, []);

  useEffect(() => {
    if (brandProfile) {
      if (!businessName) setBusinessName(brandProfile.businessName);
      if (!productService) setProductService(brandProfile.productService);
      if (!targetAudience) setTargetAudience(brandProfile.targetAudience);
    }
  }, [brandProfile]);

  const handleGenerateCalendar = async () => {
    if (!businessName.trim() || !productService.trim()) {
      onShowToast('Please provide Business Name and Product/Service to generate calendar.', 'error');
      return;
    }

    setLoading(true);
    try {
      const plan = await generateContentCalendarPlan({
        businessName,
        businessType: brandProfile?.businessType,
        productService,
        targetAudience,
        durationDays: duration,
        platform: 'Multi-platform',
        language: brandProfile?.defaultLanguage || 'English',
      });

      setCalendar(plan);
      saveCalendarPlan(plan);
      onUsageUpdate?.();
      onShowToast(`Generated ${duration}-day content calendar with Gemini AI!`, 'success');
    } catch (err: any) {
      if (err.code === 'QUOTA_EXCEEDED') {
        onUpgradeClick();
      }
      onShowToast(err.message || 'Failed to generate calendar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyItem = async (item: CalendarItem) => {
    const dayNum = item.day || item.dayNumber;
    const text = `Day ${dayNum} - ${item.platform} (${item.contentType})\nDate: ${item.date}\nTopic: ${item.topic}\nHook: ${item.hook}\nCTA: ${item.cta}`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(item.id);
      onShowToast(`Copied Day ${dayNum} plan!`, 'info');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDeleteCalendar = () => {
    clearCalendarPlan();
    setCalendar(null);
    onShowToast('Content calendar deleted.', 'info');
  };

  const handleExportTxt = () => {
    if (!calendar) return;
    const lines = [
      `CONTENT CALENDAR (${calendar.durationDays} DAYS)`,
      `Business: ${calendar.businessName}`,
      `Created: ${new Date(calendar.createdAt).toLocaleString()}`,
      `----------------------------------------------------`,
      '',
    ];

    calendar.items.forEach((it) => {
      lines.push(`DAY ${it.day || it.dayNumber} | ${it.date} | ${it.platform} - ${it.contentType}`);
      lines.push(`Topic: ${it.topic}`);
      lines.push(`Hook: ${it.hook}`);
      lines.push(`CTA: ${it.cta}`);
      lines.push('');
    });

    downloadAsTxt(`content_calendar_${calendar.durationDays}days.txt`, lines.join('\n'));
    onShowToast('Exported calendar as TXT file', 'success');
  };

  const handleExportJson = () => {
    if (!calendar) return;
    downloadAsJson(`content_calendar_${calendar.durationDays}days.json`, calendar);
    onShowToast('Exported calendar as JSON file', 'success');
  };

  return (
    <div id="calendar-page" className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>Editorial Planner</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Content Calendar Generator</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Generate 7, 14, or 30 days of consistent, strategic social media topics, hooks, and CTAs.
          </p>
        </div>

        {calendar && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              id="calendar-export-txt-btn"
              onClick={handleExportTxt}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              <span>TXT</span>
            </button>
            <button
              id="calendar-export-json-btn"
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-500" />
              <span>JSON</span>
            </button>
            <button
              id="calendar-delete-btn"
              onClick={handleDeleteCalendar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              title="Delete calendar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Generator Controls Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Business Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="calendar-biz-name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Roviq Design Store"
              className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Product / Service <span className="text-rose-500">*</span>
            </label>
            <input
              id="calendar-product-service"
              type="text"
              value={productService}
              onChange={(e) => setProductService(e.target.value)}
              placeholder="e.g. Oversized Graphic T-Shirts"
              className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Duration Schedule
            </label>
            <div className="flex gap-2">
              {([7, 14, 30] as const).map((days) => (
                <button
                  key={days}
                  id={`duration-btn-${days}`}
                  type="button"
                  onClick={() => setDuration(days)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    duration === days
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Produces a structured cross-platform schedule with reels, carousels, stories, and engagement posts.
          </p>

          <button
            id="calendar-generate-btn"
            type="button"
            onClick={handleGenerateCalendar}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating {duration}-Day Calendar...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate {duration}-Day Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Calendar Items Display */}
      {calendar && calendar.items.length > 0 ? (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {calendar.items.length} Days Generated for {calendar.businessName}
            </span>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                id="view-grid-btn"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                id="view-list-btn"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-semibold ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* View Container */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {calendar.items.map((item) => (
                <div
                  key={item.id}
                  id={`calendar-item-${item.id}`}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                        DAY {item.day || item.dayNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.platform} • {item.contentType}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.topic}</h4>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 text-xs text-slate-700 dark:text-slate-300">
                      <div className="font-semibold text-slate-400 text-[10px] uppercase mb-0.5">Hook</div>
                      "{item.hook}"
                    </div>

                    <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                      <span className="text-slate-400 text-[10px] uppercase block font-semibold">CTA</span>
                      {item.cta}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">{item.date}</span>
                    <button
                      id={`copy-day-${item.day || item.dayNumber}`}
                      onClick={() => handleCopyItem(item)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {calendar.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400">DAY {item.day || item.dayNumber}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 font-medium">{item.date}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        {item.platform} ({item.contentType})
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{item.topic}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 italic">"{item.hook}"</div>
                  </div>

                  <button
                    onClick={() => handleCopyItem(item)}
                    className="self-start md:self-auto p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 text-slate-600 dark:text-slate-300 shrink-0"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No content calendar generated yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Choose a 7, 14, or 30-day schedule above and click "Generate Plan" to construct your tailored social media calendar.
          </p>
        </div>
      )}
    </div>
  );
}
