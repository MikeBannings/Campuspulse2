import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Chatbot from './components/Chatbot.jsx';
import Toaster from './components/Toaster.jsx';
import LiveEvents from './pages/LiveEvents.jsx';
import Discovery from './pages/Discovery.jsx';
import PlusOne from './pages/PlusOne.jsx';
import MyRsvps from './pages/MyRsvps.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="aurora flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LiveEvents />} />
          <Route path="/discovery" element={<Discovery />} />
          <Route path="/plus-one" element={<PlusOne />} />
          <Route path="/rsvps" element={<MyRsvps />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-200/70 py-6 text-center text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
        CampusPulse · Find your people, find your events.
      </footer>
      <Chatbot />
      <Toaster />
    </div>
  );
}
