import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing. Please configure it in your Settings > Secrets panel.');
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Resilient model fallback helper
async function generateWithModelFallback(
  ai: GoogleGenAI,
  params: { contents: string; config?: any }
) {
  // Try modern high-performance models in sequence with graceful fallback
  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini API] Request failed with ${model}:`, err?.message || err);
      // Wait a tiny bit (300ms) before trying the backup model
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  throw lastError || new Error('All model attempts failed.');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: Date.now(),
  });
});

// Main Content Generation
app.post('/api/generate', async (req, res) => {
  try {
    const {
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
      hashtagsOption,
    } = req.body;

    if (!businessName || !productService || !targetAudience || !platform || !contentType) {
      return res.status(400).json({
        error: 'Missing required fields: businessName, productService, targetAudience, platform, and contentType are required.',
      });
    }

    const ai = getGeminiClient();

    // Platform-specific rules
    let platformSpecificGuidance = '';
    switch (platform) {
      case 'Instagram':
        platformSpecificGuidance = `
For Instagram:
- Must have a punchy 1-line scroll-stopping Hook.
- For Reel: Break into clear scenes (Hook, Scene 1, Scene 2, Scene 3, Scene 4, CTA) with visual cues in brackets [Visual] and spoken audio.
- For Carousel: Provide slide-by-slide structure (Slide 1: Hook, Slides 2-5: Value points, Last Slide: CTA).
- For Caption: Engaging line breaks, conversational flow, compelling question to drive comments.
- Clear CTA for comments, saves, or bio link.
- Targeted hashtags relevant to the niche.`;
        break;
      case 'Facebook':
        platformSpecificGuidance = `
For Facebook:
- Strong headline/hook to stop the feed scroll.
- Storytelling or relatable problem/solution body text.
- Clear, direct Call-to-Action (link click, send message, or comment).
- Moderate, high-intent hashtags (3 to 6).`;
        break;
      case 'LinkedIn':
        platformSpecificGuidance = `
For LinkedIn:
- Professional, insightful opening hook without clickbait.
- Spaced bullet points and thought-leadership value or business lessons.
- Practical business takeaway/insight.
- Professional CTA encouraging professional dialogue or connection.
- Strict limit on emojis (minimal/tasteful). Professional hashtags (3 to 5).`;
        break;
      case 'YouTube':
        platformSpecificGuidance = `
For YouTube:
- High-CTR Title (under 60 characters).
- Compelling First 30 Seconds Hook & Video Outline.
- SEO-rich video description with timestamps format.
- Clickable Thumbnail text idea.
- Clear Subscribe/Watch next CTA.
- Relevant searchable tags.`;
        break;
      case 'WhatsApp':
        platformSpecificGuidance = `
For WhatsApp:
- Crisp, direct marketing message suitable for broadcasts or direct outreach.
- Highlight the core offer and USP immediately.
- Fast CTA with phone/chat action.
- Zero clutter, clear formatting with bolding (*key words*).`;
        break;
      case 'Google Business Profile':
        platformSpecificGuidance = `
For Google Business Profile:
- Local SEO optimized business update / announcement.
- Highlight location benefits, trust factors, and current offer.
- Action button CTA (Call Now, Visit Us, Book Online).
- No hashtags needed.`;
        break;
      case 'Pinterest':
        platformSpecificGuidance = `
For Pinterest:
- Inspiring, search-friendly Pin Title.
- Rich descriptive text packed with relevant search keywords.
- Compelling visual concept description.
- Actionable click-through CTA.`;
        break;
      case 'X':
        platformSpecificGuidance = `
For X (Twitter):
- Punchy, high-impact hook in under 280 characters or formatted as a crisp 3-part thread.
- Sharp CTA to reply, retweet, or visit link.
- 1 to 2 targeted hashtags maximum.`;
        break;
      default:
        platformSpecificGuidance = 'Create platform-optimized social media content with high engagement.';
    }

    const systemPrompt = `You are SocialBoost AI, a senior social media strategist and copywriting expert for small businesses.
Strict Rules:
1. NEVER invent facts, prices, discounts, fake certifications, fake reviews, or fake customer testimonials that were not provided in the prompt.
2. If price or offer is provided (${price || 'None provided'}, ${offer || 'None provided'}), use only what was stated. If none was provided, do not fabricate numbers.
3. Language: Write the primary content strictly in the requested language: "${language}". (If Hinglish or Gujarati + English, blend naturally as used by modern native speakers).
4. Tone: Adopt the tone "${tone}".
5. Content Length: "${length}".
6. Emoji level: "${emojiLevel}" (None = 0 emojis, Low = 1-2 emojis, Medium = 3-5 emojis, High = expressive with emojis).
7. Hashtag requirement: "${hashtagsOption}".
8. Craft THREE genuinely different variations:
   - "Professional": Authoritative, trustworthy, polished.
   - "Creative": Fresh, engaging, storytelling, playful or unexpected angle.
   - "High Converting": Direct-response, urgency, clear benefit, high FOMO/action-oriented.

You must respond with valid JSON strictly conforming to this structure:
{
  "platform": "${platform}",
  "contentType": "${contentType}",
  "hook": "The main recommended hook",
  "content": "The full structured content body formatted cleanly with line breaks",
  "cta": "The call to action line",
  "hashtags": ["tag1", "tag2", "tag3"],
  "variations": [
    {
      "id": "v1",
      "title": "Professional",
      "hook": "...",
      "content": "Full text for professional variation...",
      "cta": "...",
      "hashtags": ["..."]
    },
    {
      "id": "v2",
      "title": "Creative",
      "hook": "...",
      "content": "Full text for creative variation...",
      "cta": "...",
      "hashtags": ["..."]
    },
    {
      "id": "v3",
      "title": "High Converting",
      "hook": "...",
      "content": "Full text for high-converting variation...",
      "cta": "...",
      "hashtags": ["..."]
    }
  ],
  "notes": "Brief marketing tip for this post"
}`;

    const userPrompt = `Generate ${contentType} for ${platform}.
Business Information:
- Business Name: ${businessName}
- Business Type / Industry: ${businessType || 'General'}
- Product / Service: ${productService}
- Description: ${description || 'N/A'}
- Target Audience: ${targetAudience}
- Location / Market: ${location || 'General'}
- Unique Selling Proposition (USP): ${usp || 'N/A'}
- Special Offer / Promotion: ${offer || 'N/A'}
- Price Point: ${price || 'N/A'}

Campaign Objective: ${campaignGoal}
Platform Specific Guidance:
${platformSpecificGuidance}

Remember to return ONLY a valid JSON object.`;

    const response = await generateWithModelFallback(ai, {
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (parseError) {
      // Clean up backticks if any
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    // Ensure fallback fields exist
    if (!parsedData.hook && parsedData.content) {
      parsedData.hook = parsedData.content.slice(0, 80) + '...';
    }
    if (!parsedData.variations || !Array.isArray(parsedData.variations) || parsedData.variations.length === 0) {
      parsedData.variations = [
        {
          id: 'v1',
          title: 'Professional',
          hook: parsedData.hook || 'Discover excellence with ' + businessName,
          content: parsedData.content || '',
          cta: parsedData.cta || 'Learn more today.',
          hashtags: parsedData.hashtags || [],
        },
      ];
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error generating social content:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate content with Gemini AI.',
    });
  }
});

// Dedicated AI Tools Generation
app.post('/api/ai-tool', async (req, res) => {
  try {
    const { tool, businessName, productService, targetAudience, context, platform, tone, language } = req.body;

    if (!tool || !businessName || !productService) {
      return res.status(400).json({
        error: 'Missing required parameters: tool, businessName, and productService are required.',
      });
    }

    const ai = getGeminiClient();

    let toolPrompt = '';
    let systemInstruction = `You are SocialBoost AI expert tools generator. Language: ${language || 'English'}. Tone: ${tone || 'Persuasive'}. Respond in JSON format.`;

    switch (tool) {
      case 'hook':
        toolPrompt = `Generate exactly 10 high-performing, viral opening hooks for social media posts about ${productService} for the business "${businessName}" targeting ${targetAudience || 'customers'}. Context: ${context || 'General'}.
Return JSON:
{
  "tool": "hook",
  "title": "10 Viral Hooks",
  "items": ["Hook 1...", "Hook 2...", "Hook 3...", "Hook 4...", "Hook 5...", "Hook 6...", "Hook 7...", "Hook 8...", "Hook 9...", "Hook 10..."]
}`;
        break;

      case 'cta':
        toolPrompt = `Generate exactly 10 actionable, high-converting Calls to Action (CTAs) for ${productService} by "${businessName}". Target audience: ${targetAudience || 'customers'}.
Return JSON:
{
  "tool": "cta",
  "title": "10 Actionable CTAs",
  "items": ["CTA 1...", "CTA 2...", "CTA 3...", "CTA 4...", "CTA 5...", "CTA 6...", "CTA 7...", "CTA 8...", "CTA 9...", "CTA 10..."]
}`;
        break;

      case 'hashtag':
        toolPrompt = `Generate 25 high-performing, categorized hashtags for ${productService} for "${businessName}" on ${platform || 'Instagram'}.
Divide them into High Reach (General), Niche (Targeted), and Community/Local.
Return JSON:
{
  "tool": "hashtag",
  "title": "AI Optimized Hashtags",
  "items": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8", "#tag9", "#tag10", "#tag11", "#tag12", "#tag13", "#tag14", "#tag15", "#tag16", "#tag17", "#tag18", "#tag19", "#tag20", "#tag21", "#tag22", "#tag23", "#tag24", "#tag25"]
}`;
        break;

      case 'ideas':
        toolPrompt = `Generate exactly 30 unique, engaging content ideas for ${businessName} offering ${productService} to ${targetAudience || 'buyers'}.
Return JSON:
{
  "tool": "ideas",
  "title": "30 Content Ideas",
  "items": [
    "1. [Educational] How to choose the right...",
    "2. [Behind the Scenes] Packing orders...",
    ... 30 total items
  ]
}`;
        break;

      case 'reel':
        toolPrompt = `Generate a complete 30-second short-form Reel / TikTok script for ${businessName} featuring ${productService}.
Include:
- 3s Hook
- Scene 1 (0-7s): Problem / Hook visual & voiceover
- Scene 2 (7-15s): Introduce the product / demonstration
- Scene 3 (15-22s): Social proof or unique benefit
- Scene 4 (22-30s): CTA & closing visual
Return JSON:
{
  "tool": "reel",
  "title": "Short-Form Video Script",
  "items": [
    "HOOK (0-3s): [Visual: Zoom into the product] Voiceover: 'Stop wasting money on...'",
    "SCENE 1 (3-8s): [Visual: Frustrated customer] Voiceover: 'We all know the struggle of...'",
    "SCENE 2 (8-16s): [Visual: Crisp demonstration of ${productService}] Voiceover: 'That is why we created...'",
    "SCENE 3 (16-24s): [Visual: Customer reaction/result] Voiceover: 'Made with premium quality...'",
    "SCENE 4 (24-30s): [Visual: Brand logo & offer] Voiceover: 'Tap the link in bio to grab yours today!'"
  ]
}`;
        break;

      case 'product_desc':
        toolPrompt = `Write 3 high-converting e-commerce product descriptions for ${productService} by "${businessName}". Highlight features, emotional benefits, and technical details.
Return JSON:
{
  "tool": "product_desc",
  "title": "Product Descriptions",
  "items": [
    "Option 1 (Benefit-Driven): ...",
    "Option 2 (Sensory & Emotional): ...",
    "Option 3 (Minimalist & Bulleted): ..."
  ]
}`;
        break;

      case 'ad_copy':
        toolPrompt = `Generate high-converting paid ad copy (Facebook / Instagram Ads) for ${businessName} promoting ${productService} to ${targetAudience || 'potential customers'}.
Provide 3 variations with Headline, Primary Text, and CTA.
Return JSON:
{
  "tool": "ad_copy",
  "title": "High-Converting Ad Copies",
  "items": [
    "Ad 1 (Direct Offer): Headline: ... | Primary Text: ... | CTA: ...",
    "Ad 2 (Problem-Agitation-Solution): Headline: ... | Primary Text: ... | CTA: ...",
    "Ad 3 (Social Proof / Testimonial Style): Headline: ... | Primary Text: ... | CTA: ..."
  ]
}`;
        break;

      case 'bio':
        toolPrompt = `Generate 5 high-converting, optimized social media bios for ${businessName} (${productService}). Include emojis and clear CTA to website/link.
Return JSON:
{
  "tool": "bio",
  "title": "5 Profile Bios",
  "items": [
    "Bio 1: ...",
    "Bio 2: ...",
    "Bio 3: ...",
    "Bio 4: ...",
    "Bio 5: ..."
  ]
}`;
        break;

      case 'rewrite':
        toolPrompt = `Rewrite the following social media content to be more engaging, high-impact, and persuasive for ${platform || 'Instagram'}.
Original Content: "${context}"
Selected Tone: ${tone || 'Engaging'}
Selected Language: ${language || 'English'}
Return JSON:
{
  "tool": "rewrite",
  "title": "Rewritten Variations",
  "items": [
    "Variation 1 (Punchy & Short): ...",
    "Variation 2 (Story-driven): ...",
    "Variation 3 (High-energy & Direct): ..."
  ]
}`;
        break;

      default:
        toolPrompt = `Generate content ideas for ${businessName} offering ${productService}.
Return JSON:
{
  "tool": "${tool}",
  "title": "Generated Results",
  "items": ["Result 1", "Result 2", "Result 3"]
}`;
    }

    const response = await generateWithModelFallback(ai, {
      contents: toolPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error in AI tool generation:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate tool output with Gemini AI.',
    });
  }
});

// Content Calendar Generator
app.post('/api/calendar', async (req, res) => {
  try {
    const { businessName, businessType, productService, targetAudience, durationDays, platform, language } = req.body;

    if (!businessName || !productService) {
      return res.status(400).json({
        error: 'Missing required parameters: businessName and productService are required.',
      });
    }

    const daysCount = Number(durationDays) === 30 ? 30 : Number(durationDays) === 14 ? 14 : 7;
    const ai = getGeminiClient();

    const calendarPrompt = `Generate a structured, strategic ${daysCount}-Day social media content calendar for "${businessName}", a ${businessType || 'business'} offering ${productService} to ${targetAudience || 'customers'}.
Selected Language: ${language || 'English'}.
Primary Platform: ${platform || 'Instagram'}.

For each day (Day 1 to Day ${daysCount}), provide:
- dayNumber (1 to ${daysCount})
- date: formatted as "Day X"
- platform: "${platform || 'Instagram'}"
- contentType: one of "Reel Script", "Carousel", "Post", "Story", "Educational Graphic", "Behind-The-Scenes"
- topic: specific marketing topic or concept
- hook: catchy opening line
- cta: specific action to take

Return ONLY valid JSON matching this schema:
{
  "businessName": "${businessName}",
  "durationDays": ${daysCount},
  "items": [
    {
      "dayNumber": 1,
      "date": "Day 1",
      "platform": "Instagram",
      "contentType": "Post",
      "topic": "...",
      "hook": "...",
      "cta": "..."
    }
  ]
}`;

    const response = await generateWithModelFallback(ai, {
      contents: calendarPrompt,
      config: {
        systemInstruction: 'You are an expert social media content planner. Return only valid JSON for the calendar.',
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    });

    const text = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    if (!parsedData.items || !Array.isArray(parsedData.items)) {
      parsedData.items = [];
    }

    // Assign IDs if missing
    parsedData.id = `cal_${Date.now()}`;
    parsedData.createdAt = Date.now();
    parsedData.items = parsedData.items.map((item: any, idx: number) => ({
      ...item,
      id: item.id || `cal_item_${idx + 1}`,
      dayNumber: item.dayNumber || idx + 1,
    }));

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error generating content calendar:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate content calendar with Gemini AI.',
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SocialBoost AI server running on port ${PORT}`);
  });
}

startServer();
