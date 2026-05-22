/* =============================================================
 * SHELLY OG — טיפוסים של שכבת ה-AI
 * ============================================================= */

/** משימת AI — מזוהה ע"י מחרוזת task. */
export interface AiRequest {
  task: string;
  /** הנושא / טקסט המקור (כותרת רעיון, תיאור טרנד, טקסט שהודבק). */
  input: string;
  /** הקשר נוסף אופציונלי (פלטפורמה, פרויקט, מצב עבודה). */
  context?: string;
}

/** קטע תוכן מובנה — לשימוש בקואצ'ר המצלמה ובניתוחים. */
export interface AiSection {
  heading: string;
  content: string;
}

/** זווית בודדת ממנוע הזוויות החזקות. */
export interface ViralAngle {
  id: string;
  label: string;
  title: string;
  whyItWorks: string;
  platform: string;
  riskLevel: "נמוך" | "בינוני" | "גבוה";
  potentialLevel: "בינוני" | "גבוה" | "מאוד גבוה";
  exampleOpener: string;
}

/** תשובת AI אחידה. */
export interface AiResponse {
  task: string;
  provider: "mock" | "anthropic" | "openai";
  /** פלט טקסטואלי פשוט (Markdown). */
  text?: string;
  /** פלט מובנה (קואצ'ר מצלמה, ניתוח טרנד). */
  sections?: AiSection[];
  /** זוויות — עבור מנוע הזוויות החזקות. */
  angles?: ViralAngle[];
  /** הערת מערכת — למשל "רץ במצב Mock". */
  note?: string;
}
