// The demo runs on a fixed "today" so the mock data is the same on the server
// and on the client. Every date calculation goes through this file; the real
// system will use the server clock instead.

export const DEMO_TODAY = "2026-11-11";

const DAY_MS = 24 * 60 * 60 * 1000;

export function today(): string {
  return DEMO_TODAY;
}

// Current time of day on the demo date, for actions the user triggers (a
// payment, a gate check). Only call it from event handlers, never while
// rendering, or the server and the client would disagree.
export function nowIso(): string {
  const time = new Date().toTimeString().slice(0, 8);
  return `${DEMO_TODAY}T${time}`;
}

function toUtc(date: string): number {
  const [year, month, day] = date.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((toUtc(to) - toUtc(from)) / DAY_MS);
}

export function addDays(date: string, days: number): string {
  return new Date(toUtc(date) + days * DAY_MS).toISOString().slice(0, 10);
}

// Dates are ISO strings, so comparing the date part as text is enough.
export function isBefore(date: string, other: string): boolean {
  return date.slice(0, 10) < other.slice(0, 10);
}
