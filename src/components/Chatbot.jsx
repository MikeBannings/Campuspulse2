import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bot, Check, RotateCcw, Send, Sparkles, Ticket, UserPlus, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { DEFAULT_SUGGESTIONS, getAssistantReply } from '../utils/chatEngine.js';
import MatchBadge from './MatchBadge.jsx';
import { eventStatus, formatDate, formatTime } from '../utils/helpers.js';

const welcome = () => ({
  id: 'welcome',
  role: 'assistant',
  text: "Hi, I'm Pulse — your campus assistant. Ask me what's on today, for picks based on your interests, about clubs, or for help finding a buddy to go with.",
  events: [],
  actions: [],
  matches: {},
  suggestions: DEFAULT_SUGGESTIONS,
});

// Renders **bold** segments inside chat text.
function Rich({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>,
  );
}

function MiniEvent({ event, match }) {
  const { isRsvped, toggleRsvp } = useApp();
  const navigate = useNavigate();
  const going = isRsvped(event.id);
  const live = eventStatus(event) === 'live';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 h-11 w-1.5 shrink-0 rounded-full bg-gradient-to-b ${event.gradient}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-bold leading-snug text-slate-900 dark:text-white">{event.title}</p>
            {match > 0 && <MatchBadge score={match} className="shrink-0" />}
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {live ? 'Live now' : `${formatDate(event.start)}, ${formatTime(event.start)}`} · {event.location}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {event.price === 0 ? 'Free' : `₹${event.price}`} · {event.seatsLeft} seats left
          </p>
        </div>
      </div>
      <div className="mt-2.5 flex gap-2">
        <button
          onClick={() => toggleRsvp(event.id)}
          disabled={event.seatsLeft <= 0 && !going}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
            going
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              : 'bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-50'
          }`}
        >
          {going ? (
            <>
              <Check className="h-3.5 w-3.5" /> Joined
            </>
          ) : (
            <>
              <Ticket className="h-3.5 w-3.5" /> RSVP
            </>
          )}
        </button>
        <button
          onClick={() => navigate(`/plus-one?event=${event.id}`)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
        >
          <UserPlus className="h-3.5 w-3.5" /> Plus-One
        </button>
      </div>
    </div>
  );
}

export default function Chatbot() {
  const app = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([welcome()]);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setSeen(true);
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typing, open]);

  const send = async (text) => {
    const message = text.trim();
    if (!message || typing) return;
    const userMsg = { id: `u${Date.now()}`, role: 'user', text: message };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setTyping(true);

    const ctx = {
      events: app.events,
      clubs: app.clubs,
      buddies: app.buddies,
      interests: app.interests,
      rsvps: app.rsvps,
      followedClubs: app.followedClubs,
    };
    const [reply] = await Promise.all([
      getAssistantReply(message, history, ctx),
      new Promise((resolve) => setTimeout(resolve, 600)),
    ]);
    setMessages((m) => [...m, { id: `a${Date.now()}`, role: 'assistant', ...reply }]);
    setTyping(false);
  };

  const lastAssistantId = [...messages].reverse().find((m) => m.role === 'assistant')?.id;

  return (
    <>
      {open && (
        <section
          aria-label="Pulse assistant chat"
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          className="glass fixed bottom-24 right-4 z-[60] flex h-[min(34rem,calc(100vh-8rem))] w-[calc(100vw-2rem)] max-w-md animate-pop-in flex-col overflow-hidden rounded-3xl !bg-white/95 sm:right-6 dark:!bg-slate-900/95"
        >
          {/* Header */}
          <header className="flex items-center gap-3 bg-gradient-to-r from-brand-600 to-pulse-500 px-4 py-3.5 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Bot className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-sm font-bold">Pulse Assistant</h2>
              <p className="flex items-center gap-1.5 text-[11px] text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Online · knows today&apos;s events
              </p>
            </div>
            <button
              onClick={() => setMessages([welcome()])}
              aria-label="Start a new chat"
              title="New chat"
              className="rounded-lg p-2 text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-lg p-2 text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.map((m) => {
              const cards = (m.events ?? [])
                .map((id) => app.events.find((e) => e.id === id))
                .filter(Boolean);
              return (
                <div key={m.id} className={`flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[88%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'rounded-br-sm bg-gradient-to-r from-brand-600 to-brand-500 text-white'
                        : 'rounded-bl-sm bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-100'
                    }`}
                  >
                    <Rich text={m.text} />
                  </div>

                  {cards.length > 0 && (
                    <div className="w-full space-y-2">
                      {cards.map((e) => (
                        <MiniEvent key={e.id} event={e} match={m.matches?.[e.id]} />
                      ))}
                    </div>
                  )}

                  {(m.actions ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {m.actions.map((a) => (
                        <button
                          key={a.to + a.label}
                          onClick={() => navigate(a.to)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 dark:border-brand-400/30 dark:bg-brand-500/10 dark:text-brand-200"
                        >
                          {a.label} <ArrowRight className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  )}

                  {m.id === lastAssistantId && !typing && (m.suggestions ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {m.suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-400 hover:text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-brand-200"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {typing && (
              <div className="flex items-start" aria-label="Pulse is typing">
                <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3 dark:bg-white/10">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-slate-200/70 p-3 dark:border-white/10"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about events, clubs, buddies…"
              aria-label="Message Pulse"
              className="input !rounded-full !py-2.5"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              aria-label="Send message"
              className="btn-primary !rounded-full !p-3"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}

      {/* Launcher */}
      <div className="fixed bottom-5 right-4 z-[60] flex items-center gap-3 sm:right-6">
        {!open && !seen && (
          <span className="glass hidden animate-fade-up items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold text-slate-700 sm:flex dark:text-slate-200">
            <Sparkles className="h-3.5 w-3.5 text-pulse-500" /> Ask Pulse
          </span>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close assistant' : 'Open assistant'}
          aria-expanded={open}
          className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-pulse-500 text-white shadow-xl shadow-brand-500/40 transition hover:scale-105 active:scale-95 ${
            !open && !seen ? 'animate-pulse-ring' : ''
          }`}
        >
          {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
        </button>
      </div>
    </>
  );
}
