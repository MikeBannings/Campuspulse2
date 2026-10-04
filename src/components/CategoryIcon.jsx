import { Code2, Mic, Music, Sparkles, Trophy, Wrench } from 'lucide-react';

const ICONS = { Code2, Trophy, Music, Wrench, Mic };

// Full class strings so Tailwind's JIT can see them.
export const CATEGORY_STYLES = {
  tech: {
    chip: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/30 dark:bg-violet-500/10 dark:text-violet-300',
    active: 'border-transparent bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30',
  },
  sports: {
    chip: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    active: 'border-transparent bg-gradient-to-r from-emerald-600 to-lime-500 text-white shadow-lg shadow-emerald-500/30',
  },
  cultural: {
    chip: 'border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-400/30 dark:bg-pink-500/10 dark:text-pink-300',
    active: 'border-transparent bg-gradient-to-r from-pink-600 to-orange-400 text-white shadow-lg shadow-pink-500/30',
  },
  workshop: {
    chip: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300',
    active: 'border-transparent bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30',
  },
  seminar: {
    chip: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-300',
    active: 'border-transparent bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-500/30',
  },
};

export default function CategoryIcon({ name, className = 'h-4 w-4' }) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}
