import { useEffect, useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import Modal from './Modal.jsx';
import { useApp } from '../context/AppContext.jsx';
import { eventStatus, formatDate } from '../utils/helpers.js';

function template(event) {
  if (!event) return '';
  const day = formatDate(event.start);
  const when = day === 'Today' ? 'today' : day === 'Tomorrow' ? 'tomorrow' : `on ${day}`;
  return `Going to ${event.title} ${when}, looking for someone to tag along!`;
}

export default function PlusOneModal({ open, onClose, defaultEventId, onPosted }) {
  const { events, addPlusOneRequest } = useApp();
  const options = useMemo(
    () => events.filter((e) => eventStatus(e) !== 'ended').sort((a, b) => a.start - b.start),
    [events],
  );

  const [eventId, setEventId] = useState('');
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState(false);

  // Reset the form each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    const initial = options.find((e) => e.id === defaultEventId) ?? options[0];
    setEventId(initial?.id ?? '');
    setNote(template(initial));
    setTouched(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultEventId]);

  const onSelect = (id) => {
    setEventId(id);
    if (!touched) setNote(template(options.find((e) => e.id === id)));
  };

  const valid = eventId && note.trim().length >= 10;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    addPlusOneRequest({ eventId, note: note.trim() });
    onPosted?.(eventId);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Post a Plus-One request"
      subtitle="Tell others where you're headed — someone's probably hoping to find a buddy too."
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Which event?</span>
          <select value={eventId} onChange={(e) => onSelect(e.target.value)} className="input">
            {options.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} — {formatDate(ev.start)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Your message
          </span>
          <textarea
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setTouched(true);
            }}
            rows={4}
            maxLength={220}
            className="input resize-none"
            placeholder="Going to the Hackathon this Saturday, looking for someone to tag along!"
          />
          <span className="mt-1 block text-right text-xs text-slate-400">{note.length}/220</span>
        </label>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={!valid} className="btn-primary">
            <Send className="h-4 w-4" /> Post request
          </button>
        </div>
      </form>
    </Modal>
  );
}
