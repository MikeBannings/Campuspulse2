import { Check, Hourglass, Megaphone, Plus, Users } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import CategoryIcon from './CategoryIcon.jsx';
import MatchBadge from './MatchBadge.jsx';
import { categoryById, daysUntil, formatDate, tagLabel } from '../utils/helpers.js';

export default function ClubCard({ club, match, index = 0 }) {
  const { followedClubs, toggleFollowClub } = useApp();
  const following = followedClubs.includes(club.id);
  const cat = categoryById(club.category);
  const daysLeft = daysUntil(club.deadline);
  const urgent = daysLeft <= 5;

  return (
    <article
      className="glass group flex animate-fade-up flex-col overflow-hidden rounded-3xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-500/15"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className={`relative flex h-20 items-center gap-3 bg-gradient-to-r ${club.gradient} px-5`}>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/25 text-white backdrop-blur">
          <CategoryIcon name={cat.icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-bold text-white">{club.name}</h3>
          <p className="text-xs font-medium text-white/80">{cat.label}</p>
        </div>
        {match > 0 && <MatchBadge score={match} label="Fit" className="absolute right-3 top-3" />}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm text-slate-600 dark:text-slate-300">{club.tagline}</p>

        <div className="mt-4 space-y-2.5 text-xs">
          <p className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
            <Users className="h-3.5 w-3.5 text-brand-500 dark:text-brand-300" />
            {(club.members + (following ? 1 : 0)).toLocaleString('en-IN')} members
          </p>
          <p className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
            <Megaphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pulse-500" />
            {club.recentUpdate}
          </p>
          <p
            className={`flex items-center gap-2 font-semibold ${
              urgent ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Hourglass className="h-3.5 w-3.5" />
            Apply by {formatDate(club.deadline)} ·{' '}
            {daysLeft === 0 ? 'closes today' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {club.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300"
            >
              {tagLabel(t)}
            </span>
          ))}
        </div>

        <button
          onClick={() => toggleFollowClub(club.id)}
          className={`${following ? 'btn-ghost !border-emerald-300 !text-emerald-700 dark:!border-emerald-400/40 dark:!text-emerald-300' : 'btn-primary'} mt-5 w-full`}
        >
          {following ? (
            <>
              <Check className="h-4 w-4" /> Following
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Join / Follow Club
            </>
          )}
        </button>
      </div>
    </article>
  );
}
