"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui";
import { formatDateHe } from "@/lib/utils";
import { cn } from "@/lib/utils";

/** סרגל עליון — קבוע בכל עמוד. כולל כפתור בית קבוע. */
export function TopBar({ onMenu }: { onMenu: () => void }) {
  const today = formatDateHe(new Date().toISOString());
  const pathname = usePathname();
  const atHome = pathname === "/";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-base/80 px-4 py-3 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-2.5">
        <button
          onClick={onMenu}
          className="flex size-9 items-center justify-center rounded-xl border border-line-strong bg-surface-2 text-ink-soft lg:hidden"
          aria-label="תפריט"
        >
          <Icon name="Menu" className="size-5" />
        </button>

        {/* כפתור בית קבוע — מכל עמוד */}
        <Link
          href="/"
          aria-label="חזרה לבית"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all",
            atHome
              ? "border-purple/40 bg-purple/10 text-purple-soft"
              : "border-line-strong bg-surface-2 text-ink-soft hover:border-purple/50 hover:text-ink"
          )}
        >
          <Icon name="Home" className="size-4" />
          <span className="hidden sm:inline">בית</span>
        </Link>

        <div className="hidden items-center gap-2 text-sm text-ink-mute md:flex">
          <Icon name="CalendarDays" className="size-4 text-purple-soft" />
          <span>{today}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/ask"
          className="inline-flex items-center gap-1.5 rounded-xl border border-line-strong bg-surface-2 px-3 py-2 text-xs font-semibold text-ink-soft transition-all hover:border-purple/50 hover:text-ink"
        >
          <Icon name="MessagesSquare" className="size-4" />
          <span className="hidden sm:inline">שאלי אותי</span>
        </Link>
        <Link href="/now" className="so-btn-primary !px-3 !py-2 text-xs">
          <Icon name="Target" className="size-4" />
          <span className="hidden sm:inline">מה לעשות עכשיו</span>
        </Link>
        <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-2.5 py-1.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-brand-gradient text-xs font-bold text-white">
            ש
          </div>
          <span className="hidden text-xs font-semibold text-ink-soft lg:block">
            Shelly Or Gisser
          </span>
        </div>
      </div>
    </header>
  );
}
