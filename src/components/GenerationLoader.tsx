import { useEffect, useState } from 'react';
import { Loader2, Sparkles, Brain, Wand2, Check } from 'lucide-react';

interface GenerationLoaderProps {
  platform?: string;
  contentType?: string;
}

const STEPS = [
  { icon: Brain, label: 'Analyzing business information & target audience...' },
  { icon: Wand2, label: 'Optimizing hooks and platform engagement dynamics...' },
  { icon: Sparkles, label: 'Generating 3 distinct variations (Professional, Creative, High-Converting)...' },
  { icon: Check, label: 'Finalizing formatting, hashtags, and CTAs...' },
];

export function GenerationLoader({ platform = 'Social Media', contentType = 'Content' }: GenerationLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="generation-loader"
      className="p-8 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-b from-indigo-50/40 via-white to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 shadow-xl text-center"
    >
      <div className="inline-flex items-center justify-center p-3.5 mb-4 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
        Generating your {platform} {contentType}...
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
        Gemini AI is crafting tailored copy with hooks, platform structure, and conversion-focused CTAs.
      </p>

      {/* Steps checklist */}
      <div className="mt-6 max-w-md mx-auto space-y-2.5 text-left">
        {STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-2.5 rounded-xl text-xs font-medium transition-all ${
                isCurrent
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200 border border-indigo-200/60 dark:border-indigo-800/60'
                  : isDone
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-600 opacity-60'
              }`}
            >
              <div
                className={`p-1 rounded-md ${
                  isDone
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                    : isCurrent
                    ? 'bg-indigo-600 text-white animate-spin'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
              </div>
              <span className="flex-1">{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Skeleton placeholders */}
      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3 mx-auto animate-pulse" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4 mx-auto animate-pulse" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3 mx-auto animate-pulse" />
      </div>
    </div>
  );
}
