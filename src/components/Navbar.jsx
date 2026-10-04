import { useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Activity, Compass, Flame, Menu, Moon, Sun, Ticket, UserPlus, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import NotificationBell from './NotificationBell.jsx';
import { useClickOutside } from '../utils/hooks.js';
import { classNames } from '../utils/helpers.js';

const LINKS = [
  { to: '/', label: 'Live Events', icon: Flame, end: true },
  { to: '/discovery', label: 'Smart Discovery', icon: Compass },
  { to: '/plus-one', label: 'Find Plus-One', icon: UserPlus },
  { to: '/rsvps', label: 'My RSVPs', icon: Ticket, badge: true },
];

function ProfileMenu() {
  const { user, interests, rsvps, followedClubs } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Profile menu"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-pulse-500 text-sm font-bold text-white shadow-lg ring-2 ring-white/70 transition hover:scale-105 dark:ring-white/10"
      >
        {user.initials}
      </button>
      {open && (
        <div className="glass absolute right-0 mt-3 w-64 animate-pop-in rounded-2xl p-4 !bg-white/95 dark:!bg-slate-900/95">
          <p className="font-display font-bold text-slate-900 dark:text-white">{user.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {user.handle} · {user.year}, {user.branch}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              ['Interests', interests.length],
              ['RSVPs', rsvps.length],
              ['Clubs', followedClubs.length],
            ].map(([label, n]) => (
              <div key={label} className="rounded-xl bg-slate-100 py-2 dark:bg-white/5">
                <div className="font-display text-lg font-bold text-slate-900 dark:text-white">{n}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { theme, toggleTheme, rsvps } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    classNames(
      'relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200',
      isActive
        ? 'bg-brand-500/10 text-brand-700 dark:bg-brand-400/15 dark:text-brand-200'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white',
    );

  return (
    <header className="glass sticky top-0 z-50 !rounded-none border-x-0 border-t-0">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="CampusPulse home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-pulse-500 text-white shadow-lg shadow-brand-500/30">
            <Activity className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Campus<span className="text-gradient">Pulse</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {LINKS.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon className="h-4 w-4" />
              {label}
              {badge && rsvps.length > 0 && (
                <span className="rounded-full bg-pulse-500 px-1.5 text-[10px] font-bold text-white">{rsvps.length}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <NotificationBell />
          <ProfileMenu />
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            className="rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-white/10"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="animate-fade-up border-t border-slate-200/70 px-4 py-3 lg:hidden dark:border-white/10" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {LINKS.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={linkClass} onClick={() => setMobileOpen(false)}>
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
