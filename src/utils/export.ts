import { GenerationResponse, CalendarPlan } from '../types';

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for non-secure context or older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

export function downloadAsTxt(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadAsJson(filename: string, data: unknown): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatResultForTxt(result: GenerationResponse, businessName?: string): string {
  const lines: string[] = [];
  lines.push(`=======================================================`);
  lines.push(`SOCIALBOOST AI GENERATION`);
  if (businessName) lines.push(`BUSINESS: ${businessName}`);
  lines.push(`PLATFORM: ${result.platform.toUpperCase()}`);
  lines.push(`CONTENT TYPE: ${result.contentType.toUpperCase()}`);
  lines.push(`DATE: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`);
  lines.push(`=======================================================\n`);

  lines.push(`--- HOOK ---`);
  lines.push(result.hook);
  lines.push('');

  lines.push(`--- MAIN CONTENT ---`);
  lines.push(result.content);
  lines.push('');

  if (result.cta) {
    lines.push(`--- CALL TO ACTION ---`);
    lines.push(result.cta);
    lines.push('');
  }

  if (result.hashtags && result.hashtags.length > 0) {
    lines.push(`--- HASHTAGS ---`);
    lines.push(result.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' '));
    lines.push('');
  }

  if (result.variations && result.variations.length > 0) {
    lines.push(`\n================== VARIATIONS ==================`);
    result.variations.forEach((v, index) => {
      lines.push(`\n[Variation ${index + 1}: ${v.title}]`);
      if (v.hook) lines.push(`Hook: ${v.hook}`);
      lines.push(`Content:\n${v.content}`);
      if (v.cta) lines.push(`CTA: ${v.cta}`);
      if (v.hashtags && v.hashtags.length > 0) {
        lines.push(`Hashtags: ${v.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')}`);
      }
    });
  }

  return lines.join('\n');
}

export function formatCalendarForTxt(calendar: CalendarPlan): string {
  const lines: string[] = [];
  lines.push(`=======================================================`);
  lines.push(`CONTENT CALENDAR (${calendar.durationDays} DAYS)`);
  lines.push(`BUSINESS: ${calendar.businessName}`);
  lines.push(`GENERATED: ${new Date(calendar.createdAt).toLocaleDateString()}`);
  lines.push(`=======================================================\n`);

  calendar.items.forEach((item) => {
    lines.push(`DAY ${item.dayNumber} | ${item.date} | [${item.platform}] - ${item.contentType}`);
    lines.push(`Topic: ${item.topic}`);
    lines.push(`Hook: ${item.hook}`);
    lines.push(`CTA: ${item.cta}`);
    lines.push('-------------------------------------------------------');
  });

  return lines.join('\n');
}

export function triggerPrint(): void {
  window.print();
}
