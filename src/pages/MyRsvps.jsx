import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Ticket, UserPlus, Users, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { formatDuration, formatTime, tagLabel } from '../utils/helpers.js';

export default function MyRsvps() {
  const { events, rsvps, toggleRsvp, clubs, followedClubs, toggleFollowClub, buddies, connections } = useApp();
  const navigate = useNavigate();

  const going = useMemo(
    () => events.filter((e) => rsvps.includes(e.id)).sort((a, b) => a.start - b.start),
    [events, rsvps],
  );
  const myClubs = clubs.filter((c) => followedClubs.includes(c.id));
  const myBuddies = buddies.filter((b) => connections.includes(b.id));
  const hours = going.reduce((sum, e) => sum + e.durationHrs, 0);

  const stats = [
    ['Events joined', going.length],
    ['Hours committed', Math.round(hours * 10) / 10],
    ['Clubs followed', myClubs.length],
    ['Buddy requests', myBuddies.length],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6">
      <header className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <Ticket className="h-3.5 w-3.5" /> My RSVPs
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
          Your campus <span className="text-gradient">calendar</span>
        </h1>
      </header>

      <dl className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="glass rounded-2xl p-5">
            <dd className="font-display text-3xl font-bold text-slate-900 dark:text-white">{value}</dd>
            <dt className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2" aria-labelledby="going-title">
          <h2 id="going-title" className="section-title mb-5 !text-2xl">
            Events you&apos;re going to
          </h2>

          {going.length > 0 ? (
            <ul className="space-y-4">
              {going.map((e) => (
                <li key={e.id} className="glass animate-fade-up flex flex-col gap-4 rounded-3xl p-4 sm:flex-row sm:items-center">
                  <div
                    className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${e.gradient} text-white shadow-lg`}
                  >
                    <span className="font-display text-2xl font-bold leading-none">{e.start.getDate()}</span>
                    <span className="mt-1 text-[11px] font-semibold uppercase tracking-wide">
                      {e.start.toLocaleDateString('en-IN', { month: 'short' })}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-bold text-slate-900 dark:text-white">{e.title}</h3>
                    <p className="text-xs font-semibold text-brand-600 dark:text-brand-300">by {e.organizer}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-brand-500" />
                        {formatTime(e.start)} · {formatDuration(e.durationHrs)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-brand-500" />
                        {e.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/plus-one?event=${e.id}`)} className="btn-ghost !px-3 !py-2 text-xs">
                      <UserPlus className="h-4 w-4" /> Plus-One
                    </button>
                    <button
                      onClick={() => toggleRsvp(e.id)}
                      className="btn-ghost !px-3 !py-2 text-xs hover:!border-pulse-400 hover:!text-pulse-600"
                      aria-label={`Cancel RSVP for ${e.title}`}
                    >
                      <X className="h-4 w-4" /> Cancel
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="glass rounded-3xl px-6 py-16 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
                <Ticket className="h-8 w-8" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-slate-900 dark:text-white">No RSVPs yet</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Events you join will show up here, so you always know what&apos;s coming up.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link to="/" className="btn-primary">
                  Browse live events
                </Link>
                <Link to="/discovery" className="btn-ghost">
                  Get recommendations
                </Link>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section className="glass rounded-3xl p-5" aria-labelledby="clubs-title">
            <h2 id="clubs-title" className="font-display font-bold text-slate-900 dark:text-white">
              Clubs you follow
            </h2>
            {myClubs.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {myClubs.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-100/80 px-3 py-2.5 dark:bg-white/5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{c.name}</p>
                      <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{c.tags.map(tagLabel).join(' · ')}</p>
                    </div>
                    <button
                      onClick={() => toggleFollowClub(c.id)}
                      className="text-xs font-semibold text-slate-500 hover:text-pulse-600"
                    >
                      Unfollow
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                None yet — explore clubs in <Link to="/discovery" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">Smart Discovery</Link>.
              </p>
            )}
          </section>

          <section className="glass rounded-3xl p-5" aria-labelledby="buddies-title">
            <h2 id="buddies-title" className="flex items-center gap-2 font-display font-bold text-slate-900 dark:text-white">
              <Users className="h-4 w-4 text-pulse-500" /> Buddy requests sent
            </h2>
            {myBuddies.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {myBuddies.map((b) => {
                  const ev = events.find((e) => e.id === b.eventId);
                  return (
                    <li key={b.id} className="rounded-xl bg-slate-100/80 px-3 py-2.5 dark:bg-white/5">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{b.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">for {ev?.title}</p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Nobody yet — head to <Link to="/plus-one" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">Find Plus-One</Link> to meet someone.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
