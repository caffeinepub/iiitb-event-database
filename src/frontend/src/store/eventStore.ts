export interface IEvent {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  participants: number;
  purpose: string;
  venue: string;
  photoLink: string;
  organiser: string;
  posterId: string; // base64 data URL
  posterName: string;
  adminOrderId: string; // base64 data URL
  adminOrderName: string;
  createdAt: number;
  views: number;
}

const EVENTS_KEY = "iiitb_events";
const SESSION_KEY = "iiitb_session";

const SEED_EVENTS: IEvent[] = [
  {
    id: "seed-1",
    name: "TechFest 2025",
    startDate: "2025-01-15",
    endDate: "2025-01-17",
    participants: 350,
    purpose:
      "Annual technology festival showcasing student innovations, hackathons, competitions, and technical workshops for engineering students across Karnataka.",
    venue: "Auditorium",
    photoLink: "https://photos.google.com/iiitb-techfest-2025",
    organiser: "Student Technical Council",
    posterId: "",
    posterName: "",
    adminOrderId: "",
    adminOrderName: "",
    createdAt: Date.now() - 6 * 30 * 24 * 60 * 60 * 1000,
    views: 142,
  },
  {
    id: "seed-2",
    name: "Research Symposium",
    startDate: "2025-02-10",
    endDate: "2025-02-11",
    participants: 120,
    purpose:
      "Bi-annual research symposium featuring paper presentations, keynote lectures, and panel discussions on emerging technologies in AI, data science, and software systems.",
    venue: "Seminar Hall",
    photoLink: "https://photos.google.com/iiitb-research-symposium-2025",
    organiser: "Research & Innovation Cell",
    posterId: "",
    posterName: "",
    adminOrderId: "",
    adminOrderName: "",
    createdAt: Date.now() - 5 * 30 * 24 * 60 * 60 * 1000,
    views: 87,
  },
  {
    id: "seed-3",
    name: "Hackathon Spring 2025",
    startDate: "2025-03-05",
    endDate: "2025-03-06",
    participants: 200,
    purpose:
      "48-hour intensive coding hackathon challenging students to build innovative solutions for real-world problems in sustainability and smart infrastructure.",
    venue: "Innovation Lab",
    photoLink: "https://photos.google.com/iiitb-hackathon-spring-2025",
    organiser: "IEEE Student Chapter",
    posterId: "",
    posterName: "",
    adminOrderId: "",
    adminOrderName: "",
    createdAt: Date.now() - 4 * 30 * 24 * 60 * 60 * 1000,
    views: 215,
  },
  {
    id: "seed-4",
    name: "Alumni Meet 2025",
    startDate: "2025-04-20",
    endDate: "2025-04-20",
    participants: 450,
    purpose:
      "Annual alumni gathering to reconnect graduates with faculty, celebrate institutional milestones, and foster mentoring connections between current students and alumni.",
    venue: "Main Lawn",
    photoLink: "https://photos.google.com/iiitb-alumni-meet-2025",
    organiser: "Alumni Association IIITB",
    posterId: "",
    posterName: "",
    adminOrderId: "",
    adminOrderName: "",
    createdAt: Date.now() - 3 * 30 * 24 * 60 * 60 * 1000,
    views: 310,
  },
  {
    id: "seed-5",
    name: "Cultural Fest Utsav",
    startDate: "2025-05-02",
    endDate: "2025-05-03",
    participants: 500,
    purpose:
      "The flagship cultural festival celebrating diversity through music, dance, drama, art installations, and literary events, promoting creativity among the student community.",
    venue: "Open Air Theatre",
    photoLink: "https://photos.google.com/iiitb-utsav-2025",
    organiser: "Cultural Committee",
    posterId: "",
    posterName: "",
    adminOrderId: "",
    adminOrderName: "",
    createdAt: Date.now() - 2 * 30 * 24 * 60 * 60 * 1000,
    views: 489,
  },
  {
    id: "seed-6",
    name: "Graduation Ceremony 2025",
    startDate: "2025-06-28",
    endDate: "2025-06-28",
    participants: 600,
    purpose:
      "Formal convocation ceremony conferring degrees upon graduating students of the 2025 batch, with keynote address from industry leaders and felicitation of academic achievers.",
    venue: "Main Auditorium",
    photoLink: "https://photos.google.com/iiitb-graduation-2025",
    organiser: "Academic Affairs Office",
    posterId: "",
    posterName: "",
    adminOrderId: "",
    adminOrderName: "",
    createdAt: Date.now() - 1 * 30 * 24 * 60 * 60 * 1000,
    views: 612,
  },
];

export function getEvents(): IEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) {
      saveEvents(SEED_EVENTS);
      return SEED_EVENTS;
    }
    const parsed = JSON.parse(raw) as IEvent[];
    return parsed;
  } catch {
    return SEED_EVENTS;
  }
}

export function saveEvents(events: IEvent[]): void {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export function addEvent(
  event: Omit<IEvent, "id" | "createdAt" | "views">,
): IEvent {
  const newEvent: IEvent = {
    ...event,
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: Date.now(),
    views: 0,
  };
  const events = getEvents();
  events.push(newEvent);
  saveEvents(events);
  return newEvent;
}

export function updateEvent(id: string, updates: Partial<IEvent>): void {
  const events = getEvents();
  const idx = events.findIndex((e) => e.id === id);
  if (idx !== -1) {
    events[idx] = { ...events[idx], ...updates };
    saveEvents(events);
  }
}

export function deleteEvent(id: string): void {
  const events = getEvents().filter((e) => e.id !== id);
  saveEvents(events);
}

export function getSession(): { role: "admin" | "user" } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { role: "admin" | "user" };
  } catch {
    return null;
  }
}

export function setSession(role: "admin" | "user"): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ role }));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function recordView(_id: string): void {
  // Alias for compatibility
  incrementViewAndGet(_id);
}

export function incrementViewAndGet(id: string): IEvent | null {
  const events = getEvents();
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  events[idx] = { ...events[idx], views: events[idx].views + 1 };
  saveEvents(events);
  return events[idx];
}
