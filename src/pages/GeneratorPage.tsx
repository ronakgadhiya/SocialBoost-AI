import { useState, useEffect } from 'react';
import {
  Wand2,
  Sparkles,
  PlayCircle,
  RotateCcw,
  AlertCircle,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Zap,
  Target,
  Share2,
  Twitter,
  CheckCircle2,
  ChevronDown,
  Info,
} from 'lucide-react';
import {
  Platform,
  ContentType,
  CampaignGoal,
  Language,
  Tone,
  ContentLength,
  EmojiLevel,
  HashtagCount,
  BusinessProfile,
  GenerationRequest,
  GenerationResponse,
} from '../types';
import { generateSocialContent } from '../services/geminiService';
import { validateGenerationRequest } from '../utils/validation';
import { addHistoryItem } from '../utils/storage';
import { DEMO_GENERATION_REQUEST } from '../data/demoData';
import { GenerationLoader } from '../components/GenerationLoader';
import { ContentResult } from '../components/ContentResult';

interface GeneratorPageProps {
  brandProfile: BusinessProfile | null;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onUpgradeClick: () => void;
  onUsageUpdate?: () => void;
}

const PLATFORMS: Array<{ id: Platform; label: string; icon: any; color: string }> = [
  { id: 'Instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { id: 'Facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  { id: 'LinkedIn', label: 'LinkedIn', icon: Linkedin, color: 'text-sky-600' },
  { id: 'YouTube', label: 'YouTube', icon: Youtube, color: 'text-red-600' },
  { id: 'WhatsApp', label: 'WhatsApp', icon: Zap, color: 'text-emerald-500' },
  { id: 'Google Business Profile', label: 'Google Business', icon: Target, color: 'text-indigo-500' },
  { id: 'Pinterest', label: 'Pinterest', icon: Share2, color: 'text-rose-500' },
  { id: 'X', label: 'X (Twitter)', icon: Twitter, color: 'text-slate-800 dark:text-slate-200' },
];

const CONTENT_TYPES: ContentType[] = [
  'Caption',
  'Post',
  'Reel Script',
  'Carousel',
  'Story',
  'Advertisement',
  'Product Description',
  'Video Script',
  'Content Ideas',
  'Call To Action',
  'Hashtags',
  'Bio',
];

const CAMPAIGN_GOALS: CampaignGoal[] = [
  'Increase Sales',
  'Generate Leads',
  'Increase Followers',
  'Increase Engagement',
  'Brand Awareness',
  'Website Traffic',
  'WhatsApp Enquiries',
  'Product Launch',
  'Event Promotion',
];

const LANGUAGES: Language[] = [
  'English',
  'Hindi',
  'Gujarati',
  'Hinglish',
  'Gujarati + English',
  'Hindi + English',
];

const TONES: Tone[] = [
  'Professional',
  'Friendly',
  'Funny',
  'Emotional',
  'Luxury',
  'Casual',
  'Inspirational',
  'Persuasive',
  'Bold',
  'Gen Z',
  'Minimal',
];

const LENGTHS: ContentLength[] = ['Short', 'Medium', 'Long'];
const EMOJI_LEVELS: EmojiLevel[] = ['None', 'Low', 'Medium', 'High'];
const HASHTAG_OPTIONS: HashtagCount[] = ['None', 5, 10, 15, 'AI Optimized'];

export function GeneratorPage({
  brandProfile,
  onShowToast,
  onUpgradeClick,
  onUsageUpdate,
}: GeneratorPageProps) {
  // Form State
  const [businessName, setBusinessName] = useState(brandProfile?.businessName || '');
  const [businessType, setBusinessType] = useState(brandProfile?.businessType || '');
  const [productService, setProductService] = useState(brandProfile?.productService || '');
  const [description, setDescription] = useState(brandProfile?.description || '');
  const [targetAudience, setTargetAudience] = useState(brandProfile?.targetAudience || '');
  const [location, setLocation] = useState(brandProfile?.location || '');
  const [usp, setUsp] = useState(brandProfile?.usp || '');
  const [offer, setOffer] = useState(brandProfile?.offer || '');
  const [price, setPrice] = useState(brandProfile?.price || '');

  const [platform, setPlatform] = useState<Platform>('Instagram');
  const [contentType, setContentType] = useState<ContentType>('Caption');
  const [campaignGoal, setCampaignGoal] = useState<CampaignGoal>('Increase Sales');
  const [language, setLanguage] = useState<Language>(brandProfile?.defaultLanguage || 'English');
  const [tone, setTone] = useState<Tone>(brandProfile?.defaultTone || 'Friendly');
  const [length, setLength] = useState<ContentLength>('Medium');
  const [emojiLevel, setEmojiLevel] = useState<EmojiLevel>('Medium');
  const [hashtagCount, setHashtagCount] = useState<HashtagCount>(10);

  // Sync with brandProfile when updated
  useEffect(() => {
    if (brandProfile) {
      if (!businessName) setBusinessName(brandProfile.businessName);
      if (!businessType) setBusinessType(brandProfile.businessType);
      if (!productService) setProductService(brandProfile.productService);
      if (!description) setDescription(brandProfile.description);
      if (!targetAudience) setTargetAudience(brandProfile.targetAudience);
      if (!location) setLocation(brandProfile.location);
      if (!usp) setUsp(brandProfile.usp);
      if (!offer && brandProfile.offer) setOffer(brandProfile.offer);
      if (!price && brandProfile.price) setPrice(brandProfile.price);
    }
  }, [brandProfile]);

  // Generation status & errors
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<GenerationResponse | null>(null);

  const getActivePayload = (): GenerationRequest => ({
    businessName,
    businessType,
    productService,
    description,
    targetAudience,
    location,
    usp,
    offer,
    price,
    platform,
    contentType,
    campaignGoal,
    language,
    tone,
    length,
    emojiLevel,
    hashtagCount,
  });

  const handleGenerate = async () => {
    const payload = getActivePayload();
    const validation = validateGenerationRequest(payload);

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      onShowToast('Please fill in all required fields highlighted in red.', 'error');
      // Scroll to first error
      const firstKey = Object.keys(validation.errors)[0];
      const element = document.getElementById(`field-${firstKey}`);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setFormErrors({});
    setIsLoading(true);
    setResult(null);

    try {
      const generated = await generateSocialContent(payload);
      setResult(generated);
      // Auto save to local history
      addHistoryItem({
        platform: generated.platform,
        contentType: generated.contentType,
        businessName: payload.businessName,
        hook: generated.hook,
        content: generated.content,
        cta: generated.cta,
        hashtags: generated.hashtags,
        fullResponse: generated,
      });
      onUsageUpdate?.();
      onShowToast('Content generated successfully by Gemini AI!', 'success');
      // Scroll to result
      setTimeout(() => {
        const resElem = document.getElementById('content-result-card');
        if (resElem) resElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: any) {
      if (err.code === 'QUOTA_EXCEEDED') {
        onUpgradeClick();
      }
      onShowToast(err.message || 'Generation failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    const payload = getActivePayload();
    setIsRegenerating(true);

    try {
      const regenerated = await generateSocialContent(payload);
      setResult(regenerated);
      addHistoryItem({
        platform: regenerated.platform,
        contentType: regenerated.contentType,
        businessName: payload.businessName,
        hook: regenerated.hook,
        content: regenerated.content,
        cta: regenerated.cta,
        hashtags: regenerated.hashtags,
        fullResponse: regenerated,
      });
      onUsageUpdate?.();
      onShowToast('Regenerated fresh content!', 'success');
    } catch (err: any) {
      if (err.code === 'QUOTA_EXCEEDED') {
        onUpgradeClick();
      }
      onShowToast(err.message || 'Regeneration failed.', 'error');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveResultToHistory = (updatedResult: GenerationResponse) => {
    addHistoryItem({
      platform: updatedResult.platform,
      contentType: updatedResult.contentType,
      businessName,
      hook: updatedResult.hook,
      content: updatedResult.content,
      cta: updatedResult.cta,
      hashtags: updatedResult.hashtags,
      fullResponse: updatedResult,
    });
    setResult(updatedResult);
  };

  const handleLoadDemo = () => {
    setBusinessName(DEMO_GENERATION_REQUEST.businessName);
    setBusinessType(DEMO_GENERATION_REQUEST.businessType || '');
    setProductService(DEMO_GENERATION_REQUEST.productService);
    setDescription(DEMO_GENERATION_REQUEST.description || '');
    setTargetAudience(DEMO_GENERATION_REQUEST.targetAudience);
    setLocation(DEMO_GENERATION_REQUEST.location || '');
    setUsp(DEMO_GENERATION_REQUEST.usp || '');
    setOffer(DEMO_GENERATION_REQUEST.offer || '');
    setPrice(DEMO_GENERATION_REQUEST.price || '');
    setPlatform(DEMO_GENERATION_REQUEST.platform);
    setContentType(DEMO_GENERATION_REQUEST.contentType);
    setCampaignGoal(DEMO_GENERATION_REQUEST.campaignGoal || 'Increase Sales');
    setLanguage(DEMO_GENERATION_REQUEST.language || 'English');
    setTone(DEMO_GENERATION_REQUEST.tone || 'Friendly');
    setLength(DEMO_GENERATION_REQUEST.length || 'Medium');
    setEmojiLevel(DEMO_GENERATION_REQUEST.emojiLevel || 'Medium');
    setHashtagCount(DEMO_GENERATION_REQUEST.hashtagCount || 10);
    setFormErrors({});
    onShowToast('Demo data loaded for Roviq Design Store!', 'info');
  };

  const handleReset = () => {
    setBusinessName('');
    setBusinessType('');
    setProductService('');
    setDescription('');
    setTargetAudience('');
    setLocation('');
    setUsp('');
    setOffer('');
    setPrice('');
    setPlatform('Instagram');
    setContentType('Caption');
    setCampaignGoal('Increase Sales');
    setLanguage('English');
    setTone('Friendly');
    setLength('Medium');
    setEmojiLevel('Medium');
    setHashtagCount(10);
    setFormErrors({});
    setResult(null);
    onShowToast('Generator form cleared.', 'info');
  };

  return (
    <div id="generator-page" className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Content Studio</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create Social Media Content</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configure your business details and platform parameters to generate tailored posts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="generator-load-demo-btn"
            type="button"
            onClick={handleLoadDemo}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 flex items-center gap-1.5 transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Load Demo</span>
          </button>

          <button
            id="generator-reset-btn"
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* 1. Business Information Container */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            1. Business Information
          </h3>
          {brandProfile?.businessName && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Pre-filled from Brand Profile
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div id="field-businessName">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Business Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-business-name"
              type="text"
              placeholder="e.g. Roviq Design Store"
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value);
                if (formErrors.businessName) setFormErrors((p) => ({ ...p, businessName: '' }));
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-colors ${
                formErrors.businessName
                  ? 'border-rose-500 ring-1 ring-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
              }`}
            />
            {formErrors.businessName && (
              <p className="text-[11px] text-rose-500 font-medium mt-1">{formErrors.businessName}</p>
            )}
          </div>

          <div id="field-businessType">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Business Type / Category
            </label>
            <input
              id="input-business-type"
              type="text"
              placeholder="e.g. Streetwear Clothing & Apparel"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div id="field-productService">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Product / Service <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-product-service"
              type="text"
              placeholder="e.g. Oversized 240 GSM Graphic T-Shirts"
              value={productService}
              onChange={(e) => {
                setProductService(e.target.value);
                if (formErrors.productService) setFormErrors((p) => ({ ...p, productService: '' }));
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-colors ${
                formErrors.productService
                  ? 'border-rose-500 ring-1 ring-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
              }`}
            />
            {formErrors.productService && (
              <p className="text-[11px] text-rose-500 font-medium mt-1">{formErrors.productService}</p>
            )}
          </div>

          <div id="field-targetAudience">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Target Audience <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-target-audience"
              type="text"
              placeholder="e.g. College students, anime fans, ages 18-26"
              value={targetAudience}
              onChange={(e) => {
                setTargetAudience(e.target.value);
                if (formErrors.targetAudience) setFormErrors((p) => ({ ...p, targetAudience: '' }));
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-colors ${
                formErrors.targetAudience
                  ? 'border-rose-500 ring-1 ring-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
              }`}
            />
            {formErrors.targetAudience && (
              <p className="text-[11px] text-rose-500 font-medium mt-1">{formErrors.targetAudience}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Business Description
          </label>
          <textarea
            id="input-description"
            rows={2}
            placeholder="Tell us what makes your offering special or the background story..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Location / City
            </label>
            <input
              id="input-location"
              type="text"
              placeholder="e.g. Mumbai, India"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Offer / Promotion
            </label>
            <input
              id="input-offer"
              type="text"
              placeholder="e.g. Flat 15% OFF with code ROVIQ15"
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Price / Starting At
            </label>
            <input
              id="input-price"
              type="text"
              placeholder="e.g. Starting from ₹599"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Unique Selling Proposition (USP)
          </label>
          <input
            id="input-usp"
            type="text"
            placeholder="e.g. 100% combed cotton, zero color fading, pre-shrunk fabric"
            value={usp}
            onChange={(e) => setUsp(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* 2. Platform Selection */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          2. Select Target Platform <span className="text-rose-500">*</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PLATFORMS.map((p) => {
            const Icon = p.icon;
            const isSelected = platform === p.id;
            return (
              <button
                key={p.id}
                id={`platform-btn-${p.id.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => setPlatform(p.id)}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-600'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${p.color}`} />
                <span className="truncate">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Content Type & Campaign Goal */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          3. Content Format & Goal
        </h3>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Content Type <span className="text-rose-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map((type) => {
              const isSelected = contentType === type;
              return (
                <button
                  key={type}
                  id={`type-btn-${type.toLowerCase().replace(/\s+/g, '-')}`}
                  type="button"
                  onClick={() => setContentType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Campaign Objective
          </label>
          <div className="flex flex-wrap gap-2">
            {CAMPAIGN_GOALS.map((goal) => {
              const isSelected = campaignGoal === goal;
              return (
                <button
                  key={goal}
                  id={`goal-btn-${goal.toLowerCase().replace(/\s+/g, '-')}`}
                  type="button"
                  onClick={() => setCampaignGoal(goal)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-violet-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                  }`}
                >
                  {goal}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Tone, Language, Length, Emojis & Hashtags */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          4. Style, Language & Fine-Tuning
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Language
            </label>
            <select
              id="select-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Brand Tone
            </label>
            <select
              id="select-tone"
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
            >
              {TONES.map((t) => (
                <option key={t} value={t} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Content Length
            </label>
            <div className="flex gap-1.5">
              {LENGTHS.map((len) => (
                <button
                  key={len}
                  id={`length-btn-${len.toLowerCase()}`}
                  type="button"
                  onClick={() => setLength(len)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    length === len
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Emoji Level
            </label>
            <div className="flex gap-1.5">
              {EMOJI_LEVELS.map((em) => (
                <button
                  key={em}
                  id={`emoji-btn-${em.toLowerCase()}`}
                  type="button"
                  onClick={() => setEmojiLevel(em)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    emojiLevel === em
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Hashtags
            </label>
            <select
              id="select-hashtag-count"
              value={hashtagCount}
              onChange={(e) => {
                const val = e.target.value;
                setHashtagCount(val === 'None' ? 'None' : val === 'AI Optimized' ? 'AI Optimized' : Number(val) as any);
              }}
              className="w-full px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
            >
              {HASHTAG_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  {typeof opt === 'number' ? `${opt} Hashtags` : opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Generate CTA Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Produces 3 tailored variations with real Gemini AI calls.</span>
        </div>

        <button
          id="generate-btn"
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-sm sm:text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <Wand2 className="w-5 h-5" />
          <span>{isLoading ? 'Generating With AI...' : 'Generate Content'}</span>
        </button>
      </div>

      {/* Loading Experience */}
      {isLoading && (
        <div className="pt-4">
          <GenerationLoader platform={platform} contentType={contentType} />
        </div>
      )}

      {/* Result Display Screen */}
      {result && !isLoading && (
        <div className="pt-6">
          <ContentResult
            result={result}
            businessName={businessName}
            onRegenerate={handleRegenerate}
            onSaveToHistory={handleSaveResultToHistory}
            onDelete={() => setResult(null)}
            onShowToast={onShowToast}
            isRegenerating={isRegenerating}
          />
        </div>
      )}
    </div>
  );
}
