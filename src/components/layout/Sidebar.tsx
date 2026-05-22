"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

/** סרגל הניווט הראשי — בצד ימין (RTL). */
export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* שכבת כיסוי במובייל */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[268px] flex-col border-l border-line bg-surface/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        {/* לוגו */}
        <div className="flex items-center gap-3 border-b border-line px-5 py-5">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            <Icon name="Sparkles" className="size-6" />
          </div>
          <div>
            <div className="font-display text-lg font-extrabold leading-none tracking-tight">
              <span className="so-gradient-text">SHELLY OG</span>
            </div>
            <div className="mt-1 text-[11px] text-ink-mute">מרכז השליטה</div>
          </div>
        </div>

        {/* ניווט */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item, i) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                  active
                    ? "bg-brand-gradient text-white shadow-glow"
                    : "text-ink-soft hover:bg-surface-2 hover:text-ink"
                )}
              >
                <span
                  className={cn(
                    "flex size-5 items-center justify-center",
                    !active && "text-ink-mute group-hover:text-purple-soft"
                  )}
                >
                  <Icon name={item.icon} className="size-[18px]" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold leading-tight">
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "block text-[11px] leading-tight",
                      active ? "text-white/70" : "text-ink-mute"
                    )}
                  >
                    {item.description}
                  </span>
                </span>
                <span className="text-[10px] font-bold text-white/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* פוטר — מצב נתונים */}
        <div className="border-t border-line p-4">
          <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2.5">
            <span className="size-2 animate-pulse-dot rounded-full bg-lime" />
            <div className="text-[11px] leading-tight">
              <div className="font-semibold text-ink-soft">מצב הדגמה (Mock)</div>
              <div className="text-ink-mute">חברי Google בהגדרות</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
