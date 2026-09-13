import { BusinessProfile, GenerationRequest } from '../types';

export const DEMO_BUSINESS: BusinessProfile = {
  businessName: 'Roviq Design Store',
  businessType: 'Fashion & Lifestyle',
  productService: 'Customized T-Shirts & Graphic Streetwear',
  description: 'Trendy, oversized graphic tees and customized streetwear designed for self-expression, comfortable daily wear, and premium 240 GSM breathable cotton fabric.',
  targetAudience: 'Students and Young Adults (Ages 18-28)',
  location: 'India',
  usp: 'Eco-friendly breathable bio-washed cotton with original Gen-Z graphic prints that never fade.',
  offer: 'Flat 20% OFF on New Season Drop with code ROVIQ20',
  price: 'Starting at ₹699',
  website: 'https://roviqdesigns.example.com',
  instagram: '@roviqdesigns',
  facebook: 'facebook.com/roviqdesigns',
  linkedin: '',
  defaultTone: 'Creative' as any,
  defaultLanguage: 'English',
};

export const DEMO_GENERATION_REQUEST: GenerationRequest = {
  businessName: 'Roviq Design Store',
  businessType: 'Fashion & Lifestyle',
  productService: 'Customized T-Shirts & Graphic Streetwear',
  description: 'Trendy, oversized graphic tees and customized streetwear designed for self-expression, comfortable daily wear, and premium 240 GSM breathable cotton fabric.',
  targetAudience: 'Students and Young Adults (Ages 18-28)',
  location: 'India',
  usp: 'Eco-friendly breathable bio-washed cotton with original Gen-Z graphic prints that never fade.',
  offer: 'Flat 20% OFF on New Season Drop with code ROVIQ20',
  price: 'Starting at ₹699',
  platform: 'Instagram',
  contentType: 'Caption',
  campaignGoal: 'Product Launch',
  language: 'English',
  tone: 'Casual',
  length: 'Medium',
  emojiLevel: 'Medium',
  hashtagsOption: 'AI Optimized',
};
