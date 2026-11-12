import type { SystemState } from "./state";

// The demo keeps its data in the visitor's own browser (localStorage), so
// someone trying it over several days finds what they left. Nothing leaves
// the browser and every visitor has a separate copy.

export const DEMO_STORAGE_KEY = "fda-sistema-demo";

// Bump it when the seed or the shape of SystemState changes, so browsers
// holding older data start over instead of breaking.
export const DEMO_DATA_VERSION = 1;

interface StoredDemo {
  version: number;
  state: SystemState;
}

// Saved data is only trusted if it was written by this version and has every
// part the current state has.
function isCurrent(value: unknown, fresh: SystemState): value is StoredDemo {
  if (typeof value !== "object" || value === null) return false;
  if (!("version" in value) || value.version !== DEMO_DATA_VERSION)
    return false;
  if (
    !("state" in value) ||
    typeof value.state !== "object" ||
    value.state === null
  ) {
    return false;
  }
  const saved = value.state;
  return Object.keys(fresh).every((key) => key in saved);
}

export function loadDemoState(fresh: SystemState): SystemState | null {
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isCurrent(parsed, fresh) ? parsed.state : null;
  } catch {
    return null;
  }
}

// Returns false when the browser refuses to store it (private mode, full
// storage), so the demo can say its changes will not be kept.
export function saveDemoState(state: SystemState): boolean {
  try {
    const stored: StoredDemo = { version: DEMO_DATA_VERSION, state };
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(stored));
    return true;
  } catch {
    return false;
  }
}

export function clearDemoState(): void {
  try {
    window.localStorage.removeItem(DEMO_STORAGE_KEY);
  } catch {
    // Nothing stored or storage blocked: there is nothing to clear.
  }
}
