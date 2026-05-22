// Lightweight inline icon set - no external icon dependency.

const PATHS: Record<string, string> = {
  dashboard:
    "M4 13h7V4H4v9zm0 7h7v-5H4v5zm9 0h7V11h-7v9zm0-16v5h7V4h-7z",
  inbox:
    "M4 13h4l2 3h4l2-3h4M4 13l2.5-7h11L20 13M4 13v5a2 2 0 002 2h12a2 2 0 002-2v-5",
  contacts:
    "M17 20h5v-1a4 4 0 00-4-4M9 11a4 4 0 100-8 4 4 0 000 8zm0 2a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zm6-2a3 3 0 100-6",
  radar:
    "M12 12v.01M12 2a10 10 0 100 20M12 7a5 5 0 015 5M12 2a10 10 0 0110 10",
  price:
    "M20 12l-8 8-9-9V4h7l10 10-0 0zM7.5 7.5h.01",
  generator:
    "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z",
  settings:
    "M12 15a3 3 0 100-6 3 3 0 000 6zm7.4-3a7.4 7.4 0 00-.1-1.2l2-1.6-2-3.4-2.4 1a7.3 7.3 0 00-2-1.2l-.4-2.6H9.5l-.4 2.6a7.3 7.3 0 00-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 000 2.4l-2 1.6 2 3.4 2.4-1a7.3 7.3 0 002 1.2l.4 2.6h4.9l.4-2.6a7.3 7.3 0 002-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z",
  plug:
    "M9 7V3m6 4V3M7 7h10v4a5 5 0 01-5 5 5 5 0 01-5-5V7zm5 14v-5",
  mail:
    "M4 6h16v12H4V6zm0 0l8 7 8-7",
  calendar:
    "M4 6h16v14H4V6zm0 4h16M8 3v4m8-4v4",
  check: "M4 12l5 5L20 6",
  clock: "M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z",
  fire:
    "M12 2s5 4 5 9a5 5 0 01-10 0c0-2 1-3 1-3s1 2 2 2 0-5 2-8z",
  close: "M6 6l12 12M18 6L6 18",
  external: "M14 4h6v6M20 4l-9 9M19 13v6H5V5h6",
  arrow: "M9 6l6 6-6 6",
  sparkles:
    "M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z",
  alert: "M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z",
  money:
    "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  plus: "M12 5v14M5 12h14",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0",
  briefcase:
    "M4 8h16v12H4V8zm5 0V5h6v3M4 13h16",
  edit: "M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4",
};

interface IconProps {
  name: keyof typeof PATHS | string;
  className?: string;
}

export function Icon({ name, className = "h-5 w-5" }: IconProps) {
  const d = PATHS[name] ?? PATHS.dashboard;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
