"use client";

import { useState, useEffect, useCallback } from "react";
import { DEFAULT_TONE, TONE_STORAGE_KEY, toneToContext } from "@/lib/tone";
import type { ToneProfile } from "@/lib/types";

/** Hook לניהול פרופיל הטון של Shelly (נשמר ב-localStorage). */
export function useToneProfile() {
  const [tone, setTone] = useState<ToneProfile>(DEFAULT_TONE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TONE_STORAGE_KEY);
      if (raw) setTone({ ...DEFAULT_TONE, ...JSON.parse(raw) });
    } catch {
      /* localStorage לא זמין — נשארים עם ברירת המחדל */
    }
    setLoaded(true);
  }, []);

  const save = useCallback((next: ToneProfile) => {
    setTone(next);
    try {
      localStorage.setItem(TONE_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* מתעלמים בשקט */
    }
  }, []);

  const reset = useCallback(() => {
    setTone(DEFAULT_TONE);
    try {
      localStorage.removeItem(TONE_STORAGE_KEY);
    } catch {
      /* מתעלמים בשקט */
    }
  }, []);

  /** טקסט ההקשר לשליחה למנוע ה-AI. */
  const context = toneToContext(tone);

  return { tone, loaded, save, reset, context };
}
