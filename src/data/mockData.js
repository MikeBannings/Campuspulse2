// ---------------------------------------------------------------------------
// Mock data for the CampusPulse demo.
// Dates are generated relative to "now" so the feed always feels live.
// ---------------------------------------------------------------------------

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Returns a Date at (today + dayOffset) with the given hour/minute.
function at(dayOffset, hour, minute = 0) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return new Date(d.getTime() + dayOffset * DAY);
}

// Next Saturday (or today if it is Saturday).
function nextSaturdayOffset() {
  const day = new Date().getDay(); // 0 = Sun ... 6 = Sat
  return (6 - day + 7) % 7;
}

export const CATEGORIES = [
  { id: 'tech', label: 'Technical / Coding', short: 'Tech', icon: 'Code2', color: 'violet' },
  { id: 'sports', label: 'Sports / Fitness', short: 'Sports', icon: 'Trophy', color: 'emerald' },
  { id: 'cultural', label: 'Cultural', short: 'Cultural', icon: 'Music', color: 'pink' },
  { id: 'workshop', label: 'Workshops', short: 'Workshop', icon: 'Wrench', color: 'amber' },
  { id: 'seminar', label: 'Seminars', short: 'Seminar', icon: 'Mic', color: 'sky' },
];

export const INTEREST_TAGS = [
  { id: 'python', label: 'Python', category: 'tech' },
  { id: 'webdev', label: 'Web Dev', category: 'tech' },
  { id: 'ai-ml', label: 'AI / ML', category: 'tech' },
  { id: 'hackathons', label: 'Hackathons', category: 'tech' },
  { id: 'football', label: 'Football', category: 'sports' },
  { id: 'basketball', label: 'Basketball', category: 'sports' },
  { id: 'running', label: 'Running', category: 'sports' },
  { id: 'yoga', label: 'Yoga', category: 'sports' },
  { id: 'dance', label: 'Dance', category: 'cultural' },
  { id: 'music', label: 'Music', category: 'cultural' },
  { id: 'theatre', label: 'Theatre', category: 'cultural' },
  { id: 'photography', label: 'Photography', category: 'cultural' },
  { id: 'entrepreneurship', label: 'Entrepreneurship', category: 'seminar' },
  { id: 'fintech', label: 'Fintech', category: 'seminar' },
  { id: 'public-speaking', label: 'Public Speaking', category: 'seminar' },
  { id: 'design', label: 'UI/UX Design', category: 'workshop' },
  { id: 'robotics', label: 'Robotics', category: 'workshop' },
  { id: 'research', label: 'Research', category: 'seminar' },
];

export const EVENTS = [
  {
    id: 'e1',
    title: 'PulseHack 24h Hackathon',
    category: 'tech',
    description:
      'Build something real in 24 hours. Teams of up to 4, mentors from industry, and prizes worth ₹1,50,000. Beginners welcome — we run a team-formation session at the start.',
    organizer: 'Coding Club',
    location: 'Innovation Lab, Block C',
    start: at(nextSaturdayOffset(), 9, 0),
    durationHrs: 24,
    seats: 120,
    seatsLeft: 34,
    price: 0,
    featured: true,
    tags: ['python', 'webdev', 'ai-ml', 'hackathons'],
    gradient: 'from-violet-500 via-fuchsia-500 to-pink-500',
  },
  {
    id: 'e2',
    title: 'Intro to LLMs & Prompt Engineering',
    category: 'workshop',
    description:
      'A hands-on 2-hour workshop: how large language models work, how to prompt them well, and how to wire one into a small Python app. Bring a laptop.',
    organizer: 'AI/ML Society',
    location: 'Seminar Hall 2',
    // Started 30 minutes ago, so the demo always has one "live now" event.
    start: new Date(Math.max(new Date().setHours(0, 0, 0, 0), Date.now() - 30 * 60 * 1000)),
    durationHrs: 2,
    seats: 60,
    seatsLeft: 12,
    price: 0,
    featured: false,
    tags: ['python', 'ai-ml'],
    gradient: 'from-sky-500 via-cyan-500 to-teal-400',
  },
  {
    id: 'e3',
    title: 'Inter-Dept Football League — Match Day 3',
    category: 'sports',
    description:
      'CSE vs ECE under the floodlights. Come cheer, or sign up to play for your department in the next round. Free energy drinks for the first 50 spectators.',
    organizer: 'Sports Committee',
    location: 'Main Football Ground',
    start: at(1, 17, 30),
    durationHrs: 2,
    seats: 300,
    seatsLeft: 188,
    price: 0,
    featured: false,
    tags: ['football', 'running'],
    gradient: 'from-emerald-500 via-green-500 to-lime-400',
  },
  {
    id: 'e4',
    title: 'Rhythm Night: Open Mic & Dance Showcase',
    category: 'cultural',
    description:
      'Singers, dancers, poets, and bands take the stage. Sign up to perform or just show up and vibe. Food stalls from 6 PM.',
    organizer: 'Cultural Club',
    location: 'Open Air Amphitheatre',
    start: at(2, 18, 0),
    durationHrs: 3,
    seats: 400,
    seatsLeft: 142,
    price: 50,
    featured: true,
    tags: ['dance', 'music', 'theatre'],
    gradient: 'from-pink-500 via-rose-500 to-orange-400',
  },
  {
    id: 'e5',
    title: 'From Campus to Cap Table: Startup Founders Panel',
    category: 'seminar',
    description:
      'Three alumni founders share how they went from dorm-room ideas to funded startups — fundraising, first hires, and the mistakes they would not repeat.',
    organizer: 'E-Cell',
    location: 'Auditorium',
    start: at(3, 15, 0),
    durationHrs: 1.5,
    seats: 250,
    seatsLeft: 97,
    price: 0,
    featured: false,
    tags: ['entrepreneurship', 'fintech', 'public-speaking'],
    gradient: 'from-amber-500 via-orange-500 to-red-500',
  },
  {
    id: 'e6',
    title: 'UI/UX Design Sprint Workshop',
    category: 'workshop',
    description:
      'Go from a blank Figma file to a clickable prototype in half a day. Learn research, wireframing, and usability testing with a real campus problem as the brief.',
    organizer: 'Design Collective',
    location: 'Design Studio, Block A',
    start: at(4, 10, 0),
    durationHrs: 4,
    seats: 40,
    seatsLeft: 6,
    price: 150,
    featured: false,
    tags: ['design', 'webdev', 'photography'],
    gradient: 'from-indigo-500 via-blue-500 to-cyan-400',
  },
  {
    id: 'e7',
    title: 'Sunrise Yoga & 5K Fun Run',
    category: 'sports',
    description:
      'Start the weekend right: a gentle 30-minute yoga flow followed by an easy, all-levels 5K around the campus loop. Walkers welcome.',
    organizer: 'Fitness Club',
    location: 'Campus Lawn',
    start: at(nextSaturdayOffset(), 6, 30),
    durationHrs: 1.5,
    seats: 80,
    seatsLeft: 41,
    price: 0,
    featured: false,
    tags: ['yoga', 'running'],
    gradient: 'from-teal-500 via-emerald-500 to-green-400',
  },
  {
    id: 'e8',
    title: 'Research Talk: Pursuing an MS in the US',
    category: 'seminar',
    description:
      'Alumni at top US universities walk through applications, SOPs, research profiles, funding, and timelines. Q&A at the end.',
    organizer: 'Higher Studies Cell',
    location: 'Seminar Hall 1',
    start: at(5, 16, 0),
    durationHrs: 1.5,
    seats: 150,
    seatsLeft: 73,
    price: 0,
    featured: false,
    tags: ['research', 'public-speaking'],
    gradient: 'from-slate-600 via-slate-500 to-sky-500',
  },
];

export const CLUBS = [
  {
    id: 'c1',
    name: 'Coding Club',
    category: 'tech',
    tagline: 'Hackathons, DSA circles, and open-source sprints.',
    members: 842,
    recentUpdate: 'PulseHack registrations are open — 34 seats left.',
    deadline: at(6, 23, 59),
    tags: ['python', 'webdev', 'hackathons'],
    gradient: 'from-violet-500 to-fuchsia-500',
  },
  {
    id: 'c2',
    name: 'Cultural Club',
    category: 'cultural',
    tagline: 'Dance, music, theatre, and everything in between.',
    members: 615,
    recentUpdate: 'Auditions for the annual fest showcase start next week.',
    deadline: at(9, 23, 59),
    tags: ['dance', 'music', 'theatre'],
    gradient: 'from-pink-500 to-orange-400',
  },
  {
    id: 'c3',
    name: 'Sports Committee',
    category: 'sports',
    tagline: 'Football, basketball, athletics — all skill levels.',
    members: 1104,
    recentUpdate: 'Inter-dept football league is live; walk-in team slots available.',
    deadline: at(12, 23, 59),
    tags: ['football', 'basketball', 'running'],
    gradient: 'from-emerald-500 to-lime-400',
  },
  {
    id: 'c4',
    name: 'E-Cell',
    category: 'seminar',
    tagline: 'Turn ideas into ventures with mentors and funding.',
    members: 389,
    recentUpdate: 'Founders Panel on Thursday. Pitch-deck clinic opens soon.',
    deadline: at(4, 23, 59),
    tags: ['entrepreneurship', 'fintech', 'public-speaking'],
    gradient: 'from-amber-500 to-red-500',
  },
];

// Each profile has `eventIds` — the events they are looking for a buddy for.
export const BUDDIES = [
  {
    id: 'b1',
    name: 'Aarav Mehta',
    handle: '@aarav.codes',
    year: '2nd Year',
    branch: 'CSE',
    interests: ['python', 'hackathons', 'ai-ml'],
    note: 'First hackathon and I know nobody in the venue. Looking for someone to team up with — happy to do the backend!',
    eventId: 'e1',
    avatarColor: 'from-violet-500 to-indigo-500',
  },
  {
    id: 'b2',
    name: 'Diya Nair',
    handle: '@diya.designs',
    year: '3rd Year',
    branch: 'ISE',
    interests: ['design', 'webdev', 'hackathons'],
    note: 'Need a dev partner for PulseHack — I can handle UI/UX and the pitch deck. Open to any idea!',
    eventId: 'e1',
    avatarColor: 'from-pink-500 to-rose-500',
  },
  {
    id: 'b3',
    name: 'Kabir Singh',
    handle: '@kabir.fc',
    year: '1st Year',
    branch: 'ECE',
    interests: ['football', 'running'],
    note: 'New here and want to catch the football match — anyone wanna go together and grab food after?',
    eventId: 'e3',
    avatarColor: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'b4',
    name: 'Meera Iyer',
    handle: '@meera.moves',
    year: '2nd Year',
    branch: 'EEE',
    interests: ['dance', 'music', 'theatre'],
    note: 'Going to Rhythm Night but my friends have exams. Would love a buddy — I might perform too!',
    eventId: 'e4',
    avatarColor: 'from-amber-500 to-pink-500',
  },
  {
    id: 'b5',
    name: 'Rohan Kapoor',
    handle: '@rohan.builds',
    year: '4th Year',
    branch: 'CSE',
    interests: ['entrepreneurship', 'fintech', 'ai-ml'],
    note: 'Attending the founders panel and then networking. Want a second pair of ears to compare notes with.',
    eventId: 'e5',
    avatarColor: 'from-sky-500 to-blue-600',
  },
];

// Seed notifications for the bell dropdown.
export const SEED_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Seats filling fast',
    body: 'UI/UX Design Sprint Workshop has only 6 seats left.',
    time: '10 min ago',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Plus-One match',
    body: 'Diya Nair is also going to PulseHack and is looking for a dev partner.',
    time: '1 hr ago',
    unread: true,
  },
  {
    id: 'n3',
    title: 'New club update',
    body: 'E-Cell posted: Pitch-deck clinic opens soon.',
    time: 'Yesterday',
    unread: false,
  },
];

// The signed-in demo user — edit these to personalise the demo.
export const CURRENT_USER = {
  name: 'Alex Rao',
  handle: '@alex.rao',
  year: '3rd Year',
  branch: 'CSE',
  initials: 'AR',
};
