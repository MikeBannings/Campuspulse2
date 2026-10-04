import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  BUDDIES,
  CLUBS,
  CURRENT_USER,
  EVENTS,
  SEED_NOTIFICATIONS,
} from '../data/mockData.js';

const AppContext = createContext(null);

// Small helper: state that mirrors into localStorage so the demo feels persistent.
function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable — ignore */
    }
  }, [key, value]);
  return [value, setValue];
}

export function AppProvider({ children }) {
  // ---- theme -----------------------------------------------------------
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  );
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('campuspulse-theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);
  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);

  // ---- core data (events' seat counts are mutable) -----------------------
  const [events, setEvents] = useState(EVENTS);
  const [clubs] = useState(CLUBS);
  const [buddies, setBuddies] = useState(BUDDIES);

  // ---- persisted user state ---------------------------------------------
  const [interests, setInterests] = usePersistentState('campuspulse-interests', ['python', 'hackathons', 'ai-ml', 'football']);
  const [rsvps, setRsvps] = usePersistentState('campuspulse-rsvps', []);
  const [followedClubs, setFollowedClubs] = usePersistentState('campuspulse-clubs', []);
  const [connections, setConnections] = usePersistentState('campuspulse-connections', []);

  // ---- notifications ------------------------------------------------------
  const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);
  const pushNotification = useCallback((title, body) => {
    setNotifications((list) => [
      { id: `n${Date.now()}`, title, body, time: 'Just now', unread: true },
      ...list,
    ]);
  }, []);
  const markAllRead = useCallback(
    () => setNotifications((list) => list.map((n) => ({ ...n, unread: false }))),
    [],
  );

  // ---- toasts -------------------------------------------------------------
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  // ---- actions --------------------------------------------------------------
  const toggleInterest = useCallback(
    (id) => setInterests((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])),
    [setInterests],
  );

  const isRsvped = useCallback((eventId) => rsvps.includes(eventId), [rsvps]);

  const toggleRsvp = useCallback(
    (eventId) => {
      const event = events.find((e) => e.id === eventId);
      if (!event) return;
      if (rsvps.includes(eventId)) {
        setRsvps((r) => r.filter((x) => x !== eventId));
        setEvents((list) =>
          list.map((e) => (e.id === eventId ? { ...e, seatsLeft: Math.min(e.seats, e.seatsLeft + 1) } : e)),
        );
        toast(`RSVP cancelled for ${event.title}`, 'info');
        return;
      }
      if (event.seatsLeft <= 0) {
        toast('Sorry, this event is full.', 'error');
        return;
      }
      setRsvps((r) => [...r, eventId]);
      setEvents((list) => list.map((e) => (e.id === eventId ? { ...e, seatsLeft: e.seatsLeft - 1 } : e)));
      toast(`You're in! RSVP confirmed for ${event.title}`);
      pushNotification('RSVP confirmed', `You're going to ${event.title}.`);
    },
    [events, rsvps, setRsvps, toast, pushNotification],
  );

  const toggleFollowClub = useCallback(
    (clubId) => {
      const club = clubs.find((c) => c.id === clubId);
      if (!club) return;
      if (followedClubs.includes(clubId)) {
        setFollowedClubs((l) => l.filter((x) => x !== clubId));
        toast(`Unfollowed ${club.name}`, 'info');
      } else {
        setFollowedClubs((l) => [...l, clubId]);
        toast(`Following ${club.name} — you'll get their updates`);
      }
    },
    [clubs, followedClubs, setFollowedClubs, toast],
  );

  const connectWithBuddy = useCallback(
    (buddyId) => {
      const buddy = buddies.find((b) => b.id === buddyId);
      if (!buddy || connections.includes(buddyId)) return;
      setConnections((c) => [...c, buddyId]);
      toast(`Request sent to ${buddy.name}`);
    },
    [buddies, connections, setConnections, toast],
  );

  const addPlusOneRequest = useCallback(
    ({ eventId, note }) => {
      const newBuddy = {
        id: `b${Date.now()}`,
        name: CURRENT_USER.name,
        handle: CURRENT_USER.handle,
        year: CURRENT_USER.year,
        branch: CURRENT_USER.branch,
        interests: interests.slice(0, 4),
        note,
        eventId,
        avatarColor: 'from-brand-500 to-pulse-500',
        isMine: true,
      };
      setBuddies((list) => [newBuddy, ...list]);
      toast('Your Plus-One request is live!');
    },
    [interests, toast],
  );

  const value = useMemo(
    () => ({
      user: CURRENT_USER,
      theme,
      toggleTheme,
      events,
      clubs,
      buddies,
      interests,
      toggleInterest,
      setInterests,
      rsvps,
      isRsvped,
      toggleRsvp,
      followedClubs,
      toggleFollowClub,
      connections,
      connectWithBuddy,
      addPlusOneRequest,
      notifications,
      markAllRead,
      toasts,
      toast,
    }),
    [
      theme,
      toggleTheme,
      events,
      clubs,
      buddies,
      interests,
      toggleInterest,
      setInterests,
      rsvps,
      isRsvped,
      toggleRsvp,
      followedClubs,
      toggleFollowClub,
      connections,
      connectWithBuddy,
      addPlusOneRequest,
      notifications,
      markAllRead,
      toasts,
      toast,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
