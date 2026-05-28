"use client";

import { useEffect, useState } from "react";

export interface LiveScanItem {
  id: string;
  source: string;
  title: string;
  snippet: string;
  capturedAt: string;
  sourceUrl: string;
}

export interface LiveScanState {
  loading: boolean;
  error: string | null;
  items: LiveScanItem[];
  /** "live" כש-Google מחובר באמת, "mock" אחרת. */
  mode: "live" | "mock" | null;
}

/**
 * שולפת אוטומטית סריקה טרייה מ-/api/scan בטעינת המסך —
 * כדי שהבית והחדשות יציגו את הנתונים האמיתיים של Shelly מ-Google
 * בלי שהיא תצטרך ללחוץ "סרקי עכשיו".
 */
export function useLiveScan(sources: string[]): LiveScanState {
  const [state, setState] = useState<LiveScanState>({
    loading: true,
    error: null,
    items: [],
    mode: null,
  });

  // מחרוזת יציבה לתלות useEffect (מונע ריצה חוזרת בכל רינדור)
  const key = sources.join(",");

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetch("/api/scan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sources: key.split(",") }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("scan failed"))))
      .then((data) => {
        if (cancelled) return;
        setState({
          loading: false,
          error: null,
          items: Array.isArray(data.items) ? data.items : [],
          mode: data.mode === "live" ? "live" : "mock",
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState({
          loading: false,
          error: "scan failed",
          items: [],
          mode: null,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return state;
}

/** סינון פריטים לפי מקור. */
export function itemsBySource(
  items: LiveScanItem[],
  source: string
): LiveScanItem[] {
  return items.filter((i) => i.source === source);
}
