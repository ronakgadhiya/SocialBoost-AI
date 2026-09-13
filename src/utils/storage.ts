import {
  BusinessProfile,
  GenerationHistoryItem,
  CalendarPlan,
  UsageData,
} from '../types';

const STORAGE_KEYS = {
  BRAND_PROFILE: 'sb_brand_profile',
  GENERATIONS: 'sb_generations',
  CALENDAR: 'sb_calendar',
  USAGE: 'sb_usage',
  THEME: 'sb_theme',
  USER_SETTINGS: 'sb_settings',
} as const;

const MAX_HISTORY_ITEMS = 20;
const MAX_FREE_GENERATIONS = 5;

// Helper to safely parse JSON or return fallback
function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[Storage] Failed to parse key "${key}". Clearing corrupted key.`, error);
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    return fallback;
  }
}

// Helper to safely write to localStorage
function safeSet<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[Storage] Failed to save key "${key}".`, error);
    return false;
  }
}

// Brand Profile
export function saveBrandProfile(profile: BusinessProfile): boolean {
  return safeSet(STORAGE_KEYS.BRAND_PROFILE, profile);
}

export function getBrandProfile(): BusinessProfile | null {
  return safeParse<BusinessProfile | null>(STORAGE_KEYS.BRAND_PROFILE, null);
}

export function clearBrandProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.BRAND_PROFILE);
  } catch (e) {
    console.error(e);
  }
}

// Generation History (Max 20 items, newest first)
export function getGenerations(): GenerationHistoryItem[] {
  const items = safeParse<GenerationHistoryItem[]>(STORAGE_KEYS.GENERATIONS, []);
  if (!Array.isArray(items)) return [];
  return items.sort((a, b) => b.createdAt - a.createdAt);
}

export function saveGeneration(item: Omit<GenerationHistoryItem, 'id' | 'createdAt'> & { id?: string; createdAt?: number }): GenerationHistoryItem {
  const existing = getGenerations();
  const newItem: GenerationHistoryItem = {
    ...item,
    id: item.id || `gen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: item.createdAt || Date.now(),
  };

  // Add to front, keep max 20
  const updated = [newItem, ...existing.filter((i) => i.id !== newItem.id)].slice(0, MAX_HISTORY_ITEMS);
  safeSet(STORAGE_KEYS.GENERATIONS, updated);
  return newItem;
}

export function updateGeneration(updatedItem: GenerationHistoryItem): boolean {
  const existing = getGenerations();
  const index = existing.findIndex((i) => i.id === updatedItem.id);
  if (index === -1) return false;
  existing[index] = updatedItem;
  return safeSet(STORAGE_KEYS.GENERATIONS, existing);
}

export function deleteGeneration(id: string): boolean {
  const existing = getGenerations();
  const filtered = existing.filter((item) => item.id !== id);
  return safeSet(STORAGE_KEYS.GENERATIONS, filtered);
}

export function clearAllGenerations(): boolean {
  return safeSet(STORAGE_KEYS.GENERATIONS, []);
}

// Content Calendar
export function getCalendar(): CalendarPlan | null {
  return safeParse<CalendarPlan | null>(STORAGE_KEYS.CALENDAR, null);
}

export function saveCalendar(plan: CalendarPlan): boolean {
  return safeSet(STORAGE_KEYS.CALENDAR, plan);
}

export function deleteCalendar(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CALENDAR);
  } catch (e) {
    console.error(e);
  }
}

// Usage Limits (5 generations per month for free tier)
export function getUsage(): UsageData {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const defaultUsage: UsageData = {
    count: 0,
    maxFree: MAX_FREE_GENERATIONS,
    lastResetMonth: currentMonth,
  };

  const usage = safeParse<UsageData>(STORAGE_KEYS.USAGE, defaultUsage);

  // Reset if month changed
  if (usage.lastResetMonth !== currentMonth) {
    const resetUsage: UsageData = {
      count: 0,
      maxFree: MAX_FREE_GENERATIONS,
      lastResetMonth: currentMonth,
    };
    safeSet(STORAGE_KEYS.USAGE, resetUsage);
    return resetUsage;
  }

  return usage;
}

export function incrementUsage(): { success: boolean; usage: UsageData } {
  const usage = getUsage();
  if (usage.count >= usage.maxFree) {
    return { success: false, usage };
  }
  const updated: UsageData = {
    ...usage,
    count: usage.count + 1,
  };
  safeSet(STORAGE_KEYS.USAGE, updated);
  return { success: true, usage: updated };
}

export function resetUsageForTesting(): UsageData {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const reset: UsageData = {
    count: 0,
    maxFree: MAX_FREE_GENERATIONS,
    lastResetMonth: currentMonth,
  };
  safeSet(STORAGE_KEYS.USAGE, reset);
  return reset;
}

// Theme
export type ThemeMode = 'light' | 'dark';

export function getTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch {
    // ignore
  }
}

// Aliases for convenience across components
export const addHistoryItem = saveGeneration;
export const getHistory = getGenerations;
export const deleteHistoryItem = deleteGeneration;
export const clearHistory = clearAllGenerations;
export const getCalendarPlan = getCalendar;
export const saveCalendarPlan = saveCalendar;
export const clearCalendarPlan = deleteCalendar;
export const resetUsage = resetUsageForTesting;

export function clearAllSocialBoostData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (e) {
    console.error('[Storage] Error clearing all data', e);
  }
}
