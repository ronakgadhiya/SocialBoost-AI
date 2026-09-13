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
} from 'lucide-react';
import { AIToolType, AIToolResult, BusinessProfile, Platform, Tone, Language } from '../types';
import { generateAIToolOutput } from '../services/geminiService';
import { copyToClipboard } from '../utils/export';
import { addHistoryItem } from '../utils/storage';

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
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="Friendly">Friendly</option>
                <option value="Professional">Professional</option>
                <option value="Bold">Bold</option>
                <option value="Inspirational">Inspirational</option>
                <option value="Casual">Casual</option>
                <option value="Gen Z">Gen Z</option>
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
                className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Hinglish">Hinglish</option>
                <option value="Hindi + English">Hindi + English</option>
                <option value="Gujarati + English">Gujarati + English</option>
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
                {/* Result Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{result.title}</h4>
                    <span className="text-[11px] text-slate-400">Generated with Gemini AI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      id="tool-copy-btn"
                      onClick={handleCopyResult}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      id="tool-save-btn"
                      onClick={handleSaveToHistory}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>

                {/* List or Content Output */}
                {result.items && result.items.length > 0 ? (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {result.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-800 dark:text-slate-200 flex items-start justify-between gap-3 group hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                            {idx + 1}.
                          </span>
                          <span className="leading-relaxed whitespace-pre-wrap">{item}</span>
                        </div>
                        <button
                          onClick={() => {
                            copyToClipboard(item);
                            onShowToast('Copied item!', 'info');
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all shrink-0"
                          title="Copy this single item"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {result.content}
                  </div>
                )}
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
