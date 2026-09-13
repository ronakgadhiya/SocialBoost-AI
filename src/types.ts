export type Platform =
  | 'Instagram'
  | 'Facebook'
  | 'LinkedIn'
  | 'YouTube'
  | 'WhatsApp'
  | 'Google Business Profile'
  | 'Pinterest'
  | 'X';

export type ContentType =
  | 'Caption'
  | 'Post'
  | 'Reel Script'
  | 'Carousel'
  | 'Story'
  | 'Advertisement'
  | 'Product Description'
  | 'Video Script'
  | 'Content Ideas'
  | 'CTA'
  | 'Call To Action'
  | 'Hashtags'
  | 'Bio';

export type CampaignGoal =
  | 'Increase Sales'
  | 'Generate Leads'
  | 'Increase Followers'
  | 'Increase Engagement'
  | 'Brand Awareness'
  | 'Website Traffic'
  | 'WhatsApp Enquiries'
  | 'Product Launch'
  | 'Event Promotion';

export type Language =
  | 'English'
  | 'Hindi'
  | 'Gujarati'
  | 'Hinglish'
  | 'Gujarati + English'
  | 'Hindi + English';

export type Tone =
  | 'Professional'
  | 'Friendly'
  | 'Funny'
  | 'Emotional'
  | 'Luxury'
  | 'Casual'
  | 'Inspirational'
  | 'Persuasive'
  | 'Bold'
  | 'Gen Z'
  | 'Minimal';

export type ContentLength = 'Short' | 'Medium' | 'Long';

export type EmojiLevel = 'None' | 'Low' | 'Medium' | 'High';

export type HashtagsOption = 'None' | '5' | '10' | '15' | 'AI Optimized';
export type HashtagCount = 'None' | 5 | 10 | 15 | 'AI Optimized' | '5' | '10' | '15';

export interface BusinessProfile {
  businessName: string;
  businessType: string;
  productService: string;
  description: string;
  targetAudience: string;
  location: string;
  usp: string;
  offer?: string;
  price?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  defaultTone?: Tone;
  defaultLanguage?: Language;
}

export interface GenerationRequest {
  businessName: string;
  businessType?: string;
  productService: string;
  description?: string;
  targetAudience: string;
  location?: string;
  usp?: string;
  offer?: string;
  price?: string;
  platform: Platform;
  contentType: ContentType;
  campaignGoal?: CampaignGoal;
  language?: Language;
  tone?: Tone;
  length?: ContentLength;
  emojiLevel?: EmojiLevel;
  hashtagsOption?: HashtagsOption | HashtagCount;
  hashtagCount?: HashtagCount;
}

export interface ScriptScene {
  sceneNumber: number;
  title: string;
  visual: string;
  audio: string;
}

export interface CarouselSlide {
  slideNumber: number;
  headline: string;
  body: string;
  visualNote?: string;
}

export interface ContentVariation {
  id: string;
  title: 'Professional' | 'Creative' | 'High Converting' | string;
  hook: string;
  content: string;
  cta: string;
  hashtags: string[];
  scenes?: ScriptScene[];
  slides?: CarouselSlide[];
}

export interface GenerationResponse {
  platform: Platform;
  contentType: ContentType;
  hook: string;
  content: string;
  cta: string;
  hashtags: string[];
  variations: ContentVariation[];
  notes?: string;
}

export interface GenerationHistoryItem {
  id: string;
  businessName: string;
  platform: Platform;
  contentType: ContentType;
  content: string;
  hook?: string;
  cta?: string;
  hashtags?: string[];
  fullResult?: GenerationResponse;
  fullResponse?: GenerationResponse;
  createdAt: number;
}

export interface CalendarItem {
  id: string;
  dayNumber: number;
  day?: number;
  date: string;
  platform: Platform;
  contentType: ContentType;
  topic: string;
  hook: string;
  cta: string;
  status?: 'planned' | 'drafted' | 'published';
}

export interface CalendarPlan {
  id: string;
  businessName: string;
  durationDays: 7 | 14 | 30;
  createdAt: number;
  items: CalendarItem[];
}

export interface UsageData {
  count: number;
  maxFree: number;
  lastResetMonth: string;
}

export type AIToolType =
  | 'caption'
  | 'hook'
  | 'cta'
  | 'hashtag'
  | 'reel'
  | 'ideas'
  | 'product_desc'
  | 'ad_copy'
  | 'bio'
  | 'rewrite'
  | 'hook-generator'
  | 'reel-script-generator'
  | 'content-idea-generator'
  | 'cta-generator'
  | 'hashtag-generator'
  | 'caption-generator'
  | 'product-description-generator'
  | 'ad-copy-generator'
  | 'bio-generator'
  | 'rewrite-content';

export interface AIToolResult {
  tool?: AIToolType | string;
  title: string;
  items?: string[];
  content?: string;
  metadata?: Record<string, unknown>;
}

export type ActiveTab =
  | 'landing'
  | 'dashboard'
  | 'generator'
  | 'ai-tools'
  | 'calendar'
  | 'history'
  | 'brand'
  | 'pricing'
  | 'settings';
