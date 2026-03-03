// Session helpers — the only localStorage state still needed.
// All event data now lives on the backend canister.

const SESSION_KEY = "iiitb_session";

export interface IEvent {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  participants: bigint;
  purpose: string;
  venue: string;
  photoLink: string;
  organiser: string;
  poster: string; // blob-storage hash key
  posterName: string;
  adminOrder: string; // blob-storage hash key
  adminOrderName: string;
  createdAt: bigint;
  views: bigint;
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
