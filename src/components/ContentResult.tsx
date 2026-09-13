import { useState, useEffect } from 'react';
import {
  Copy,
  Edit3,
  RefreshCw,
  Bookmark,
  Download,
  Trash2,
  Check,
  Share2,
  FileText,
  FileJson,
  Sparkles,
  Save,
  X,
  Layers,
  Palette,
} from 'lucide-react';
import { GenerationResponse, ContentVariation } from '../types';
import { copyToClipboard, downloadAsTxt, downloadAsJson, formatResultForTxt } from '../utils/export';

export type CaptionColorTheme = 'blue' | 'indigo' | 'emerald' | 'purple' | 'amber' | 'neutral';

export const CAPTION_THEMES: Record<
  CaptionColorTheme,
  {
    name: string;
    labelColor: string;
    badgeBg: string;
    containerBg: string;
    borderColor: string;
    textColor: string;
    dotBg: string;
    textareaBg: string;
  }
> = {
  blue: {
    name: 'Ocean Blue',
    labelColor: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-100/80 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700/60',
    containerBg: 'bg-blue-50/70 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800/60',
    textColor: 'text-blue-950 dark:text-blue-50',
    dotBg: 'bg-blue-500',
    textareaBg: 'bg-blue-50/40 dark:bg-blue-950/40 text-blue-950 dark:text-blue-50 border-blue-300 dark:border-blue-700',
  },
  indigo: {
    name: 'Royal Indigo',
    labelColor: 'text-indigo-600 dark:text-indigo-400',
    badgeBg: 'bg-indigo-100/80 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700/60',
    containerBg: 'bg-indigo-50/60 dark:bg-indigo-950/30',
    borderColor: 'border-indigo-200 dark:border-indigo-800/60',
    textColor: 'text-indigo-950 dark:text-indigo-50',
    dotBg: 'bg-indigo-500',
    textareaBg: 'bg-indigo-50/40 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-50 border-indigo-300 dark:border-indigo-700',
  },
  emerald: {
    name: 'Fresh Emerald',
    labelColor: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700/60',
    containerBg: 'bg-emerald-50/60 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800/60',
    textColor: 'text-emerald-950 dark:text-emerald-50',
    dotBg: 'bg-emerald-500',
    textareaBg: 'bg-emerald-50/40 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-50 border-emerald-300 dark:border-emerald-700',
  },
  purple: {
    name: 'Vibrant Purple',
    labelColor: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-100/80 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700/60',
    containerBg: 'bg-purple-50/60 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800/60',
    textColor: 'text-purple-950 dark:text-purple-50',
    dotBg: 'bg-purple-500',
    textareaBg: 'bg-purple-50/40 dark:bg-purple-950/40 text-purple-950 dark:text-purple-50 border-purple-300 dark:border-purple-700',
  },
  amber: {
    name: 'Warm Amber',
    labelColor: 'text-amber-700 dark:text-amber-400',
    badgeBg: 'bg-amber-100/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-700/60',
    containerBg: 'bg-amber-50/60 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800/60',
    textColor: 'text-amber-950 dark:text-amber-50',
    dotBg: 'bg-amber-500',
    textareaBg: 'bg-amber-50/40 dark:bg-amber-950/40 text-amber-950 dark:text-amber-50 border-amber-300 dark:border-amber-700',
  },
  neutral: {
    name: 'Slate Classic',
    labelColor: 'text-slate-700 dark:text-slate-300',
    badgeBg: 'bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
    containerBg: 'bg-slate-50 dark:bg-slate-850/70',
    borderColor: 'border-slate-200 dark:border-slate-800',
    textColor: 'text-slate-900 dark:text-slate-100',
    dotBg: 'bg-slate-500',
    textareaBg: 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700',
  },
};

interface ContentResultProps {
  result: GenerationResponse;
  businessName?: string;
  onRegenerate: () => void;
  onSaveToHistory: (updatedResult: GenerationResponse) => void;
  onDelete: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  isRegenerating?: boolean;
}

export function ContentResult({
  result,
  businessName,
  onRegenerate,
  onSaveToHistory,
  onDelete,
  onShowToast,
  isRegenerating = false,
}: ContentResultProps) {
  const [selectedVarIndex, setSelectedVarIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedHook, setEditedHook] = useState(result.hook);
  const [editedContent, setEditedContent] = useState(result.content);
  const [editedCta, setEditedCta] = useState(result.cta);
  const [editedHashtags, setEditedHashtags] = useState(result.hashtags.join(' '));
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [captionTheme, setCaptionTheme] = useState<CaptionColorTheme>(() => {
    const saved = localStorage.getItem('sb_caption_theme');
    if (saved && saved in CAPTION_THEMES) {
      return saved as CaptionColorTheme;
    }
    return 'blue';
  });

  const activeTheme = CAPTION_THEMES[captionTheme] || CAPTION_THEMES.blue;

  const handleSelectTheme = (newTheme: CaptionColorTheme) => {
    setCaptionTheme(newTheme);
    localStorage.setItem('sb_caption_theme', newTheme);
    onShowToast(`Caption theme changed to ${CAPTION_THEMES[newTheme].name}`, 'info');
  };

  // Active variation or default
  const variations = result.variations && result.variations.length > 0
    ? result.variations
    : [
        {
          id: 'v1',
          title: 'Main Variation',
          hook: result.hook,
          content: result.content,
          cta: result.cta,
          hashtags: result.hashtags,
        },
      ];

  const currentVariation: ContentVariation = variations[selectedVarIndex] || variations[0];

  // Handle switching variations
  const handleSelectVariation = (index: number) => {
    setSelectedVarIndex(index);
    const target = variations[index];
    if (target) {
      setEditedHook(target.hook || result.hook);
      setEditedContent(target.content || result.content);
      setEditedCta(target.cta || result.cta);
      setEditedHashtags((target.hashtags || result.hashtags).join(' '));
    }
    setIsEditing(false);
  };

  // Copy full formatted content
  const handleCopy = async () => {
    const activeHook = isEditing ? editedHook : currentVariation.hook || result.hook;
    const activeContent = isEditing ? editedContent : currentVariation.content || result.content;
    const activeCta = isEditing ? editedCta : currentVariation.cta || result.cta;
    const activeTags = isEditing
      ? editedHashtags
      : (currentVariation.hashtags || result.hashtags).map((t) => (t.startsWith('#') ? t : `#${t}`)).join(' ');

    const fullText = [
      activeHook ? `[HOOK]\n${activeHook}\n` : '',
      activeContent ? `[CONTENT]\n${activeContent}\n` : '',
      activeCta ? `[CTA]\n${activeCta}\n` : '',
      activeTags ? `[HASHTAGS]\n${activeTags}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const success = await copyToClipboard(fullText);
    if (success) {
      setCopied(true);
      onShowToast('Content copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } else {
      onShowToast('Failed to copy to clipboard. Please copy manually.', 'error');
    }
  };

  // Save changes from inline editing
  const handleSaveChanges = () => {
    const updatedTags = editedHashtags
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    const updatedResult: GenerationResponse = {
      ...result,
      hook: editedHook,
      content: editedContent,
      cta: editedCta,
      hashtags: updatedTags,
      variations: result.variations.map((v, idx) => {
        if (idx === selectedVarIndex) {
          return {
            ...v,
            hook: editedHook,
            content: editedContent,
            cta: editedCta,
            hashtags: updatedTags,
          };
        }
        return v;
      }),
    };

    onSaveToHistory(updatedResult);
    setIsEditing(false);
    onShowToast('Changes saved successfully!', 'success');
  };

  const handleCancelEditing = () => {
    setEditedHook(currentVariation.hook || result.hook);
    setEditedContent(currentVariation.content || result.content);
    setEditedCta(currentVariation.cta || result.cta);
    setEditedHashtags((currentVariation.hashtags || result.hashtags).join(' '));
    setIsEditing(false);
  };

  const handleSaveToHistory = () => {
    onSaveToHistory(result);
    setIsSaved(true);
    onShowToast('Saved to local content history!', 'success');
  };

  const handleDownloadTxt = () => {
    const text = formatResultForTxt(result, businessName);
    const filename = `${result.platform.toLowerCase()}_${result.contentType.toLowerCase()}_${Date.now()}.txt`;
    downloadAsTxt(filename, text);
    setShowExportMenu(false);
    onShowToast('Exported as TXT file', 'success');
  };

  const handleDownloadJson = () => {
    const filename = `${result.platform.toLowerCase()}_${result.contentType.toLowerCase()}_${Date.now()}.json`;
    downloadAsJson(filename, result);
    setShowExportMenu(false);
    onShowToast('Exported as JSON file', 'success');
  };

  return (
    <div
      id="content-result-card"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden text-slate-900 dark:text-slate-100"
    >
      {/* Top Header Bar */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            id="result-platform-badge"
            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
          >
            {result.platform}
          </span>
          <span
            id="result-content-type-badge"
            className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            {result.contentType}
          </span>
          {businessName && (
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              • for <span className="font-semibold text-slate-700 dark:text-slate-300">{businessName}</span>
            </span>
          )}
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            id="result-copy-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            id="result-edit-btn"
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isEditing
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
            title="Edit generated content"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Editing' : 'Edit'}</span>
          </button>

          <button
            id="result-regenerate-btn"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50"
            title="Regenerate with Gemini"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
          </button>

          <button
            id="result-save-btn"
            onClick={handleSaveToHistory}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isSaved
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
            title="Save to local history"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              id="result-download-btn"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="Download or Export"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {showExportMenu && (
              <div
                id="result-export-dropdown"
                className="absolute right-0 mt-2 w-44 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 shadow-xl z-20 py-1.5 text-xs text-slate-700 dark:text-slate-300 animate-in fade-in"
              >
                <button
                  id="export-txt-btn"
                  onClick={handleDownloadTxt}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Download TXT
                </button>
                <button
                  id="export-json-btn"
                  onClick={handleDownloadJson}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <FileJson className="w-4 h-4 text-amber-500" />
                  Download JSON
                </button>
              </div>
            )}
          </div>

          <button
            id="result-delete-btn"
            onClick={onDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete this result"
            aria-label="Delete result"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Variations Navigation Tabs */}
      {variations.length > 1 && (
        <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-850/40 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mr-2 shrink-0">
            <Layers className="w-3.5 h-3.5" />
            <span>Variations:</span>
          </div>
          {variations.map((v, index) => {
            const isActive = index === selectedVarIndex;
            return (
              <button
                key={v.id || index}
                id={`variation-tab-${index}`}
                onClick={() => handleSelectVariation(index)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-750'
                }`}
              >
                {v.title || `Variation ${index + 1}`}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-6 space-y-6">
        {isEditing ? (
          /* Inline Editor */
          <div id="content-edit-mode" className="space-y-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
              <span>Editing active variation. Make your edits and click Save Changes below.</span>
              <div className="flex items-center gap-2">
                <button
                  id="cancel-edit-btn"
                  onClick={handleCancelEditing}
                  className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  id="save-edit-btn"
                  onClick={handleSaveChanges}
                  className="px-3 py-1 rounded bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Hook
              </label>
              <textarea
                id="edit-hook-input"
                value={editedHook}
                onChange={(e) => setEditedHook(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`block text-xs font-bold uppercase tracking-wider ${activeTheme.labelColor}`}>
                  Main Content / Caption
                </label>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${activeTheme.badgeBg}`}>
                  {activeTheme.name}
                </span>
              </div>
              <textarea
                id="edit-content-input"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={8}
                className={`w-full p-3.5 rounded-xl border ${activeTheme.textareaBg} text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Call To Action (CTA)
              </label>
              <input
                id="edit-cta-input"
                type="text"
                value={editedCta}
                onChange={(e) => setEditedCta(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Hashtags (Space separated)
              </label>
              <input
                id="edit-hashtags-input"
                type="text"
                value={editedHashtags}
                onChange={(e) => setEditedHashtags(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        ) : (
          /* Structured Clean Display */
          <div id="content-display-mode" className="space-y-6">
            {/* HOOK Section */}
            <div id="result-hook-section" className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
              <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>HOOK</span>
              </div>
              <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                {currentVariation.hook || result.hook}
              </p>
            </div>

            {/* MAIN CONTENT / CAPTION Section */}
            <div id="result-caption-section" className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 ${activeTheme.labelColor}`}>
                    <FileText className="w-3.5 h-3.5" />
                    <span>{result.contentType.toUpperCase()} / CAPTION</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${activeTheme.badgeBg}`}>
                    {activeTheme.name}
                  </span>
                </div>

                {/* Interactive Caption Color Changer */}
                <div
                  id="caption-color-picker"
                  className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs"
                >
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-0.5">
                    <Palette className="w-3.5 h-3.5" />
                    <span>Color:</span>
                  </span>
                  {(Object.keys(CAPTION_THEMES) as CaptionColorTheme[]).map((themeKey) => {
                    const t = CAPTION_THEMES[themeKey];
                    const isSelected = captionTheme === themeKey;
                    return (
                      <button
                        key={themeKey}
                        type="button"
                        onClick={() => handleSelectTheme(themeKey)}
                        title={`Switch caption to ${t.name}`}
                        className={`w-5 h-5 rounded-full ${t.dotBg} transition-all flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-offset-1 ring-slate-800 dark:ring-white scale-110 shadow-xs'
                            : 'opacity-70 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Themed Caption Content Box */}
              <div
                id="result-caption-content"
                className={`p-5 rounded-xl border ${activeTheme.containerBg} ${activeTheme.borderColor} ${activeTheme.textColor} text-sm sm:text-base leading-relaxed whitespace-pre-wrap transition-colors duration-200 shadow-xs font-medium`}
              >
                {currentVariation.content || result.content}
              </div>
            </div>

            {/* CALL TO ACTION Section */}
            {(currentVariation.cta || result.cta) && (
              <div id="result-cta-section" className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                <div className="text-[11px] font-bold tracking-wider uppercase text-emerald-700 dark:text-emerald-400 mb-1">
                  CALL TO ACTION (CTA)
                </div>
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                  {currentVariation.cta || result.cta}
                </p>
              </div>
            )}

            {/* HASHTAGS Section */}
            {(currentVariation.hashtags?.length > 0 || result.hashtags?.length > 0) && (
              <div id="result-hashtags-section" className="space-y-2">
                <div className="text-xs font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                  HASHTAGS
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(currentVariation.hashtags && currentVariation.hashtags.length > 0
                    ? currentVariation.hashtags
                    : result.hashtags
                  ).map((tag, idx) => {
                    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
                    return (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        onClick={() => {
                          copyToClipboard(cleanTag);
                          onShowToast(`Copied ${cleanTag}`, 'info');
                        }}
                        title="Click to copy single tag"
                      >
                        {cleanTag}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Marketing Note / Tip */}
            {result.notes && (
              <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 italic">
                💡 Strategist Note: {result.notes}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
