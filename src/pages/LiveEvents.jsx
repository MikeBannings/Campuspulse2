import { useMemo, useState } from 'react';
import { RotateCcw, Search, SearchX, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { CATEGORIES } from '../data/mockData.js';
import EventCard from '../components/EventCard.jsx';
import CategoryIcon, { CATEGORY_STYLES } from '../components/CategoryIcon.jsx';
import Segmented from '../components/Segmented.jsx';
import {
  classNames,
  eventStatus,
  matchesDateFilter,
  matchesPriceFilter,
  matchesTimeFilter,
  tagLabel,
} from '../utils/helpers.js';

const DATE_OPTIONS = [
  ['all', 'Any date'],
  ['today', 'Today'],
  ['week', 'This week'],
  ['weekend', 'Weekend'],
];
const TIME_OPTIONS = [
  ['all', 'Any length'],
  ['short', '< 1 hr'],
  ['medium', '1–3 hrs'],
  ['long', 'Half-day+'],
];
const PRICE_OPTIONS = [
  ['all', 'All'],
  ['free', 'Free'],
  ['paid', 'Paid'],
];

const DEFAULTS = { query: '', category: 'all', date: 'all', time: 'all', price: 'all', sort: 'soonest', tab: 'all' };

export default function LiveEvents() {
  const { events } = useApp();
  const [f, setF] = useState(DEFAULTS);
  const set = (patch) => setF((prev) => ({ ...prev, ...patch }));
  const dirty = JSON.stringify({ ...f, tab: 'all' }) !== JSON.stringify({ ...DEFAULTS, tab: 'all' });

  const active = useMemo(() => events.filter((e) => eventStatus(e) !== 'ended'), [events]);

  // Everything except the feed tab, so tab counts reflect the other filters.
  const filtered = useMemo(() => {
    const q = f.query.trim().toLowerCase();
    return active.filter((e) => {
      if (f.category !== 'all' && e.category !== f.category) return false;
      if (!matchesDateFilter(e, f.date)) return false;
      if (!matchesTimeFilter(e, f.time)) return false;
      if (!matchesPriceFilter(e, f.price)) return false;
      if (q) {
        const haystack = [e.title, e.description, e.organizer, e.location, ...e.tags.map(tagLabel)]
          .join(' ')
          .toLowerCase();
        if (!q.split(/\s+/).every((word) => haystack.includes(word))) return false;
      }
      return true;
    });
  }, [active, f.query, f.category, f.date, f.time, f.price]);

  const counts = useMemo(
    () => ({
      all: filtered.length,
      live: filtered.filter((e) => eventStatus(e) === 'live').length,
      upcoming: filtered.filter((e) => eventStatus(e) === 'upcoming').length,
      featured: filtered.filter((e) => e.featured).length,
    }),
    [filtered],
  );

  const visible = useMemo(() => {
    let list = filtered.filter((e) => {
      if (f.tab === 'live') return eventStatus(e) === 'live';
      if (f.tab === 'upcoming') return eventStatus(e) === 'upcoming';
      if (f.tab === 'featured') return e.featured;
      return true;
    });
    list = [...list];
    if (f.sort === 'soonest') list.sort((a, b) => a.start - b.start);
    if (f.sort === 'seats') list.sort((a, b) => b.seatsLeft - a.seatsLeft);
    if (f.sort === 'filling') list.sort((a, b) => a.seatsLeft / a.seats - b.seatsLeft / b.seats);
    return list;
  }, [filtered, f.tab, f.sort]);

  const liveNow = active.filter((e) => eventStatus(e) === 'live').length;
  const thisWeek = active.filter((e) => matchesDateFilter(e, 'week')).length;
  const openSeats = active.reduce((sum, e) => sum + e.seatsLeft, 0);

  const TABS = [
    ['all', 'All'],
    ['live', 'Live now'],
    ['upcoming', 'Upcoming'],
    ['featured', 'Featured'],
  ];

  return (
    <>
      {/* ------------------------------------------------------------ Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 animate-float rounded-full bg-brand-500/20 blur-3xl" />
        <div
          className="pointer-events-none absolute -right-16 top-24 h-56 w-56 animate-float rounded-full bg-pulse-500/20 blur-3xl"
          style={{ animationDelay: '2s' }}
        />

        <div className="relative mx-auto max-w-5xl px-4 pb-10 pt-14 text-center sm:px-6 sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-4 py-1.5 text-xs font-bold text-brand-700 backdrop-blur dark:border-brand-400/30 dark:bg-white/5 dark:text-brand-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pulse-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-pulse-500" />
            </span>
            {liveNow > 0 ? `${liveNow} event${liveNow > 1 ? 's' : ''} happening right now` : 'Fresh events, updated live'}
          </span>

          <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-6xl dark:text-white">
            Never miss what&apos;s <span className="text-gradient">happening on campus</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-300">
            Every event, club and workshop in one place — and a buddy to go with, so you never have to walk in alone.
          </p>

          {/* Search */}
          <div className="glass mx-auto mt-8 flex max-w-2xl items-center gap-3 rounded-2xl p-2 pl-5 focus-within:shadow-glow">
            <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
            <input
              value={f.query}
              onChange={(e) => set({ query: e.target.value })}
              placeholder="Search events, clubs or topics — try “hackathon” or “yoga”"
              aria-label="Search events"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
            />
            {f.query && (
              <button onClick={() => set({ query: '' })} className="btn-ghost !px-3 !py-2 text-xs">
                Clear
              </button>
            )}
          </div>

          {/* Quick category filters */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => set({ category: 'all' })}
              className={classNames(
                'chip',
                f.category === 'all'
                  ? 'border-transparent bg-slate-900 text-white shadow-lg dark:bg-white dark:text-slate-900'
                  : 'border-slate-200 bg-white/70 text-slate-600 hover:border-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-300',
              )}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => set({ category: f.category === c.id ? 'all' : c.id })}
                className={classNames(
                  'chip hover:-translate-y-0.5',
                  f.category === c.id ? CATEGORY_STYLES[c.id].active : CATEGORY_STYLES[c.id].chip,
                )}
                aria-pressed={f.category === c.id}
              >
                <CategoryIcon name={c.icon} className="h-3.5 w-3.5" />
                {c.label}
              </button>
            ))}
          </div>

          {/* Stats */}
          <dl className="mx-auto mt-10 grid max-w-xl grid-cols-3 gap-3">
            {[
              ['Live now', liveNow],
              ['This week', thisWeek],
              ['Open seats', openSeats],
            ].map(([label, value]) => (
              <div key={label} className="glass rounded-2xl px-3 py-3">
                <dd className="font-display text-2xl font-bold text-slate-900 dark:text-white">{value}</dd>
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------- Feed area */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6" aria-labelledby="feed-title">
        {/* Filter & sort toolbar */}
        <div className="glass rounded-3xl p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
            <SlidersHorizontal className="h-4 w-4 text-brand-500" /> Filter &amp; sort
            {dirty && (
              <button
                onClick={() => setF({ ...DEFAULTS, tab: f.tab })}
                className="ml-auto flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset all
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
            <Segmented label="Date" options={DATE_OPTIONS} value={f.date} onChange={(date) => set({ date })} />
            <Segmented label="Time commitment" options={TIME_OPTIONS} value={f.time} onChange={(time) => set({ time })} />
            <Segmented label="Price" options={PRICE_OPTIONS} value={f.price} onChange={(price) => set({ price })} />
            <label className="ml-auto">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-400">Sort by</span>
              <select value={f.sort} onChange={(e) => set({ sort: e.target.value })} className="input !w-auto !py-2 text-xs font-semibold">
                <option value="soonest">Starting soonest</option>
                <option value="seats">Most seats left</option>
                <option value="filling">Filling up fastest</option>
              </select>
            </label>
          </div>
        </div>

        {/* Feed header + tabs */}
        <div className="mb-6 mt-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="feed-title" className="section-title flex items-center gap-3">
              What&apos;s Happening
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pulse-500 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-pulse-500" />
              </span>
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {visible.length} event{visible.length === 1 ? '' : 's'} match your filters
            </p>
          </div>
          <div role="tablist" aria-label="Feed view" className="flex rounded-xl bg-slate-100 p-1 dark:bg-white/5">
            {TABS.map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={f.tab === id}
                onClick={() => set({ tab: id })}
                className={classNames(
                  'flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all',
                  f.tab === id
                    ? 'bg-white text-brand-700 shadow dark:bg-brand-500/30 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white',
                )}
              >
                {label}
                <span className="rounded-full bg-slate-200 px-1.5 text-[10px] dark:bg-white/10">{counts[id]}</span>
              </button>
            ))}
          </div>
        </div>

        {visible.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        ) : (
          <div className="glass flex flex-col items-center rounded-3xl px-6 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
              <SearchX className="h-8 w-8" />
            </span>
            <h3 className="mt-5 font-display text-xl font-bold text-slate-900 dark:text-white">No events match yet</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              Try a different keyword or loosen a filter — new events get posted every day.
            </p>
            <button onClick={() => setF(DEFAULTS)} className="btn-primary mt-6">
              <RotateCcw className="h-4 w-4" /> Reset filters
            </button>
          </div>
        )}
      </section>
    </>
  );
}
