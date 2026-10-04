import { INTEREST_TAGS, CATEGORIES } from '../data/mockData.js';

export const categoryById = (id) => CATEGORIES.find((c) => c.id === id);
export const tagLabel = (id) => INTEREST_TAGS.find((t) => t.id === id)?.label ?? id;

// ---------------------------------------------------------------- dates
const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export function formatDate(date) {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (sameDay(date, now)) return 'Today';
  if (sameDay(date, tomorrow)) return 'Tomorrow';
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatTime(date) {
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatDuration(hrs) {
  if (hrs < 1) return `${Math.round(hrs * 60)} min`;
  if (hrs >= 24) return `${hrs} hrs`;
  return Number.isInteger(hrs) ? `${hrs} hr${hrs > 1 ? 's' : ''}` : `${hrs} hrs`;
}

export function daysUntil(date) {
  const ms = date.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

// ------------------------------------------------------------- event state
// 'live' | 'upcoming' | 'ended'
export function eventStatus(event) {
  const now = Date.now();
  const start = event.start.getTime();
  const end = start + event.durationHrs * 60 * 60 * 1000;
  if (now >= start && now <= end) return 'live';
  if (now < start) return 'upcoming';
  return 'ended';
}

export function timeCommitmentBucket(event) {
  if (event.durationHrs < 1) return 'short';
  if (event.durationHrs <= 3) return 'medium';
  return 'long';
}

// ----------------------------------------------------------------- filters
export function matchesDateFilter(event, filter) {
  if (filter === 'all') return true;
  const now = new Date();
  const start = event.start;
  if (filter === 'today') return sameDay(start, now);
  if (filter === 'week') {
    const diff = start.getTime() - now.getTime();
    return diff > -24 * 60 * 60 * 1000 && diff <= 7 * 24 * 60 * 60 * 1000;
  }
  if (filter === 'weekend') {
    const day = start.getDay();
    const diff = start.getTime() - now.getTime();
    return (day === 6 || day === 0) && diff <= 8 * 24 * 60 * 60 * 1000 && diff > -24 * 60 * 60 * 1000;
  }
  return true;
}

export function matchesTimeFilter(event, filter) {
  if (filter === 'all') return true;
  const hrs = event.durationHrs;
  if (filter === 'short') return hrs < 1;
  if (filter === 'medium') return hrs >= 1 && hrs <= 3;
  if (filter === 'long') return hrs > 3;
  return true;
}

export function matchesPriceFilter(event, filter) {
  if (filter === 'all') return true;
  if (filter === 'free') return event.price === 0;
  if (filter === 'paid') return event.price > 0;
  return true;
}

// ------------------------------------------------------------------ match
// Percentage match between a student's chosen interests and an item's tags.
// Returns a number 0–99. A shared category with the chosen tags adds a small
// boost so that "related" events still surface for broad interests.
export function matchScore(userInterests, item) {
  if (!userInterests || userInterests.length === 0) return 0;
  const tags = item.tags ?? [];
  if (tags.length === 0) return 0;

  const shared = tags.filter((t) => userInterests.includes(t)).length;
  // Cosine similarity between two binary tag vectors (1 = identical sets).
  const overlap = shared / Math.sqrt(tags.length * userInterests.length);

  const userCategories = new Set(
    userInterests.map((id) => INTEREST_TAGS.find((t) => t.id === id)?.category).filter(Boolean),
  );
  const categoryBoost = userCategories.has(item.category) ? 0.18 : 0;

  const score = Math.round((overlap * 0.82 + categoryBoost) * 100);
  return Math.min(99, Math.max(shared > 0 || categoryBoost > 0 ? 12 : 0, score));
}

export function sharedInterests(a, b) {
  return a.filter((x) => b.includes(x));
}

export const classNames = (...parts) => parts.filter(Boolean).join(' ');
