"use client";

import { useState, useCallback } from "react";
import type { AiResponse } from "@/lib/ai/types";

/** Hook לקריאת /api/ai מתוך קומפוננטות לקוח. */
export function useAi() {
  const [loading, setLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [result, setResult] = useState<AiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (task: string, input: string, context?: string) => {
      setLoading(true);
      setActiveTask(task);
      setError(null);
      setResult(null);
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ task, input, context }),
        });
        if (!res.ok) throw new Error("AI request failed");
        const data = (await res.json()) as AiResponse;
        setResult(data);
        return data;
      } catch {
        setError("היצירה נכשלה. בדקי חיבור ונסי שוב.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setActiveTask(null);
  }, []);

  return { loading, activeTask, result, error, run, reset };
}
