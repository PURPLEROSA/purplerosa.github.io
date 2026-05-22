"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

/** מעטפת האפליקציה — סרגל צד + סרגל עליון + תוכן. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
        <footer className="border-t border-line px-4 py-5 text-center text-xs text-ink-mute lg:px-8">
          SHELLY OG · מרכז שליטה אישי לתוכן ו-AI · נבנה כ-Prototype להדגמת מוצר
        </footer>
      </div>
    </div>
  );
}
