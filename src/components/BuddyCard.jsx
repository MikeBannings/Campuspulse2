import { useState } from 'react';
import { Check, MessageCircle, Send, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Modal from './Modal.jsx';
import { formatDate, formatTime, sharedInterests, tagLabel } from '../utils/helpers.js';

function Avatar({ buddy, size = 'h-12 w-12 text-base' }) {
  const initials = buddy.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${buddy.avatarColor} font-display font-bold text-white shadow-lg ${size}`}
    >
      {initials}
    </span>
  );
}

export default function BuddyCard({ buddy, index = 0 }) {
  const { events, interests, connections, connectWithBuddy } = useApp();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const event = events.find((e) => e.id === buddy.eventId);
  const shared = sharedInterests(buddy.interests, interests);
  const connected = connections.includes(buddy.id);
  const firstName = buddy.name.split(' ')[0];

  const openChat = () => {
    setMessage(`Hey ${firstName}! I'm also going to ${event?.title ?? 'the event'} — want to go together?`);
    setOpen(true);
  };

  const send = () => {
    connectWithBuddy(buddy.id);
    setOpen(false);
  };

  return (
    <>
      <article
        className="glass animate-fade-up rounded-3xl p-5 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-500/15"
        style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      >
        <div className="flex items-start gap-3">
          <Avatar buddy={buddy} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display font-bold text-slate-900 dark:text-white">{buddy.name}</h3>
              {buddy.isMine && (
                <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-600 dark:text-brand-300">
                  Your post
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {buddy.handle} · {buddy.year}, {buddy.branch}
            </p>
          </div>
          {shared.length > 0 && !buddy.isMine && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-300">
              <Sparkles className="h-3 w-3" />
              {shared.length} in common
            </span>
          )}
        </div>

        <div className="mt-4 rounded-2xl bg-slate-100/80 p-3.5 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-300">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Looking for…</p>“{buddy.note}”
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {buddy.interests.map((t) => {
            const isShared = shared.includes(t);
            return (
              <span
                key={t}
                className={`chip !px-2.5 !py-1 !text-[11px] ${
                  isShared
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-300'
                    : 'border-slate-200 bg-white/60 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
                }`}
              >
                {isShared && <Check className="h-3 w-3" />}
                {tagLabel(t)}
              </span>
            );
          })}
        </div>

        {event && (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Going to <span className="font-semibold text-slate-700 dark:text-slate-200">{event.title}</span> ·{' '}
            {formatDate(event.start)}, {formatTime(event.start)}
          </p>
        )}

        {buddy.isMine ? (
          <p className="mt-4 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            Visible to everyone attending — we'll notify you when someone connects.
          </p>
        ) : (
          <button
            onClick={openChat}
            disabled={connected}
            className={`${connected ? 'btn-ghost !border-emerald-300 !text-emerald-700 dark:!border-emerald-400/40 dark:!text-emerald-300' : 'btn-pink'} mt-4 w-full`}
          >
            {connected ? (
              <>
                <Check className="h-4 w-4" /> Request sent
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4" /> Connect &amp; Go Together
              </>
            )}
          </button>
        )}
      </article>

      <Modal open={open} onClose={() => setOpen(false)} title={`Say hi to ${firstName}`} subtitle="Send a quick message to team up.">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Avatar buddy={buddy} size="h-9 w-9 text-xs" />
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-sm text-slate-700 dark:bg-white/10 dark:text-slate-200">
              {buddy.note}
            </div>
          </div>
          <label className="block">
            <span className="sr-only">Your message</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="input resize-none"
              placeholder="Write a friendly message…"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="btn-ghost">
              Cancel
            </button>
            <button onClick={send} disabled={!message.trim()} className="btn-primary">
              <Send className="h-4 w-4" /> Send request
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
