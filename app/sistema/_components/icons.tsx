import type { ModuleIcon } from "../_data/modules";

export type IconName =
  ModuleIcon | "search" | "menu" | "close" | "logout" | "lock";

// Simple stroke icons drawn for the system (24×24 grid).
const PATHS: Record<IconName, string[]> = {
  home: ["M3 10.5 12 3l9 7.5", "M5 9.5V21h5v-6h4v6h5V9.5"],
  members: [
    "M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20",
    "M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
    "M20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35",
    "M15.5 4.15a3.5 3.5 0 0 1 0 6.7",
  ],
  family: [
    "M7 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
    "M17 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
    "M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    "M3 21v-6a3 3 0 0 1 3-3h2",
    "M21 21v-6a3 3 0 0 0-3-3h-2",
    "M9 21v-2.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2V21",
  ],
  cash: [
    "M3 6.5h18v11H3z",
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    "M6 9.5v.01M18 14.5v.01",
  ],
  receipt: ["M6 3h12v18l-3-2-3 2-3-2-3 2V3Z", "M9 8h6M9 12h6M9 16h3"],
  pool: [
    "M3 18c1.5 1.2 3 1.2 4.5 0s3-1.2 4.5 0 3 1.2 4.5 0 3-1.2 4.5 0",
    "M8 15V5a2 2 0 0 1 4 0",
    "M16 15V5a2 2 0 0 0-4 0",
    "M8 9h8M8 13h8",
  ],
  staff: [
    "M4 7h16v13H4z",
    "M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2",
    "M4 13h16",
  ],
  disciplines: [
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
    "M3.5 9.5c4 1 8.5 4.5 10 11",
    "M8 3.8c1.5 3.7 5.5 6.7 12.7 6.2",
    "M15 3.6c-2 3.4-3.2 9.4-1.7 16.9",
  ],
  reports: ["M4 20V4", "M4 20h16", "M8 16v-4M12 16V8M16 16v-6"],
  settings: [
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    "M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z",
  ],
  search: ["M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z", "m20 20-3.5-3.5"],
  menu: ["M4 6h16M4 12h16M4 18h16"],
  close: ["M6 6l12 12M18 6 6 18"],
  logout: [
    "M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3",
    "M10 17l-5-5 5-5",
    "M5 12h11",
  ],
  lock: ["M6 11h12v10H6z", "M8.5 11V7.5a3.5 3.5 0 0 1 7 0V11"],
};

interface IconProps {
  name: IconName;
  className?: string;
}

export function Icon({ name, className = "sys-icon" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
