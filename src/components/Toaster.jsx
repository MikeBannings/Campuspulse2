import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const TONES = {
  success: { icon: CheckCircle2, cls: 'text-emerald-500' },
  info: { icon: Info, cls: 'text-sky-500' },
  error: { icon: AlertCircle, cls: 'text-rose-500' },
};

export default function Toaster() {
  const { toasts } = useApp();
  return (
    <div
      className="pointer-events-none fixed bottom-4 left-4 right-24 z-[80] flex flex-col gap-2 sm:right-auto sm:w-96"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const { icon: Icon, cls } = TONES[t.tone] ?? TONES.success;
        return (
          <div
            key={t.id}
            className="glass pointer-events-auto flex animate-fade-up items-start gap-3 rounded-2xl px-4 py-3 text-sm font-medium !bg-white/90 dark:!bg-slate-900/90"
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cls}`} />
            <span className="text-slate-800 dark:text-slate-100">{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
