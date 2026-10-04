import { classNames } from '../utils/helpers.js';

// Compact segmented control used by the filter toolbar.
export default function Segmented({ label, options, value, onChange }) {
  return (
    <div>
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
      <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap rounded-xl bg-slate-100 p-1 dark:bg-white/5">
        {options.map(([val, text]) => (
          <button
            key={val}
            role="radio"
            aria-checked={value === val}
            onClick={() => onChange(val)}
            className={classNames(
              'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200',
              value === val
                ? 'bg-white text-brand-700 shadow dark:bg-brand-500/30 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white',
            )}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
