import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarDays, Check, MapPin, PenLine, Ticket, UserPlus, Users } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import BuddyCard from '../components/BuddyCard.jsx';
import PlusOneModal from '../components/PlusOneModal.jsx';
import { eventStatus, formatDate, formatTime, sharedInterests } from '../utils/helpers.js';

const STEPS = [
  ['Pick an event', 'Choose something you want to attend.'],
  ['Meet your match', 'See who else is going and what you have in common.'],
  ['Go together', 'Send a quick hello and walk in as a pair.'],
];

export default function PlusOne() {
  const { events, buddies, interests, isRsvped, toggleRsvp, connections } = useApp();
  const [params, setParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);

  const options = useMemo(
    () => events.filter((e) => eventStatus(e) !== 'ended').sort((a, b) => a.start - b.start),
    [events],
  );

  const buddyCount = (id) => buddies.filter((b) => b.eventId === id).length;

  // Selected event comes from ?event=… (so cards can deep-link here). Otherwise
  // prefer an event the user RSVPed to that has buddies, then the busiest one.
  const requested = params.get('event');
  const mostActive = [...options].sort((a, b) => buddyCount(b.id) - buddyCount(a.id))[0];
  const selectedId =
    options.find((e) => e.id === requested)?.id ??
    options.find((e) => isRsvped(e.id) && buddyCount(e.id) > 0)?.id ??
    mostActive?.id;
  const event = options.find((e) => e.id === selectedId);

  const feed = useMemo(
    () =>
      buddies
        .filter((b) => b.eventId === selectedId)
        .sort((a, b) => {
          if (a.isMine !== b.isMine) return a.isMine ? -1 : 1;
          return sharedInterests(b.interests, interests).length - sharedInterests(a.interests, interests).length;
        }),
    [buddies, selectedId, interests],
  );

  const going = event ? isRsvped(event.id) : false;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-pulse-500/10 px-3.5 py-1.5 text-xs font-bold text-pulse-600 dark:text-pulse-400">
            <UserPlus className="h-3.5 w-3.5" /> Plus-One Matching
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            Don&apos;t go <span className="text-gradient">alone</span>
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Find a student heading to the same event and walk in together — much easier than showing up solo.
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <PenLine className="h-4 w-4" /> Post a Plus-One Request
        </button>
      </header>

      {/* Event selector */}
      <section className="glass mt-8 rounded-3xl p-5 sm:p-6" aria-label="Choose an event">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Which event do you want to attend?
          </span>
          <select
            value={selectedId ?? ''}
            onChange={(e) => setParams({ event: e.target.value })}
            className="input !py-3 font-semibold"
          >
            {options.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} · {formatDate(ev.start)} · {buddyCount(ev.id)} looking
              </option>
            ))}
          </select>
        </label>

        {event && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-100/80 p-4 dark:bg-white/5">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-brand-500" />
                {formatDate(event.start)} · {formatTime(event.start)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-brand-500" />
                {event.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-brand-500" />
                {event.seatsLeft} seats left
              </span>
            </div>
            <button
              onClick={() => toggleRsvp(event.id)}
              className={going ? 'btn-ghost !border-emerald-300 !text-emerald-700 dark:!border-emerald-400/40 dark:!text-emerald-300' : 'btn-primary'}
            >
              {going ? (
                <>
                  <Check className="h-4 w-4" /> You&apos;re going
                </>
              ) : (
                <>
                  <Ticket className="h-4 w-4" /> RSVP too
                </>
              )}
            </button>
          </div>
        )}
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        {/* Buddy feed */}
        <section className="lg:col-span-2" aria-labelledby="buddy-title">
          <div className="mb-5 flex items-center justify-between">
            <h2 id="buddy-title" className="section-title flex items-center gap-3 !text-2xl">
              Looking for a Buddy
              <span className="rounded-full bg-pulse-500/10 px-2.5 py-0.5 text-sm font-bold text-pulse-600 dark:text-pulse-400">
                {feed.length}
              </span>
            </h2>
          </div>

          {feed.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {feed.map((b, i) => (
                <BuddyCard key={b.id} buddy={b} index={i} />
              ))}
            </div>
          ) : (
            <div className="glass rounded-3xl px-6 py-14 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pulse-500/10 text-pulse-500">
                <Users className="h-7 w-7" />
              </span>
              <p className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">
                Nobody&apos;s posted for this event yet
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Be the first — others will see your request.</p>
              <button onClick={() => setModalOpen(true)} className="btn-primary mt-6">
                <PenLine className="h-4 w-4" /> Post a request
              </button>
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="glass rounded-3xl p-5">
            <h3 className="font-display font-bold text-slate-900 dark:text-white">How it works</h3>
            <ol className="mt-4 space-y-4">
              {STEPS.map(([title, text], i) => (
                <li key={title} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-pulse-500 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="glass rounded-3xl p-5">
            <h3 className="font-display font-bold text-slate-900 dark:text-white">Your activity</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {connections.length === 0
                ? "You haven't sent any connection requests yet."
                : `You've sent ${connections.length} connection request${connections.length > 1 ? 's' : ''}.`}
            </p>
            <Link to="/rsvps" className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300">
              View in My RSVPs →
            </Link>
          </div>
        </aside>
      </div>

      <PlusOneModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultEventId={selectedId}
        onPosted={(id) => setParams({ event: id })}
      />
    </div>
  );
}
