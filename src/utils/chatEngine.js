// ---------------------------------------------------------------------------
// Pulse assistant brain.
//
// 1. A local, rule-based engine that understands campus questions (events by
//    day / price / category / interest, recommendations, clubs, plus-one help,
//    RSVPs) and answers from the *live* app state. Works offline, no API key.
// 2. Optional: set VITE_AI_ENDPOINT to a backend URL that proxies an LLM. The
//    LLM writes the wording; the local engine still supplies event cards and
//    quick links. See README → "Connect a real LLM".
// ---------------------------------------------------------------------------
import { CATEGORIES, INTEREST_TAGS } from '../data/mockData.js';
import {
  daysUntil,
  eventStatus,
  formatDate,
  formatDuration,
  formatTime,
  matchScore,
  matchesDateFilter,
  tagLabel,
} from './helpers.js';

export const DEFAULT_SUGGESTIONS = [
  "What's happening today?",
  'Recommend events for me',
  'Free events this weekend',
  'Which clubs can I join?',
  "I don't want to go alone",
];

// ------------------------------------------------------------------ helpers
const STOP = new Set([
  'the', 'a', 'an', 'of', 'to', 'for', 'and', 'or', 'in', 'on', 'at', 'is', 'are', 'what', 'whats', 'when',
  'where', 'who', 'tell', 'me', 'about', 'details', 'info', 'event', 'events', 'campus', 'my', 'i', 'you',
  'can', 'do', 'does', 'how', 'there', 'any', 'some', 'this', 'that', 'it', 'with', 'up', 'be', 'will',
  'going', 'go', 'time', 'much', 'many', 'more', 'seats', 'price', 'cost', 'location', 's',
]);

const tokens = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

// Short keywords must match a whole word; longer ones match as a prefix
// (so "danc" catches dance / dancing / dancer).
const wordHit = (words, kw) => (kw.length <= 3 ? words.includes(kw) : words.some((w) => w.startsWith(kw)));
const anyWord = (words, kws) => kws.some((kw) => wordHit(words, kw));
const hasPhrase = (clean, phrases) => phrases.some((p) => clean.includes(p));
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const listJoin = (items) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

const reply = (text, extra = {}) => ({
  text,
  events: [],
  actions: [],
  suggestions: [],
  matches: {},
  ...extra,
});

const CATEGORY_KEYWORDS = {
  tech: ['tech', 'coding', 'programming', 'developer', 'software'],
  sports: ['sport', 'fitness', 'athletic'],
  cultural: ['cultural', 'culture', 'fest'],
  workshop: ['workshop', 'bootcamp'],
  seminar: ['seminar', 'talk', 'panel', 'lecture', 'speaker'],
};

const TAG_KEYWORDS = {
  python: ['python'],
  webdev: ['web', 'frontend', 'react', 'website'],
  'ai-ml': ['ai', 'ml', 'llm', 'gpt', 'machine', 'artificial'],
  hackathons: ['hackathon', 'hack'],
  football: ['football', 'soccer'],
  basketball: ['basketball'],
  running: ['run', 'running', '5k', 'marathon', 'jog'],
  yoga: ['yoga'],
  dance: ['danc'],
  music: ['music', 'sing', 'band', 'mic'],
  theatre: ['theatre', 'theater', 'drama'],
  photography: ['photo'],
  entrepreneurship: ['entrepreneur', 'startup', 'founder', 'business'],
  fintech: ['fintech', 'finance', 'financial'],
  'public-speaking': ['speaking', 'debate', 'speech'],
  design: ['design', 'ux', 'ui', 'figma'],
  robotics: ['robot'],
  research: ['research', 'phd', 'masters', 'ms', 'thesis'],
};

const CLUB_KEYWORDS = {
  c1: ['coding'],
  c2: ['cultural'],
  c3: ['sports', 'sport'],
  c4: ['ecell', 'cell'],
};

const detectTags = (words) =>
  INTEREST_TAGS.filter((tag) => (TAG_KEYWORDS[tag.id] ?? []).some((kw) => wordHit(words, kw))).map((t) => t.id);

const detectCategories = (words) =>
  CATEGORIES.filter((c) => (CATEGORY_KEYWORDS[c.id] ?? []).some((kw) => wordHit(words, kw))).map((c) => c.id);

// Find the event a user is asking about by overlap with its title/organiser.
function findEvent(words, events) {
  const sig = words.filter((w) => w.length > 2 && !STOP.has(w));
  let best = null;
  let bestScore = 0;
  for (const e of events) {
    const title = tokens(e.title);
    const org = tokens(e.organizer);
    let s = 0;
    for (const w of sig) {
      if (title.some((t) => t === w || (w.length > 3 && (t.startsWith(w) || (t.length > 3 && w.startsWith(t)))))) s += 2;
      else if (org.includes(w)) s += 1;
    }
    if (s > bestScore) {
      best = e;
      bestScore = s;
    }
  }
  return bestScore >= 2 ? best : null;
}

function describeEvent(e, words, clean) {
  const when = `${formatDate(e.start)} at ${formatTime(e.start)}`;
  if (words.includes('where') || hasPhrase(clean, ['location', 'venue'])) {
    return `**${e.title}** is at ${e.location}, ${when}.`;
  }
  if (words.includes('when') || hasPhrase(clean, ['what time', 'start'])) {
    return `**${e.title}** starts ${when} (${formatDuration(e.durationHrs)}) at ${e.location}.`;
  }
  if (hasPhrase(clean, ['seat', 'spots', 'full', 'capacity'])) {
    return `**${e.title}** has ${e.seatsLeft} of ${e.seats} seats left.`;
  }
  if (hasPhrase(clean, ['cost', 'price', 'fee', 'free', 'how much', 'pay'])) {
    return `**${e.title}** is ${e.price === 0 ? 'free to attend' : `₹${e.price} per person`}.`;
  }
  return `**${e.title}** is organised by ${e.organizer} — ${when} at ${e.location}. ${e.description}`;
}

// --------------------------------------------------------------- constraints
function parseConstraints(clean, words) {
  const c = { categories: detectCategories(words), tags: detectTags(words) };

  if (hasPhrase(clean, ['right now', 'happening now', 'live now', 'ongoing', 'in progress']) || words.includes('live') || words.includes('now')) {
    c.when = 'live';
  } else if (words.includes('today') || words.includes('tonight')) c.when = 'today';
  else if (words.includes('tomorrow')) c.when = 'tomorrow';
  else if (words.includes('weekend') || words.includes('saturday') || words.includes('sunday')) c.when = 'weekend';
  else if (hasPhrase(clean, ['this week', 'next 7', 'coming days', 'week'])) c.when = 'week';

  if (words.includes('free') || hasPhrase(clean, ['no fee', 'no cost'])) c.price = 'free';
  else if (words.includes('paid')) c.price = 'paid';

  if (hasPhrase(clean, ['under an hour', 'less than an hour', 'under 2 hours', 'quick', 'short'])) c.maxHrs = 2;
  if (hasPhrase(clean, ['half day', 'full day', 'all day', 'long', 'overnight'])) c.minHrs = 3;

  if (hasPhrase(clean, ['almost full', 'filling', 'selling fast', 'few seats', 'last seats', 'limited seats', 'running out'])) {
    c.scarce = true;
  }
  return c;
}

const hasConstraint = (c) =>
  Boolean(c.when || c.price || c.maxHrs || c.minHrs || c.scarce || c.categories.length || c.tags.length);

function applyConstraints(events, c) {
  return events.filter((e) => {
    const st = eventStatus(e);
    if (st === 'ended') return false;
    if (c.when === 'live' && st !== 'live') return false;
    if (c.when === 'today' && !matchesDateFilter(e, 'today')) return false;
    if (c.when === 'tomorrow' && formatDate(e.start) !== 'Tomorrow') return false;
    if (c.when === 'weekend' && !matchesDateFilter(e, 'weekend')) return false;
    if (c.when === 'week' && !matchesDateFilter(e, 'week')) return false;
    if (c.price === 'free' && e.price !== 0) return false;
    if (c.price === 'paid' && e.price === 0) return false;
    if (c.maxHrs && e.durationHrs > c.maxHrs) return false;
    if (c.minHrs && e.durationHrs < c.minHrs) return false;
    if (c.categories.length && !c.categories.includes(e.category)) return false;
    if (c.tags.length && !e.tags.some((t) => c.tags.includes(t))) return false;
    if (c.scarce && e.seatsLeft / e.seats > 0.3) return false;
    return true;
  });
}

function describeConstraints(c) {
  const parts = [];
  if (c.price) parts.push(c.price);
  if (c.categories.length) parts.push(c.categories.map((id) => CATEGORIES.find((x) => x.id === id).short.toLowerCase()).join('/'));
  if (c.tags.length) parts.push(c.tags.map(tagLabel).join('/'));
  if (c.maxHrs) parts.push('2 hours or less');
  if (c.minHrs) parts.push('3+ hours');
  if (c.scarce) parts.push('filling up fast');
  const when = { live: 'right now', today: 'today', tomorrow: 'tomorrow', weekend: 'this weekend', week: 'this week' }[c.when];
  return { what: parts.join(', '), when };
}

const MAX_CARDS = 4;

function helpReply() {
  return reply(
    "I'm Pulse, your campus assistant. Here's what I can do:\n" +
      '• Find events by day, price, category or interest\n' +
      '• Recommend things based on what you like\n' +
      '• Tell you about clubs and application deadlines\n' +
      '• Help you find a buddy so you never go alone\n' +
      '• Show your RSVPs and answer questions about an event',
    { suggestions: DEFAULT_SUGGESTIONS },
  );
}

// ---------------------------------------------------------------- main entry
export function getReply(input, ctx) {
  const raw = (input ?? '').trim();
  const words = tokens(raw);
  const clean = words.join(' ');
  const { events, clubs, buddies, interests, rsvps, followedClubs } = ctx;
  const upcoming = events.filter((e) => eventStatus(e) !== 'ended').sort((a, b) => a.start - b.start);

  if (!raw) return helpReply();

  // Greetings & thanks
  if (words.length <= 4 && words.some((w) => ['hi', 'hello', 'hey', 'hola', 'namaste', 'yo', 'sup'].includes(w))) {
    return reply(
      "Hey! I'm Pulse, your campus guide. I can find events, recommend things based on your interests, tell you about clubs, or help you find a buddy to go with. What are you looking for?",
      { suggestions: DEFAULT_SUGGESTIONS },
    );
  }
  if (words.length <= 5 && words.some((w) => ['thanks', 'thank', 'thx', 'ty'].includes(w))) {
    return reply('Anytime! Ask me whenever you want to find something to do on campus.', {
      suggestions: ['Recommend events for me', 'Which clubs can I join?'],
    });
  }

  // Plus-one / buddy
  if (
    hasPhrase(clean, [
      'plus one', 'plusone', 'buddy', 'buddies', 'alone', 'tag along', 'go with someone', 'go together',
      'teammate', 'team up', 'find someone', 'someone to go', 'nobody to go', 'no one to go',
    ])
  ) {
    const mentioned = findEvent(words, upcoming);
    const withBuddies = upcoming.filter((e) => buddies.some((b) => b.eventId === e.id));
    const target = mentioned ?? withBuddies.find((e) => rsvps.includes(e.id)) ?? withBuddies[0] ?? upcoming[0];
    if (!target) return reply('There are no upcoming events right now, so there is nobody to match with yet.');
    const n = buddies.filter((b) => b.eventId === target.id).length;
    const lead =
      n === 0
        ? `Nobody has posted for **${target.title}** yet`
        : `${plural(n, 'student')} ${n === 1 ? 'is' : 'are'} looking for a buddy for **${target.title}**`;
    return reply(
      `Going solo is totally fine, but it's better with company. ${lead}. Open Find Plus-One to see their interests, send a quick hello, or post your own request.`,
      {
        events: [target.id],
        actions: [{ label: 'Open Find Plus-One', to: `/plus-one?event=${target.id}` }],
        suggestions: ['Show my RSVPs', 'Recommend events for me'],
      },
    );
  }

  // Clubs
  if (anyWord(words, ['club', 'societ', 'committee']) || words.includes('ecell') || clean.includes('e cell')) {
    const named = clubs.find(
      (c) =>
        (CLUB_KEYWORDS[c.id] ?? []).some((k) => words.includes(k)) ||
        clean.includes(c.name.toLowerCase().replace(/-/g, ' ')),
    );
    if (named) {
      const following = followedClubs.includes(named.id);
      const days = daysUntil(named.deadline);
      return reply(
        `**${named.name}** — ${named.tagline} ${named.members.toLocaleString('en-IN')} members. Latest: ${named.recentUpdate} Applications close ${formatDate(named.deadline)} (${days === 0 ? 'today' : plural(days, 'day') + ' left'}). ${following ? "You're already following them." : 'Tap Join / Follow Club in Smart Discovery to follow in one click.'}`,
        { actions: [{ label: 'Open Smart Discovery', to: '/discovery' }], suggestions: ['Which clubs can I join?', 'Recommend events for me'] },
      );
    }
    const ranked = [...clubs].sort((a, b) => matchScore(interests, b) - matchScore(interests, a));
    const lines = ranked.map((c) => {
      const d = daysUntil(c.deadline);
      return `• ${c.name} — ${c.members.toLocaleString('en-IN')} members · apply ${d === 0 ? 'today' : `in ${plural(d, 'day')}`}`;
    });
    return reply(
      `Here are the clubs on campus${interests.length ? ' (best fit for you first)' : ''}:\n${lines.join('\n')}\nFollow any of them with one click in Smart Discovery.`,
      { actions: [{ label: 'Open Smart Discovery', to: '/discovery' }], suggestions: ['Tell me about the Coding Club', 'Recommend events for me'] },
    );
  }

  // How do I RSVP
  if (hasPhrase(clean, ['how do i rsvp', 'how to rsvp', 'how can i rsvp', 'how do i join', 'how to join', 'how can i join', 'how do i register', 'how to register'])) {
    return reply(
      "Tap RSVP / Join Event on any event card — you'll get an instant confirmation and it shows up in My RSVPs, where you can cancel anytime. Want company? Tap Find a Plus-One on the same card.",
      { actions: [{ label: 'Browse live events', to: '/' }], suggestions: DEFAULT_SUGGESTIONS.slice(0, 3) },
    );
  }

  // My RSVPs
  if (
    words.includes('rsvps') ||
    hasPhrase(clean, ['my rsvp', 'my events', 'my tickets', 'am i going', 'what am i going', 'my registrations', 'i have rsvped', 'i rsvped', 'events i joined', 'events i m going', 'events i am going'])
  ) {
    const mine = upcoming.filter((e) => rsvps.includes(e.id));
    if (mine.length === 0) {
      return reply("You haven't RSVPed to anything yet. Want some picks to start with?", {
        actions: [{ label: 'Browse live events', to: '/' }],
        suggestions: ['Recommend events for me', "What's happening today?"],
      });
    }
    return reply(`You're going to ${plural(mine.length, 'event')}:`, {
      events: mine.slice(0, MAX_CARDS).map((e) => e.id),
      actions: [{ label: 'Open My RSVPs', to: '/rsvps' }],
      suggestions: ["I don't want to go alone"],
    });
  }

  // Questions about one specific event
  const detailish = hasPhrase(clean, [
    'tell me about', 'more about', 'details', 'info on', 'information', 'when is', 'where is', 'what time',
    'how many seats', 'seats left', 'how much', 'price of', 'cost of', 'what is the', 'what s the', 'about the',
  ]);
  if (detailish) {
    const found = findEvent(words, events);
    if (found) {
      return reply(describeEvent(found, words, clean), {
        events: [found.id],
        suggestions: ["I don't want to go alone", 'Recommend events for me'],
      });
    }
  }

  // Recommendations
  const textTags = detectTags(words);
  if (
    hasPhrase(clean, [
      'recommend', 'suggest', 'for me', 'my interest', 'what should i', 'best for me', 'something fun',
      'something to do', 'i like', 'i love', 'i m into', 'im into', 'interested in', 'i enjoy', 'personali', 'best fit',
    ])
  ) {
    const basis = textTags.length ? textTags : interests;
    if (basis.length === 0) {
      return reply(
        "Tell me what you're into — for example “I like Python and football” — or pick your interests in Smart Discovery and I'll tune everything to you.",
        {
          actions: [{ label: 'Pick interests', to: '/discovery' }],
          suggestions: ['I like Python and hackathons', "I'm into dance and music"],
        },
      );
    }
    const scored = upcoming
      .map((e) => ({ e, s: matchScore(basis, e) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || a.e.start - b.e.start)
      .slice(0, 3);
    const labels = listJoin(basis.slice(0, 4).map(tagLabel));
    if (scored.length === 0) {
      return reply(`Nothing lines up with ${labels} right now. Here are the featured events instead:`, {
        events: upcoming.filter((e) => e.featured).slice(0, 3).map((e) => e.id),
        suggestions: ["What's happening today?", 'Which clubs can I join?'],
      });
    }
    return reply(`${textTags.length ? `For ${labels}` : `Based on your interests (${labels})`}, these fit best:`, {
      events: scored.map((x) => x.e.id),
      matches: Object.fromEntries(scored.map((x) => [x.e.id, x.s])),
      actions: [{ label: 'Fine-tune interests', to: '/discovery' }],
      suggestions: ["I don't want to go alone", 'Which clubs can I join?'],
    });
  }

  // Small FAQ
  if (hasPhrase(clean, ['dark mode', 'light mode', 'theme'])) {
    return reply('Use the sun/moon button in the top bar to switch between light and dark mode. CampusPulse remembers your choice.');
  }
  if (hasPhrase(clean, ['what is campuspulse', 'about campuspulse', 'who made'])) {
    return reply(
      'CampusPulse puts every campus event and club in one place, matches them to your interests, and helps you find a plus-one so you never have to show up alone.',
      { suggestions: DEFAULT_SUGGESTIONS.slice(0, 3) },
    );
  }
  if (hasPhrase(clean, ['what can you do', 'how can you help', 'what do you do']) || clean === 'help') return helpReply();

  // Filtered event search (day / price / category / interest / length / seats)
  const c = parseConstraints(clean, words);
  if (hasConstraint(c)) {
    const found = applyConstraints(events, c).sort((a, b) => a.start - b.start);
    const { what, when } = describeConstraints(c);
    if (found.length === 0) {
      const label = [what && `(${what})`, when].filter(Boolean).join(' ');
      return reply(`I couldn't find anything ${label}. Here's what's coming up next on campus instead:`, {
        events: upcoming.slice(0, 3).map((e) => e.id),
        actions: [{ label: 'Browse all events', to: '/' }],
        suggestions: DEFAULT_SUGGESTIONS.slice(0, 3),
      });
    }
    const head = `Here ${found.length === 1 ? 'is' : 'are'} ${plural(found.length, 'event')}${what ? ` (${what})` : ''}${when ? ` ${when}` : ''}:`;
    const more = found.length > MAX_CARDS ? ` Showing the first ${MAX_CARDS} — the Live Events page has the rest.` : '';
    return reply(head + more, {
      events: found.slice(0, MAX_CARDS).map((e) => e.id),
      actions: found.length > MAX_CARDS ? [{ label: 'See all on Live Events', to: '/' }] : [],
      suggestions: ["I don't want to go alone", 'Recommend events for me'],
    });
  }

  // Generic "what's on?"
  if (hasPhrase(clean, ['event', 'happening', 'what s on', 'whats on', 'going on', 'things to do', 'activities', 'upcoming', 'schedule'])) {
    return reply("Here's what's coming up next on campus:", {
      events: upcoming.slice(0, MAX_CARDS).map((e) => e.id),
      actions: [{ label: 'See all on Live Events', to: '/' }],
      suggestions: ['Free events this weekend', 'Recommend events for me'],
    });
  }

  return {
    ...reply(
      "I'm not sure I got that one. I can find events by day, price, category or interest, recommend things for you, tell you about clubs, or help you find a plus-one. Try one of these:",
      { suggestions: DEFAULT_SUGGESTIONS },
    ),
    fallback: true,
  };
}

// ------------------------------------------------------------ optional LLM
function summarise(ctx) {
  return {
    interests: ctx.interests,
    rsvps: ctx.rsvps,
    events: ctx.events.map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      organizer: e.organizer,
      start: e.start.toISOString(),
      durationHrs: e.durationHrs,
      location: e.location,
      seatsLeft: e.seatsLeft,
      price: e.price,
      tags: e.tags,
    })),
    clubs: ctx.clubs.map((c) => ({
      id: c.id,
      name: c.name,
      members: c.members,
      tagline: c.tagline,
      deadline: c.deadline.toISOString(),
    })),
  };
}

async function askRemote(message, history, ctx) {
  const url = import.meta.env.VITE_AI_ENDPOINT;
  if (!url) return null;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: history.slice(-8).map((m) => ({ role: m.role, content: m.text })),
        context: summarise(ctx),
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.reply === 'string' && data.reply.trim() ? data.reply.trim() : null;
  } catch {
    return null; // network/CORS error → fall back to the local engine
  }
}

// Public API used by the chat widget.
export async function getAssistantReply(message, history, ctx) {
  const local = getReply(message, ctx);
  const remote = await askRemote(message, history, ctx);
  if (!remote) return local;
  // Keep the local engine's cards and quick links when it understood the
  // question; otherwise let the model's answer stand alone.
  return local.fallback ? reply(remote, { suggestions: DEFAULT_SUGGESTIONS.slice(0, 3) }) : { ...local, text: remote };
}
