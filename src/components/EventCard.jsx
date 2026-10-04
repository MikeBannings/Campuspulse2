import { useNavigate } from 'react-router-dom';
import { CalendarDays, Check, Clock, Flame, MapPin, Radio, Ticket, UserPlus, Users, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import CategoryIcon, { CATEGORY_STYLES } from './CategoryIcon.jsx';
import MatchBadge from './MatchBadge.jsx';
import {
  categoryById,
  eventStatus,
  formatDate,
  formatDuration,
  formatTime,
  tagLabel,
} from '../utils/helpers.js';

function Info({ icon: Icon, children, className = '' }) {
  return (
    <span className={`flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 ${className}`}>
      <Icon className="h-3.5 w-3.5 shrink-0 text-brand-500 dark:text-brand-300" aria-hidden="true" />
      <span className="truncate">{children}</span>
    </span>
  );
}

export default function EventCard({ event, match, sharedTags = [], index = 0 }) {
  const { isRsvped, toggleRsvp } = useApp();
  const navigate = useNavigate();

  const status = eventStatus(event);
  const cat = categoryById(event.category);
  const going = isRsvped(event.id);
  const soldOut = event.seatsLeft <= 0;
  const almostFull = !soldOut && event.seatsLeft / event.seats <= 0.15;
  const fillPct = Math.round(((event.seats - event.seatsLeft) / event.seats) * 100);

  return (
    <article
      className="glass group flex animate-fade-up flex-col overflow-hidden rounded-3xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-500/15"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      {/* Banner */}
      <div className={`relative h-28 overflow-hidden bg-gradient-to-br ${event.gradient}`}>
        <CategoryIcon
          name={cat.icon}
          className="absolute -bottom-4 -right-2 h-32 w-32 rotate-12 text-white/20 transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          {status === 'live' && (
            <span className="inline-flex animate-pulse-ring items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-pulse-600">
              <Radio className="h-3 w-3" /> Live now
            </span>
          )}
          {event.featured && status !== 'live' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-600">
              <Flame className="h-3 w-3" /> Featured
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            <CategoryIcon name={cat.icon} className="h-3 w-3" /> {cat.short}
          </span>
        </div>
        {match > 0 && <MatchBadge score={match} className="absolute right-4 top-4" label="Match" />}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold leading-snug text-slate-900 dark:text-white">{event.title}</h3>
        <p className="mt-0.5 text-xs font-semibold text-brand-600 dark:text-brand-300">by {event.organizer}</p>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{event.description}</p>

        {sharedTags.length > 0 && (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Matches your interests: </span>
            {sharedTags.map(tagLabel).join(', ')}
          </p>
        )}

        {/* Quick info badges */}
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5">
          <Info icon={CalendarDays}>
            {formatDate(event.start)} · {formatTime(event.start)}
          </Info>
          <Info icon={Clock}>{formatDuration(event.durationHrs)}</Info>
          <Info icon={MapPin} className="col-span-2">
            {event.location}
          </Info>
          <Info icon={Wallet}>{event.price === 0 ? 'Free' : `₹${event.price}`}</Info>
          <Info icon={Users}>
            <span className={almostFull || soldOut ? 'font-bold text-pulse-600 dark:text-pulse-400' : ''}>
              {soldOut ? 'Sold out' : `${event.seatsLeft} seats left`}
            </span>
          </Info>
        </div>

        {/* Seat meter */}
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10" aria-hidden="true">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              almostFull || soldOut ? 'bg-pulse-500' : 'bg-gradient-to-r from-brand-500 to-sky-400'
            }`}
            style={{ width: `${fillPct}%` }}
          />
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className={`chip ${CATEGORY_STYLES[event.category].chip} !px-2 !py-0.5 !text-[10px]`}>{cat.short}</span>
          {event.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300"
            >
              {tagLabel(t)}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-col gap-2 pt-1 sm:flex-row">
          <button
            onClick={() => toggleRsvp(event.id)}
            disabled={soldOut && !going}
            className={`${going ? 'btn-ghost !border-emerald-300 !text-emerald-700 dark:!border-emerald-400/40 dark:!text-emerald-300' : 'btn-primary'} flex-1`}
          >
            {going ? (
              <>
                <Check className="h-4 w-4" /> Joined
              </>
            ) : soldOut ? (
              'Event full'
            ) : (
              <>
                <Ticket className="h-4 w-4" /> RSVP / Join
              </>
            )}
          </button>
          <button onClick={() => navigate(`/plus-one?event=${event.id}`)} className="btn-ghost flex-1">
            <UserPlus className="h-4 w-4" /> Find a Plus-One
          </button>
        </div>
      </div>
    </article>
  );
}
