import { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Wand2,
  Copy,
  Check,
  RotateCcw,
  Loader2,
  Share2,
  Zap,
  Bookmark,
  ChevronRight,
  Flame,
  Film,
  Lightbulb,
  FileText,
  Megaphone,
  UserCheck,
  RefreshCw,
  Palette,
} from 'lucide-react';
import { AIToolType, AIToolResult, BusinessProfile, Platform, Tone, Language } from '../types';
import { generateAIToolOutput } from '../services/geminiService';
import { copyToClipboard } from '../utils/export';
import { addHistoryItem } from '../utils/storage';

export type ToolColorTheme = 'indigo' | 'blue' | 'emerald' | 'purple' | 'amber' | 'slate';

interface ToolThemeConfig {
  id: ToolColorTheme;
  name: string;
  dotBg: string;
  itemBg: string;
  badgeBg: string;
  badgeText: string;
  hoverBorder: string;
  textColor: string;
}

export const TOOL_THEMES: Record<ToolColorTheme, ToolThemeConfig> = {
  indigo: {
    id: 'indigo',
    name: 'Royal Indigo',
    dotBg: 'bg-indigo-600',
    itemBg: 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80',
    badgeBg: 'bg-indigo-200/70 dark:bg-indigo-900/90 text-indigo-800 dark:text-indigo-200',
    badgeText: 'text-indigo-600 dark:text-indigo-400',
    hoverBorder: 'hover:border-indigo-400 dark:hover:border-indigo-600',
    textColor: 'text-slate-900 dark:text-slate-100',
  },
  blue: {
    id: 'blue',
    name: 'Ocean Blue',
    dotBg: 'bg-blue-600',
    itemBg: 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/80',
    badgeBg: 'bg-blue-200/70 dark:bg-blue-900/90 text-blue-800 dark:text-blue-200',
    badgeText: 'text-blue-600 dark:text-blue-400',
    hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-600',
    textColor: 'text-slate-900 dark:text-slate-100',
  },
  emerald: {
    id: 'emerald',
    name: 'Fresh Emerald',
    dotBg: 'bg-emerald-600',
    itemBg: 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80',
    badgeBg: 'bg-emerald-200/70 dark:bg-emerald-900/90 text-emerald-800 dark:text-emerald-200',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-600',
    textColor: 'text-slate-900 dark:text-slate-100',
  },
  purple: {
    id: 'purple',
    name: 'Vibrant Purple',
    dotBg: 'bg-purple-600',
    itemBg: 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/80',
    badgeBg: 'bg-purple-200/70 dark:bg-purple-900/90 text-purple-800 dark:text-purple-200',
    badgeText: 'text-purple-600 dark:text-purple-400',
    hoverBorder: 'hover:border-purple-400 dark:hover:border-purple-600',
    textColor: 'text-slate-900 dark:text-slate-100',
  },
  amber: {
    id: 'amber',
    name: 'Sunset Amber',
    dotBg: 'bg-amber-600',
    itemBg: 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80',
    badgeBg: 'bg-amber-200/70 dark:bg-amber-900/90 text-amber-800 dark:text-amber-200',
    badgeText: 'text-amber-600 dark:text-amber-400',
    hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-600',
    textColor: 'text-slate-900 dark:text-slate-100',
  },
  slate: {
    id: 'slate',
    name: 'Slate Classic',
    dotBg: 'bg-slate-600',
    itemBg: 'bg-slate-100 dark:bg-slate-800/90 border-slate-300 dark:border-slate-700',
    badgeBg: 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200',
    badgeText: 'text-slate-700 dark:text-slate-300',
    hoverBorder: 'hover:border-slate-400 dark:hover:border-slate-500',
    textColor: 'text-slate-900 dark:text-slate-100',
  },
};

interface AIToolsPageProps {
  brandProfile: BusinessProfile | null;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onUpgradeClick: () => void;
  onUsageUpdate?: () => void;
}

interface ToolDefinition {
  id: AIToolType;
  title: string;
  description: string;
  badge: string;
  icon: any;
  contextLabel?: string;
  contextPlaceholder?: string;
}

const TOOLS: ToolDefinition[] = [
  {
    id: 'hook-generator',
    title: 'Hook Generator',
    description: 'Generates 10 high-retention viral opening hooks tailored to your target niche.',
    badge: '10 Hooks',
    icon: Flame,
    contextLabel: 'Specific Angle / Offer (Optional)',
    contextPlaceholder: 'e.g. Focus on our breathable cotton fabric and summer discount',
  },
  {
    id: 'reel-script-generator',
    title: 'Reel Script Generator',
    description: 'Generates a 30-60 second short-form video script with visual scene directions and voiceover.',
    badge: 'Scene-by-Scene',
    icon: Film,
    contextLabel: 'Video Theme / Concept',
    contextPlaceholder: 'e.g. Day in the life styling oversized t-shirts for college',
  },
  {
    id: 'content-idea-generator',
    title: 'Content Idea Generator',
    description: 'Generates 30 creative, ready-to-execute content angles and post themes for your business.',
    badge: '30 Ideas',
    icon: Lightbulb,
    contextLabel: 'Key Focus / Category',
    contextPlaceholder: 'e.g. Streetwear aesthetics, daily outfit rotation, care tips',
  },
  {
    id: 'cta-generator',
    title: 'Call to Action (CTA) Generator',
    description: 'Generates 10 high-converting calls to action tailored for sales, leads, or follower growth.',
    badge: '10 CTAs',
    icon: Zap,
    contextLabel: 'Desired User Action',
    contextPlaceholder: 'e.g. Direct message us on WhatsApp or visit our bio link',
  },
  {
    id: 'hashtag-generator',
    title: 'Hashtags Optimizer',
    description: 'Generates niche, reach, and community hashtags structured to avoid spam flags.',
    badge: 'Categorized',
    icon: Layers,
    contextLabel: 'Keyword / Sub-niche',
    contextPlaceholder: 'e.g. oversized tshirts, graphic tees india, streetwear outfit',
  },
  {
    id: 'caption-generator',
    title: 'Caption Generator',
    description: 'Fast, punchy social media captions complete with hooks and emojis.',
    badge: 'Fast Copy',
    icon: FileText,
    contextLabel: 'Post Topic / Photo Subject',
    contextPlaceholder: 'e.g. Behind the scenes printing process at our warehouse',
  },
  {
    id: 'product-description-generator',
    title: 'Product Description',
    description: 'E-commerce ready product copy emphasizing customer benefits, specs, and reasons to buy.',
    badge: 'E-Commerce',
    icon: Sparkles,
    contextLabel: 'Product Specs & Materials',
    contextPlaceholder: 'e.g. 240 GSM French terry, high-density puff print, oversized boxy fit',
  },
  {
    id: 'ad-copy-generator',
    title: 'Ad Copy Generator',
    description: 'High-converting advertising copy following direct response marketing frameworks.',
    badge: 'Meta / Google Ads',
    icon: Megaphone,
    contextLabel: 'Promotion & Incentive',
    contextPlaceholder: 'e.g. Buy 2 Get 1 Free, Free nationwide shipping, limited stock',
  },
  {
    id: 'bio-generator',
    title: 'Social Media Bio Generator',
    description: '5 high-impact profile bios with value statements, social proof, and click-worthy bio links.',
    badge: '5 Bio Variations',
    icon: UserCheck,
    contextLabel: 'Brand Personality / Claim',
    contextPlaceholder: 'e.g. India’s freshest streetwear collective. Over 10,000 orders shipped.',
  },
  {
    id: 'rewrite-content',
    title: 'Content Rewriter',
    description: 'Paste your existing raw draft or competitor post and revamp it with a fresh, punchy tone.',
    badge: 'Transform Draft',
    icon: RefreshCw,
    contextLabel: 'Paste Existing Text to Rewrite (Required)',
    contextPlaceholder: 'Paste your draft text here...',
  },
];

export function AIToolsPage({
  brandProfile,
  onShowToast,
  onUpgradeClick,
  onUsageUpdate,
}: AIToolsPageProps) {
  const [selectedTool, setSelectedTool] = useState<ToolDefinition>(TOOLS[0]);

  // Form Inputs
  const [businessName, setBusinessName] = useState(brandProfile?.businessName || '');
  const [productService, setProductService] = useState(brandProfile?.productService || '');
  const [targetAudience, setTargetAudience] = useState(brandProfile?.targetAudience || '');
  const [context, setContext] = useState('');
  const [platform, setPlatform] = useState<string>('Instagram');
  const [tone, setTone] = useState<string>(brandProfile?.defaultTone || 'Friendly');
  const [language, setLanguage] = useState<string>(brandProfile?.defaultLanguage || 'English');

  // Execution & Result state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIToolResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [resultTheme, setResultTheme] = useState<ToolColorTheme>(() => {
    const saved = localStorage.getItem('sb_ai_tools_color') as ToolColorTheme;
    return saved && TOOL_THEMES[saved] ? saved : 'indigo';
  });

  const handleSelectTheme = (t: ToolColorTheme) => {
    setResultTheme(t);
    localStorage.setItem('sb_ai_tools_color', t);
  };

  useEffect(() => {
    if (brandProfile) {
      if (!businessName) setBusinessName(brandProfile.businessName);
      if (!productService) setProductService(brandProfile.productService);
      if (!targetAudience) setTargetAudience(brandProfile.targetAudience);
    }
  }, [brandProfile]);

  const handleRunTool = async () => {
    if (!businessName.trim()) {
      onShowToast('Please provide a Business Name.', 'error');
      return;
    }
    if (!productService.trim()) {
      onShowToast('Please specify your Product or Service.', 'error');
      return;
    }
    if (selectedTool.id === 'rewrite-content' && !context.trim()) {
      onShowToast('Please paste the existing content you want to rewrite.', 'error');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const toolOutput = await generateAIToolOutput({
        tool: selectedTool.id,
        businessName,
        productService,
        targetAudience,
        context,
        platform,
        tone,
        language,
      });

      setResult(toolOutput);
      onUsageUpdate?.();
      onShowToast(`Generated with ${selectedTool.title}!`, 'success');
    } catch (err: any) {
      if (err.code === 'QUOTA_EXCEEDED') {
        onUpgradeClick();
      }
      onShowToast(err.message || 'Generation failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResult = async () => {
    if (!result) return;
    const textToCopy = result.items && result.items.length > 0
      ? `${result.title}\n\n` + result.items.map((it, idx) => `${idx + 1}. ${it}`).join('\n\n')
      : `${result.title}\n\n${result.content}`;

    const ok = await copyToClipboard(textToCopy);
    if (ok) {
      setCopied(true);
      onShowToast('Copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveToHistory = () => {
    if (!result) return;
    const fullText = result.items && result.items.length > 0
      ? result.items.join('\n\n')
      : result.content;

    addHistoryItem({
      platform: platform as Platform,
      contentType: 'Post',
      businessName,
      hook: result.title,
      content: fullText,
      cta: '',
      hashtags: [],
      fullResponse: {
        platform: platform as Platform,
        contentType: 'Post',
        hook: result.title,
        content: fullText,
        cta: '',
        hashtags: [],
        variations: [],
      },
    });
    onShowToast('Tool output saved to local history!', 'success');
  };

  return (
    <div id="ai-tools-page" className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Layers className="w-4 h-4" />
          <span>10 AI Micro-Tools</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Specialized AI Marketing Tools</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Select any of our dedicated generators to produce hooks, 30-day idea banks, video scripts, ad copies, and more.
        </p>
      </div>

      {/* Tool Selector Horizontal Strip / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isSelected = selectedTool.id === tool.id;
          return (
            <button
              key={tool.id}
              id={`tool-card-${tool.id}`}
              type="button"
              onClick={() => {
                setSelectedTool(tool);
                setResult(null);
              }}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between min-h-[96px] transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 ring-2 ring-indigo-400/40'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {tool.badge}
                </span>
              </div>
              <span className="text-xs font-bold leading-tight mt-2">{tool.title}</span>
            </button>
          );
        })}
      </div>

      {/* Two Column Work Area: Inputs on Left, Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: 5 cols */}
        <div className="lg:col-span-5 space-y-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{selectedTool.title}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{selectedTool.description}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Business Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="tool-business-name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Roviq Design Store"
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Product / Service <span className="text-rose-500">*</span>
            </label>
            <input
              id="tool-product-service"
              type="text"
              value={productService}
              onChange={(e) => setProductService(e.target.value)}
              placeholder="e.g. Premium Oversized Graphic T-Shirts"
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Target Audience
            </label>
            <input
              id="tool-target-audience"
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. College students, young creators"
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {selectedTool.contextLabel || 'Specific Direction / Context'}
            </label>
            <textarea
              id="tool-context-input"
              rows={3}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={selectedTool.contextPlaceholder || 'Optional guidelines or details...'}
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tone
              </label>
              <select
                id="tool-tone-select"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Friendly" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Friendly</option>
                <option value="Professional" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Professional</option>
                <option value="Bold" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Bold</option>
                <option value="Inspirational" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Inspirational</option>
                <option value="Casual" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Casual</option>
                <option value="Gen Z" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Gen Z</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Language
              </label>
              <select
                id="tool-language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="English" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">English</option>
                <option value="Hindi" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Hindi</option>
                <option value="Gujarati" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Gujarati</option>
                <option value="Hinglish" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Hinglish</option>
                <option value="Hindi + English" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Hindi + English</option>
                <option value="Gujarati + English" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Gujarati + English</option>
              </select>
            </div>
          </div>

          <button
            id="tool-generate-btn"
            type="button"
            onClick={handleRunTool}
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating {selectedTool.title}...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Output</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output: 7 cols */}
        <div className="lg:col-span-7">
          <div className="h-full min-h-[400px] p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            {loading ? (
              <div className="m-auto text-center py-16 space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Gemini is running {selectedTool.title}...
                </p>
                <p className="text-xs text-slate-400">Structuring tailored output for {businessName || 'your business'}</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                {/* Result Header & Palette Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{result.title}</h4>
                    <span className="text-[11px] text-slate-400">Generated with Gemini AI</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Interactive Color Changer */}
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                      <Palette className="w-3 h-3 text-slate-400 mr-0.5" />
                      {(Object.keys(TOOL_THEMES) as ToolColorTheme[]).map((themeKey) => {
                        const th = TOOL_THEMES[themeKey];
                        const isSelected = resultTheme === themeKey;
                        return (
                          <button
                            key={themeKey}
                            type="button"
                            onClick={() => handleSelectTheme(themeKey)}
                            title={`Switch color to ${th.name}`}
                            className={`w-3.5 h-3.5 rounded-full ${th.dotBg} transition-all cursor-pointer ${
                              isSelected
                                ? 'ring-2 ring-indigo-500 scale-125 shadow-xs'
                                : 'opacity-60 hover:opacity-100 hover:scale-110'
                            }`}
                          />
                        );
                      })}
                    </div>

                    <button
                      id="tool-copy-btn"
                      onClick={handleCopyResult}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      id="tool-save-btn"
                      onClick={handleSaveToHistory}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>

                {/* List or Content Output */}
                {(() => {
                  const currentTheme = TOOL_THEMES[resultTheme] || TOOL_THEMES.indigo;
                  return result.items && result.items.length > 0 ? (
                    <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                      {result.items.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border text-xs sm:text-[13px] flex items-start justify-between gap-3 group transition-all shadow-xs ${currentTheme.itemBg} ${currentTheme.hoverBorder} ${currentTheme.textColor}`}
                        >
                          <div className="flex items-start gap-2.5 flex-1">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-black shrink-0 ${currentTheme.badgeBg}`}
                            >
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed whitespace-pre-wrap font-medium flex-1">
                              {item}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              copyToClipboard(item);
                              onShowToast('Copied item!', 'info');
                            }}
                            className="opacity-70 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all shrink-0 cursor-pointer"
                            title="Copy this single item"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium shadow-xs ${currentTheme.itemBg} ${currentTheme.textColor}`}
                    >
                      {result.content}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="m-auto text-center py-16 px-4">
                <Layers className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No output generated yet</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Select a tool, adjust details on the left, and click Generate Output to run Gemini AI.
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Uses 1 generation count from your monthly plan.</span>
              <span className="font-medium text-indigo-600 dark:text-indigo-400">Gemini 3.8 Flash</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
