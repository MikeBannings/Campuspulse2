import { useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useClickOutside } from '../utils/hooks.js';

export default function NotificationBell() {
  const { notifications, markAllRead } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 animate-pulse-ring items-center justify-center rounded-full bg-pulse-500 px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="glass absolute right-0 mt-3 w-80 max-w-[85vw] animate-pop-in rounded-2xl p-2 !bg-white/95 dark:!bg-slate-900/95">
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          </div>
          <ul className="max-h-80 space-y-1 overflow-y-auto">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`rounded-xl px-3 py-2.5 text-sm ${
                  n.unread ? 'bg-brand-50 dark:bg-brand-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">{n.title}</span>
                  <span className="shrink-0 text-[11px] text-slate-400">{n.time}</span>
                </div>
                <p className="mt-0.5 text-slate-600 dark:text-slate-400">{n.body}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
