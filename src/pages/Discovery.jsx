import { useMemo, useState } from 'react';
import { Check, Compass, Sparkles, Wand2, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { CATEGORIES, INTEREST_TAGS } from '../data/mockData.js';
import EventCard from '../components/EventCard.jsx';
import ClubCard from '../components/ClubCard.jsx';
import CategoryIcon, { CATEGORY_STYLES } from '../components/CategoryIcon.jsx';
import { classNames, eventStatus, matchScore, tagLabel } from '../utils/helpers.js';

export default function Discovery() {
  const { events, clubs, interests, toggleInterest, setInterests } = useApp();
  const [showAll, setShowAll] = useState(false);

  const recommended = useMemo(
    () =>
      events
        .filter((e) => eventStatus(e) !== 'ended')
        .map((event) => ({
          event,
          score: matchScore(interests, event),
          shared: event.tags.filter((t) => interests.includes(t)),
        }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score || a.event.start - b.event.start),
    [events, interests],
  );

  const rankedClubs = useMemo(
    () =>
      clubs
        .map((club) => ({ club, score: matchScore(interests, club) }))
        .sort((a, b) => b.score - a.score),
    [clubs, interests],
  );

  const shown = showAll ? recommended : recommended.slice(0, 3);
  const meterPct = Math.min(100, Math.round((interests.length / 5) * 100));

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6">
      {/* Header */}
      <header className="max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3.5 py-1.5 text-xs font-bold text-brand-700 dark:text-brand-200">
          <Compass className="h-3.5 w-3.5" /> Smart Discovery
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
          Your campus, <span className="text-gradient">tuned to you</span>
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Pick what you&apos;re into and we&apos;ll surface the events and clubs that fit — no more scrolling through
          things you&apos;d never attend.
        </p>
      </header>

      {/* Preference selector */}
      <section className="glass mt-8 rounded-3xl p-5 sm:p-7" aria-labelledby="prefs-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="prefs-title" className="flex items-center gap-2 font-display text-xl font-bold text-slate-900 dark:text-white">
              <Wand2 className="h-5 w-5 text-brand-500" /> What are you into?
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tap to select — your picks are saved automatically.</p>
          </div>
          <div className="w-full sm:w-64">
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-300">{interests.length} selected</span>
              <span className={interests.length >= 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                {interests.length >= 3 ? 'Feed tuned ✓' : 'Pick 3+ for best results'}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-pulse-500 transition-all duration-500"
                style={{ width: `${meterPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {CATEGORIES.map((cat) => {
            const tags = INTEREST_TAGS.filter((t) => t.category === cat.id);
            if (tags.length === 0) return null;
            return (
              <div key={cat.id}>
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  <CategoryIcon name={cat.icon} className="h-3.5 w-3.5" /> {cat.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const on = interests.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleInterest(tag.id)}
                        aria-pressed={on}
                        className={classNames(
                          'chip hover:-translate-y-0.5',
                          on
                            ? CATEGORY_STYLES[tag.category].active
                            : 'border-slate-200 bg-white/60 text-slate-600 hover:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300',
                        )}
                      >
                        {on && <Check className="h-3.5 w-3.5" />}
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {interests.length > 0 && (
          <button
            onClick={() => setInterests([])}
            className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-pulse-600 dark:text-slate-400"
          >
            <X className="h-3.5 w-3.5" /> Clear all
          </button>
        )}
      </section>

      {/* Recommended events */}
      <section className="mt-14" aria-labelledby="rec-title">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="rec-title" className="section-title flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-pulse-500" /> Recommended for You
            </h2>
            {interests.length > 0 && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Based on {interests.slice(0, 4).map(tagLabel).join(', ')}
                {interests.length > 4 ? ` +${interests.length - 4} more` : ''}
              </p>
            )}
          </div>
          {recommended.length > 3 && (
            <button onClick={() => setShowAll((s) => !s)} className="btn-ghost">
              {showAll ? 'Show top 3' : `See all ${recommended.length} matches`}
            </button>
          )}
        </div>

        {shown.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map(({ event, score, shared }, i) => (
              <EventCard key={event.id} event={event} match={score} sharedTags={shared} index={i} />
            ))}
          </div>
        ) : (
          <div className="glass rounded-3xl px-6 py-14 text-center">
            <p className="font-display text-lg font-bold text-slate-900 dark:text-white">Nothing to recommend yet</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Select a few interests above and your matches will appear here instantly.
            </p>
          </div>
        )}
      </section>

      {/* Club showcase */}
      <section className="mt-16" aria-labelledby="club-title">
        <div className="mb-6">
          <h2 id="club-title" className="section-title">
            Club Showcase
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Find your people. Follow a club with one click to get their updates and application reminders.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {rankedClubs.map(({ club, score }, i) => (
            <ClubCard key={club.id} club={club} match={score} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
