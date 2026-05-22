/* =============================================================
 * POST /api/ask — "שאלי את SHELLY OG"
 * עונה על שאלות חופשיות על בסיס כל המידע שבאפליקציה:
 * רעיונות, טרנדים, פרויקטים, הזדמנויות, ספרייה, חדשות, דוח שבועי.
 * ============================================================= */

import { NextResponse } from "next/server";
import {
  mockIdeas,
  mockTrends,
  mockProjects,
  mockOpportunities,
  mockLibrary,
  mockNextActions,
  mockWeeklyReviews,
  mockNews,
} from "@/lib/mock-data";

export const runtime = "nodejs";

interface Source {
  label: string;
  title: string;
  screen: string;
}

interface KnowledgeItem {
  typeLabel: string;
  title: string;
  text: string;
  screen: string;
}

const STOPWORDS = new Set([
  "מה", "איך", "למה", "הכי", "יש", "לי", "את", "של", "על", "עם", "אני",
  "זה", "לא", "כן", "או", "גם", "הוא", "היא", "אבל", "כל", "מי", "שלי",
  "צריך", "צריכה", "האם", "כמה", "איזה", "איזו", "בבקשה", "תגידי", "אפשר",
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^֐-׿a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

/** בונה את "בסיס הידע" מכל מקורות המידע באפליקציה. */
function buildKnowledge(): KnowledgeItem[] {
  const k: KnowledgeItem[] = [];
  mockIdeas.forEach((i) =>
    k.push({
      typeLabel: "רעיון",
      title: i.title,
      text: `${i.title} ${i.description} ${i.tags.join(" ")} ${i.recommendedAction}`,
      screen: "/ideas",
    })
  );
  mockTrends.forEach((t) =>
    k.push({
      typeLabel: "טרנד",
      title: t.title,
      text: `${t.title} ${t.summary} ${t.whyItMatters} ${t.shellyPOV}`,
      screen: "/trends",
    })
  );
  mockProjects.forEach((p) =>
    k.push({
      typeLabel: "פרויקט",
      title: p.name,
      text: `${p.name} ${p.summary} ${p.nextStep} ${p.contentOpportunities.join(" ")}`,
      screen: "/projects",
    })
  );
  mockOpportunities.forEach((o) =>
    k.push({
      typeLabel: "הזדמנות",
      title: o.title,
      text: `${o.title} ${o.summary} ${o.recommendedAction} ${o.from}`,
      screen: "/now",
    })
  );
  mockLibrary.forEach((l) =>
    k.push({
      typeLabel: "נכס בספרייה",
      title: l.assetName,
      text: `${l.assetName} ${l.tags.join(" ")} ${l.bestUse} ${l.notes}`,
      screen: "/library",
    })
  );
  mockNews.forEach((n) =>
    k.push({
      typeLabel: "חדשה",
      title: n.title,
      text: `${n.title} ${n.summary} ${n.whyItMatters} ${n.suggestedAngle}`,
      screen: "/news",
    })
  );
  return k;
}

function rankUrgency(u: string): number {
  return { low: 1, medium: 2, high: 3, critical: 4 }[u] ?? 0;
}

/** מנתח את השאלה ומחבר תשובה מכל המידע. */
function answerQuestion(question: string): { answer: string; sources: Source[] } {
  const q = question.trim();
  const tokens = tokenize(q);
  const parts: string[] = [];
  const sources: Source[] = [];
  const has = (re: RegExp) => re.test(q);

  /* --- כוונות (intents) --- */

  if (has(/דחוף|עכשיו|בוער|קריטי|ראשון|מאיפה להתחיל/)) {
    const na = mockNextActions[0];
    parts.push(
      `הדבר הכי דחוף עכשיו: **${na.title}**.\n${na.whyNow}\nהצעד הבא: ${na.nextStep}`
    );
    sources.push({ label: "מה לעשות עכשיו", title: na.title, screen: "/now" });
  }

  if (has(/לפרסם|מוכן|פרסום|להעלות/)) {
    const ready = mockIdeas.filter(
      (i) => i.classificationLabel === "publish-now" || i.status === "ready"
    );
    if (ready.length) {
      parts.push(
        `מוכן לפרסום עכשיו: ${ready
          .map((i) => `"${i.title}"`)
          .join(", ")}. אל תתני לזה לשבת — תוכן מוכן שלא יוצא, לא קיים.`
      );
      ready.forEach((i) =>
        sources.push({ label: "רעיון מוכן", title: i.title, screen: "/ideas" })
      );
    }
  }

  if (has(/טרנד|חם|חדש|trend/i)) {
    const hot = [...mockTrends]
      .filter((t) => t.finalDecision !== "ignore")
      .sort((a, b) => b.urgencyScore - a.urgencyScore)
      .slice(0, 3);
    parts.push(
      `הטרנדים שדורשים תשומת לב: ${hot
        .map((t) => `"${t.title}" (דחיפות ${t.urgencyScore})`)
        .join("; ")}.`
    );
    hot.forEach((t) =>
      sources.push({ label: "טרנד", title: t.title, screen: "/trends" })
    );
  }

  if (has(/חדשות|כותרת|כותרות|בוקר/)) {
    const top = [...mockNews].sort((a, b) => a.rank - b.rank).slice(0, 3);
    parts.push(
      `שלוש הכותרות החמות הבוקר: ${top
        .map((n) => `"${n.title}"`)
        .join("; ")}. שווה להפוך לפחות אחת לפוסט.`
    );
    top.forEach((n) =>
      sources.push({ label: "חדשות הבוקר", title: n.title, screen: "/news" })
    );
  }

  if (has(/תקוע|נתקע|עצור|לא זז/)) {
    const stuck = mockProjects.filter((p) => p.status === "stuck");
    const stuckIdeas = mockIdeas.filter(
      (i) => i.status === "in-progress" && i.readiness < 55
    );
    parts.push(
      `מה שתקוע: ${[
        ...stuck.map((p) => `הפרויקט "${p.name}"`),
        ...stuckIdeas.map((i) => `הרעיון "${i.title}"`),
      ].join(", ")}. בחרי פריט אחד — וסגרי את החוסם שלו היום.`
    );
    stuck.forEach((p) =>
      sources.push({ label: "פרויקט תקוע", title: p.name, screen: "/projects" })
    );
  }

  if (has(/השבוע|סיכום|להתמקד|אסטרטג|כיוון/)) {
    const wr = mockWeeklyReviews[0];
    parts.push(`התובנה האסטרטגית לשבוע: ${wr.strategicInsight}`);
    sources.push({
      label: "דוח שבועי",
      title: "המלצת SHELLY OG לשבוע",
      screen: "/weekly",
    });
  }

  if (has(/מייל|הזדמנות|הזדמנויות|פנייה|פניות|הרצאה/)) {
    const opp = [...mockOpportunities]
      .sort((a, b) => rankUrgency(b.importance) - rankUrgency(a.importance))
      .slice(0, 3);
    parts.push(
      `הזדמנויות פתוחות שכדאי לטפל בהן: ${opp
        .map((o) => `"${o.title}"`)
        .join("; ")}.`
    );
    opp.forEach((o) =>
      sources.push({ label: "הזדמנות", title: o.title, screen: "/now" })
    );
  }

  /* --- חיפוש מילות מפתח חופשי --- */
  if (tokens.length > 0) {
    const knowledge = buildKnowledge();
    const scored = knowledge
      .map((item) => {
        const haystack = item.text.toLowerCase();
        const score = tokens.reduce(
          (s, tok) => (haystack.includes(tok) ? s + 1 : s),
          0
        );
        return { item, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    if (scored.length && parts.length === 0) {
      parts.push("הנה מה שמצאתי במערכת שקשור לשאלה שלך:");
    }
    scored.forEach(({ item }) => {
      const already = sources.some((s) => s.title === item.title);
      if (!already) {
        parts.push(`• ${item.typeLabel}: "${item.title}"`);
        sources.push({
          label: item.typeLabel,
          title: item.title,
          screen: item.screen,
        });
      }
    });
  }

  /* --- ברירת מחדל --- */
  if (parts.length === 0) {
    const na = mockNextActions[0];
    parts.push(
      `לא מצאתי משהו ממוקד לשאלה הזו, אז הנה הכיוון: הדבר הכי חשוב עכשיו הוא **${na.title}**. ${na.whyNow}`
    );
    parts.push(
      "נסי לשאול אותי דברים כמו: 'מה הכי דחוף?', 'מה מוכן לפרסום?', 'מה חם בטרנדים?', 'מה תקוע?', או 'על מה להתמקד השבוע?'"
    );
    sources.push({ label: "מה לעשות עכשיו", title: na.title, screen: "/now" });
  } else {
    parts.push(
      "**ההמלצה שלי:** אל תפזרי. בחרי פריט אחד מהרשימה הזו — ותסגרי אותו היום. פעולה אחת שהושלמה שווה יותר מחמש שנפתחו."
    );
  }

  return { answer: parts.join("\n\n"), sources };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { question?: string };
    if (!body.question || !body.question.trim()) {
      return NextResponse.json(
        { error: "כתבי שאלה ואשמח לענות." },
        { status: 400 }
      );
    }
    const result = answerQuestion(body.question);
    return NextResponse.json({ ...result, provider: "mock" });
  } catch (err) {
    console.error("[/api/ask] שגיאה:", err);
    return NextResponse.json(
      { error: "לא הצלחתי לענות כרגע. נסי שוב." },
      { status: 500 }
    );
  }
}
