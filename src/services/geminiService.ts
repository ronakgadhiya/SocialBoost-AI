import {
  GenerationRequest,
  GenerationResponse,
  AIToolType,
  AIToolResult,
  CalendarPlan,
} from '../types';
import { getUsage, incrementUsage } from '../utils/storage';

export class GeminiServiceError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'GeminiServiceError';
    this.code = code;
  }
}

export async function checkServerHealth(): Promise<{ status: string; hasApiKey: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch {
    return { status: 'offline', hasApiKey: false };
  }
}

export async function generateSocialContent(request: GenerationRequest): Promise<GenerationResponse> {
  // Check usage limit
  const currentUsage = getUsage();
  if (currentUsage.count >= currentUsage.maxFree) {
    throw new GeminiServiceError(
      'You have reached your free generation limit of 5 generations this month. Upgrade to Pro for 100 generations.',
      'QUOTA_EXCEEDED'
    );
  }

  let response: Response;
  try {
    response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  } catch (netErr: any) {
    throw new GeminiServiceError(
      'Network error: Unable to connect to the SocialBoost AI server. Please verify your connection.',
      'NETWORK_ERROR'
    );
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ error: 'Generation failed' }));
    throw new GeminiServiceError(
      errData.error || `Server responded with status ${response.status}`,
      'API_ERROR'
    );
  }

  const result: GenerationResponse = await response.json();

  // Validate response shape
  if (!result || typeof result !== 'object') {
    throw new GeminiServiceError('Invalid response format received from AI.', 'INVALID_FORMAT');
  }

  // Increment usage count upon successful generation
  incrementUsage();

  return result;
}

export async function generateAIToolOutput(params: {
  tool: AIToolType;
  businessName: string;
  productService: string;
  targetAudience?: string;
  context?: string;
  platform?: string;
  tone?: string;
  language?: string;
}): Promise<AIToolResult> {
  // Check usage limit
  const currentUsage = getUsage();
  if (currentUsage.count >= currentUsage.maxFree) {
    throw new GeminiServiceError(
      'You have reached your free generation limit of 5 generations this month. Upgrade to Pro to unlock unlimited AI tools.',
      'QUOTA_EXCEEDED'
    );
  }

  let response: Response;
  try {
    response = await fetch('/api/ai-tool', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
  } catch (err: any) {
    throw new GeminiServiceError(
      'Network error while generating AI tool output. Please try again.',
      'NETWORK_ERROR'
    );
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ error: 'Tool generation failed' }));
    throw new GeminiServiceError(
      errData.error || `Failed to generate ${params.tool} output.`,
      'API_ERROR'
    );
  }

  const result: AIToolResult = await response.json();
  incrementUsage();
  return result;
}

export async function generateContentCalendarPlan(params: {
  businessName: string;
  businessType?: string;
  productService: string;
  targetAudience?: string;
  durationDays: 7 | 14 | 30;
  platform?: string;
  language?: string;
}): Promise<CalendarPlan> {
  const currentUsage = getUsage();
  if (currentUsage.count >= currentUsage.maxFree) {
    throw new GeminiServiceError(
      'You have reached your free generation limit. Upgrade to Pro for full calendar generation.',
      'QUOTA_EXCEEDED'
    );
  }

  let response: Response;
  try {
    response = await fetch('/api/calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
  } catch (err: any) {
    throw new GeminiServiceError(
      'Network error while generating content calendar. Please try again.',
      'NETWORK_ERROR'
    );
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ error: 'Calendar generation failed' }));
    throw new GeminiServiceError(
      errData.error || 'Failed to generate content calendar.',
      'API_ERROR'
    );
  }

  const result: CalendarPlan = await response.json();
  incrementUsage();
  return result;
}
