# CampusPulse

A modern, responsive campus community platform that tackles two barriers to student engagement:
**"I don't know what's available"** and **"I'd feel awkward going alone."**

Built with **React (Vite) + Tailwind CSS + Lucide icons**, with dark/light mode, glassmorphism cards and an AI-style assistant chatbot.

## Features

| Area | What it does |
| --- | --- |
| **Live Events** (`/`) | Hero search, category quick-filters, live "What's Happening" feed (Live / Upcoming / Featured tabs), filters for date, time commitment and free/paid, sorting, RSVP and "Find a Plus-One" on every card |
| **Smart Discovery** (`/discovery`) | Interest tag selector (saved automatically), "Recommended for You" with percentage match scores, club showcase with member counts, updates, deadlines and 1-click Join / Follow |
| **Find Plus-One** (`/plus-one`) | Pick an event, browse students looking for a buddy (year, shared interests, note), "Connect & Go Together" chat popup, and a "Post a Plus-One Request" modal |
| **My RSVPs** (`/rsvps`) | Your joined events, followed clubs, buddy requests and quick stats |
| **Pulse Assistant** | Floating chatbot that answers from live app data (see below) |
| **Shell** | Sticky navbar, notification bell, profile menu, theme toggle, toasts, mobile menu |

Your interests, RSVPs, followed clubs and theme are stored in `localStorage`, so the demo remembers you between visits.

## Run it locally

Requirements: **Node.js 18+** (20+ recommended).

```bash
cd campuspulse
npm install
npm run dev        # opens http://localhost:5173
```

Other commands:

```bash
npm run build      # production build into dist/
npm run preview    # serve the production build locally
```

## Project structure

```
src/
├── main.jsx                 # entry: Router + AppProvider
├── App.jsx                  # layout + routes
├── index.css                # Tailwind layers, glass/btn/chip utility classes
├── context/AppContext.jsx   # global state: theme, RSVPs, interests, clubs, buddies, toasts
├── data/mockData.js         # 8 events, 4 clubs, 5 buddy profiles, notifications, demo user
├── utils/
│   ├── helpers.js           # date formatting, filters, match-score algorithm
│   ├── chatEngine.js        # the assistant's brain (rules + optional LLM hook)
│   └── hooks.js
├── components/              # Navbar, EventCard, ClubCard, BuddyCard, PlusOneModal,
│                            # Chatbot, Modal, Toaster, NotificationBell, ...
└── pages/                   # LiveEvents, Discovery, PlusOne, MyRsvps
```

## Customising

- **Data:** edit `src/data/mockData.js`. Event dates are generated relative to today, so the feed always looks current (one event is always "live now").
- **Demo user:** change `CURRENT_USER` at the bottom of `mockData.js`.
- **Brand colours:** `tailwind.config.js` → `theme.extend.colors.brand` / `pulse`.
- **Match score:** `matchScore()` in `src/utils/helpers.js` uses cosine similarity between a student's interest tags and an item's tags, plus a small bonus when the category matches.

## How the Pulse Assistant works

Out of the box it needs **no API key**. `src/utils/chatEngine.js` is a rule-based engine that reads the live app state, so its answers always reflect current seats, RSVPs and interests. Try:

- "What's happening today?" / "anything live right now?"
- "Free tech events this weekend" / "quick sports events tomorrow"
- "Recommend events for me" / "I like dance and music"
- "Which clubs can I join?" / "Tell me about the Coding Club"
- "I don't want to go alone to the hackathon"
- "Where is the design workshop?" / "Show my RSVPs"

Replies can include event cards (with working RSVP and Plus-One buttons), quick-link chips and follow-up suggestions.

### Connect a real LLM (optional)

Never put an API key in front-end code. Instead, run a tiny backend that holds the key, and point the app at it:

1. Create `.env.local` in the project root:
   ```
   VITE_AI_ENDPOINT=http://localhost:8787/api/chat
   ```
2. Your endpoint receives `POST { message, history: [{role, content}], context }` and must return `{ "reply": "text" }`.
   `context` contains the live events, clubs, interests and RSVPs.
3. When an endpoint is set, the LLM writes the wording while the local engine still supplies the event cards and quick links. If the endpoint fails, the app silently falls back to the local engine.

Minimal example proxy (Express + the Anthropic SDK — see https://docs.claude.com for current model names and options):

```js
// server.mjs   →   npm i express cors @anthropic-ai/sdk   →   ANTHROPIC_API_KEY=... node server.mjs
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express().use(cors(), express.json());
const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

app.post('/api/chat', async (req, res) => {
  const { history, context } = req.body;
  const first = history.findIndex((m) => m.role === 'user'); // must start with a user turn
  const msg = await client.messages.create({
    model: 'claude-sonnet-5-5',
    max_tokens: 400,
    system:
      'You are Pulse, a friendly campus assistant. Answer briefly using ONLY this live campus data, ' +
      'and say so if something is not in it: ' + JSON.stringify(context),
    messages: history.slice(first).map(({ role, content }) => ({ role, content })),
  });
  res.json({ reply: msg.content.map((b) => b.text ?? '').join('') });
});

app.listen(8787);
```

## Deploying

`npm run build` produces a static site in `dist/`. Because the app uses client-side routing, configure your host to serve `index.html` for unknown paths (Netlify: add a `_redirects` file with `/* /index.html 200`; Vercel does this automatically for Vite projects).

## Notes

- All data is mock data; there is no backend. RSVP seat counts reset on refresh (RSVPs themselves persist).
- Accessibility: keyboard-focusable controls, ARIA labels/roles, `prefers-reduced-motion` respected.
# Campuspulse2
