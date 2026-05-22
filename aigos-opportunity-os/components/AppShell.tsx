"use client";

import { useState } from "react";
import Link from "next/link";
import { StoreProvider } from "@/lib/store";
import { Sidebar } from "./Sidebar";
import { Toaster } from "./Toaster";
import { Icon } from "./icons";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <Shell>{children}</Shell>
    </StoreProvider>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute bottom-0 right-0 top-0 h-full">
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-border bg-ink-soft/90 px-4 py-3 backdrop-blur lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-gradient text-white">
              <Icon name="sparkles" className="h-4 w-4" />
            </span>
            <span className="text-sm font-extrabold gradient-text">
              AI.GOS Opportunity OS
            </span>
          </Link>
          <button
            onClick={() => setDrawerOpen(true)}
            className="btn-soft p-2"
            aria-label="תפריט"
          >
            <Icon name="dashboard" className="h-5 w-5" />
          </button>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      <Toaster />
    </div>
  );
}
