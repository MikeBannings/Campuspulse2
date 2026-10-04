import { Sparkles } from 'lucide-react';

// Percentage "match for your interests" pill.
export default function MatchBadge({ score, label = 'Match', className = '' }) {
  if (!score) return null;
  const tone =
    score >= 80
      ? 'from-emerald-500 to-teal-500'
      : score >= 50
        ? 'from-brand-500 to-pulse-500'
        : 'from-slate-500 to-slate-400';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${tone} px-2.5 py-1 text-[11px] font-bold text-white shadow-md ${className}`}
      title="How closely this matches your selected interests"
    >
      <Sparkles className="h-3 w-3" aria-hidden="true" />
      {score}% {label}
    </span>
  );
}
