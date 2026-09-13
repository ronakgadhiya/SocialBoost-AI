import { useState, useEffect, FormEvent } from 'react';
import { Briefcase, Save, RotateCcw, Check, Sparkles, Globe, AtSign } from 'lucide-react';
import { BusinessProfile, Tone, Language } from '../types';
import { saveBrandProfile, getBrandProfile, clearBrandProfile } from '../utils/storage';
import { DEMO_BUSINESS } from '../data/demoData';

interface BrandProfilePageProps {
  onProfileSaved: (profile: BusinessProfile) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

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

const LANGUAGES: Language[] = [
  'English',
  'Hindi',
  'Gujarati',
  'Hinglish',
  'Gujarati + English',
  'Hindi + English',
];

export function BrandProfilePage({ onProfileSaved, onShowToast }: BrandProfilePageProps) {
  const [formData, setFormData] = useState<BusinessProfile>({
    businessName: '',
    businessType: '',
    productService: '',
    description: '',
    targetAudience: '',
    location: '',
    usp: '',
    offer: '',
    price: '',
    website: '',
    instagram: '',
    facebook: '',
    linkedin: '',
    defaultTone: 'Friendly',
    defaultLanguage: 'English',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const existing = getBrandProfile();
    if (existing) {
      setFormData(existing);
    }
  }, []);

  const handleChange = (field: keyof BusinessProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.businessName.trim() || !formData.productService.trim()) {
      onShowToast('Business Name and Product/Service are required.', 'error');
      return;
    }

    saveBrandProfile(formData);
    onProfileSaved(formData);
    setSavedSuccess(true);
    onShowToast('Brand profile saved to localStorage!', 'success');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    clearBrandProfile();
    setFormData({
      businessName: '',
      businessType: '',
      productService: '',
      description: '',
      targetAudience: '',
      location: '',
      usp: '',
      offer: '',
      price: '',
      website: '',
      instagram: '',
      facebook: '',
      linkedin: '',
      defaultTone: 'Friendly',
      defaultLanguage: 'English',
    });
    onShowToast('Brand profile cleared from localStorage.', 'info');
  };

  const handleLoadDemo = () => {
    setFormData(DEMO_BUSINESS);
    saveBrandProfile(DEMO_BUSINESS);
    onProfileSaved(DEMO_BUSINESS);
    onShowToast('Demo brand profile (Roviq Design Store) loaded!', 'success');
  };

  return (
    <div id="brand-profile-page" className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" />
            <span>Brand Information</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Brand Profile</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Save your business details once. They will automatically pre-fill your generator and AI tools.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadDemo}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 flex items-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Load Demo Store Data</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Core Business Identity */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Core Business Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Business Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="brand-business-name"
                type="text"
                required
                placeholder="e.g. Roviq Design Store"
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Business Type / Industry
              </label>
              <input
                id="brand-business-type"
                type="text"
                placeholder="e.g. Fashion & Streetwear, Cafe, Bakery"
                value={formData.businessType}
                onChange={(e) => handleChange('businessType', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Product / Service Details <span className="text-rose-500">*</span>
              </label>
              <input
                id="brand-product-service"
                type="text"
                required
                placeholder="e.g. Customized 240 GSM Graphic T-Shirts"
                value={formData.productService}
                onChange={(e) => handleChange('productService', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Audience <span className="text-rose-500">*</span>
              </label>
              <input
                id="brand-target-audience"
                type="text"
                placeholder="e.g. Students and Young Adults (Ages 18-28)"
                value={formData.targetAudience}
                onChange={(e) => handleChange('targetAudience', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Business Description
            </label>
            <textarea
              id="brand-description"
              rows={3}
              placeholder="Explain what your brand stands for, what sets you apart, and your core mission..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Section 2: Positioning & Market */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Market Positioning & Value
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Location / City / Country
              </label>
              <input
                id="brand-location"
                type="text"
                placeholder="e.g. Mumbai, India or Worldwide"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Unique Selling Proposition (USP)
              </label>
              <input
                id="brand-usp"
                type="text"
                placeholder="e.g. 100% bio-washed cotton, fade-proof prints, free returns"
                value={formData.usp}
                onChange={(e) => handleChange('usp', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Standard / Ongoing Offer (Optional)
              </label>
              <input
                id="brand-offer"
                type="text"
                placeholder="e.g. Flat 15% OFF on first order"
                value={formData.offer || ''}
                onChange={(e) => handleChange('offer', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Starting Price / Price Range (Optional)
              </label>
              <input
                id="brand-price"
                type="text"
                placeholder="e.g. Starting from ₹499"
                value={formData.price || ''}
                onChange={(e) => handleChange('price', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Social Profiles & Defaults */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Social Profiles & AI Defaults
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Website URL
              </label>
              <input
                id="brand-website"
                type="url"
                placeholder="https://yourstore.com"
                value={formData.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <AtSign className="w-3.5 h-3.5 text-slate-400" />
                Instagram Handle
              </label>
              <input
                id="brand-instagram"
                type="text"
                placeholder="@yourbrand"
                value={formData.instagram || ''}
                onChange={(e) => handleChange('instagram', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Default Tone
              </label>
              <select
                id="brand-default-tone"
                value={formData.defaultTone || 'Friendly'}
                onChange={(e) => handleChange('defaultTone', e.target.value as Tone)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {TONES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Default Language
              </label>
              <select
                id="brand-default-language"
                value={formData.defaultLanguage || 'English'}
                onChange={(e) => handleChange('defaultLanguage', e.target.value as Language)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            id="brand-reset-btn"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <button
            type="submit"
            id="brand-save-btn"
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Brand Profile Saved!' : 'Save Brand Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
