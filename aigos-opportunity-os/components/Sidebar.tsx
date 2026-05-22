"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { Icon } from "./icons";

const NAV = [
  { href: "/dashboard", label: "דשבורד", icon: "dashboard" },
  { href: "/opportunities", label: "תיבת הזדמנויות", icon: "inbox" },
  { href: "/contacts", label: "אנשי קשר", icon: "contacts" },
  { href: "/followups", label: "ראדאר פולואפים", icon: "radar" },
  { href: "/prices", label: "זיכרון מחירים", icon: "price" },
  { href: "/generator", label: "מחולל הזדמנויות", icon: "generator" },
  { href: "/settings", label: "הגדרות", icon: "settings" },
  { href: "/setup", label: "חיבור Google", icon: "plug" },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { connection, opportunities, followUps } = useStore();

  const openCount = opportunities.filter(
    (o) => !["Won", "Lost", "Closed"].includes(o.status),
  ).length;
  const pendingFollowUps = followUps.filter(
    (f) => f.status === "Pending",
  ).length;

  const badgeFor = (href: string) => {
    if (href === "/opportunities") return openCount;
    if (href === "/followups") return pendingFollowUps;
    return null;
  };

  return (
    <aside className="flex h-full w-64 flex-col border-l border-ink-border bg-ink-soft/80 backdrop-blur">
      {/* Logo */}
      <div className="border-b border-ink-border p-4">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
            <Icon name="sparkles" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-extrabold leading-tight gradient-text">
              AI.GOS
            </p>
            <p className="text-[11px] leading-tight text-slate-400">
              Opportunity OS
            </p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const badge = badgeFor(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-soft text-white"
                  : "text-slate-400 hover:bg-ink-raised/70 hover:text-slate-200"
              }`}
            >
              <span
                className={
                  active ? "text-brand-pink" : "text-slate-500"
                }
              >
                <Icon name={item.icon} className="h-[18px] w-[18px]" />
              </span>
              <span className="flex-1">{item.label}</span>
              {badge ? (
                <span className="rounded-full bg-ink-raised px-1.5 text-[11px] font-bold text-slate-300">
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Status */}
      <div className="border-t border-ink-border p-3">
        <Link
          href="/setup"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-xl border border-ink-border bg-ink-card p-2.5 text-xs"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              connection.demoMode
                ? "bg-accent-amber animate-pulse-soft"
                : "bg-accent-green"
            }`}
          />
          <span className="flex-1 text-slate-300">
            {connection.demoMode ? "מצב דמו פעיל" : "מחובר ל-Google"}
          </span>
          <Icon name="arrow" className="h-3.5 w-3.5 text-slate-500" />
        </Link>
      </div>
    </aside>
  );
}
