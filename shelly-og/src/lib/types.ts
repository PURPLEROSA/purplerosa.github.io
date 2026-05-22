/* =============================================================
 * SHELLY OG — מודל הנתונים המרכזי
 * כל ישות במערכת מוגדרת כאן. המבנה נקי ומוכן להתחבר בעתיד
 * ל-Google Sheets או לבסיס נתונים אמיתי (ראו lib/google).
 * ============================================================= */

/** פלטפורמות פרסום נתמכות */
export type Platform =
  | "linkedin"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "newsletter"
  | "community"
  | "lecture";

/** סוגי תוכן */
export type ContentType =
  | "post"
  | "carousel"
  | "reels"
  | "script"
  | "newsletter"
  | "prompt"
  | "lecture"
  | "thread"
  | "story";

/** רמת דחיפות */
export type Urgency = "low" | "medium" | "high" | "critical";

/** רמת מאמץ הפקה */
export type EffortLevel = "15min" | "30min" | "1hour" | "deep-work";

/** סיווג עדיפות סופי — הליבה של המוצר */
export type PriorityClassification =
  | "publish-now" // לפרסם עכשיו
  | "create-today" // ליצור היום
  | "build-this-week" // לבנות השבוע
  | "save-later" // לשמור לאחר כך
  | "use-in-lecture" // להשתמש בהרצאה
  | "make-series" // להפוך לסדרה
  | "recycle" // למחזר מתוכן ישן
  | "not-worth-time"; // לא שווה זמן

/** מקור הפריט במערכת */
export type ItemSource =
  | "gmail"
  | "drive"
  | "docs"
  | "sheets"
  | "calendar"
  | "saved-link"
  | "manual"
  | "screenshot"
  | "upload"
  | "trend-radar";

/* ---------- 1. רעיונות (Ideas) ---------- */

export type IdeaStatus =
  | "inbox" // חדש בתיבה
  | "in-progress" // בעבודה
  | "almost-ready" // כמעט מוכן
  | "ready" // מוכן לפרסום
  | "scheduled" // מתוזמן
  | "published" // פורסם
  | "parked"; // הוקפא

/** סיווג אוטומטי של פריט בתיבת הרעיונות */
export type IdeaClassification =
  | "post-idea"
  | "trend"
  | "prompt"
  | "project-asset"
  | "business-opportunity"
  | "lecture-material"
  | "task"
  | "reference"
  | "future-content"
  | "noise";

export interface Idea {
  id: string;
  title: string;
  description: string;
  source: ItemSource;
  platform: Platform;
  contentType: ContentType;
  projectId: string | null;
  status: IdeaStatus;
  classification: IdeaClassification;
  priorityScore: number; // 0-100
  classificationLabel: PriorityClassification;
  urgency: Urgency;
  readiness: number; // 0-100 — כמה קרוב לפרסום
  recommendedAction: string;
  hook: string | null;
  caption: string | null;
  script: string | null;
  visualPrompt: string | null;
  cta: string | null;
  publishDate: string | null; // ISO
  tags: string[];
  missingItems: string[]; // מה חסר כדי לפרסם
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/* ---------- 2. טרנדים (Trends) ---------- */

export type TrendType =
  | "passing" // טרנד חולף
  | "evergreen" // Evergreen
  | "strategic-asset" // נכס אסטרטגי
  | "noise"; // רעש

export type TrendDecision =
  | "publish-now" // לפרסם עכשיו
  | "create-today" // ליצור היום
  | "save-week" // לשמור לשבוע
  | "save-lecture" // לשמור להרצאה
  | "ignore"; // להתעלם

export type TrendCategory =
  | "hot-trend" // טרנד חם
  | "content-opportunity" // הזדמנות תוכן
  | "noise" // רעש
  | "for-lecture" // לשמור להרצאה
  | "for-demo" // מתאים לדמו
  | "for-carousel" // מתאים לקרוסלה
  | "for-reels" // מתאים לרילס
  | "for-linkedin" // מתאים ללינקדאין
  | "for-community"; // מתאים לקהילה

export interface Trend {
  id: string;
  title: string;
  source: ItemSource;
  sourceLabel: string; // למשל "ניוזלטר Ben's Bites"
  summary: string; // מה קרה
  whyItMatters: string; // למה זה חשוב
  whoIsItRelevantFor: string; // למי זה רלוונטי
  whyForCreators: string; // למה זה חשוב ליוצרי תוכן
  whyForBrands: string; // למה זה חשוב למותגים
  shellyPOV: string; // הזווית של Shelly
  trendType: TrendType;
  urgencyScore: number; // 0-100 כמה דחוף להגיב
  productionEffort: EffortLevel; // כמה קשה להפיק
  recommendedFormat: ContentType;
  recommendedPlatform: Platform;
  cameraScript: string; // מה להגיד מול מצלמה
  hooks: string[]; // 5 הוקים
  cta: string;
  categories: TrendCategory[];
  finalDecision: TrendDecision;
  priorityScore: number;
  status: "new" | "reviewed" | "actioned" | "archived";
  createdAt: string;
}

/* ---------- 3. פרויקטים (Projects) ---------- */

export type ProjectType =
  | "lecture"
  | "content-series"
  | "client"
  | "collaboration"
  | "product"
  | "personal-brand";

export type ProjectStatus =
  | "planning"
  | "active"
  | "stuck"
  | "review"
  | "done";

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  deadline: string | null;
  relatedDriveFolder: string | null;
  relatedDocs: { name: string; link: string }[];
  relatedEmails: { subject: string; from: string }[];
  relatedCalendarEvents: { title: string; date: string }[];
  relatedIdeas: string[]; // idea ids
  summary: string;
  missingItems: string[];
  nextStep: string;
  contentOpportunities: string[];
  progress: number; // 0-100
  createdAt: string;
}

/* ---------- 4. ספריית תוכן (ContentLibrary) ---------- */

export type LibraryAssetType =
  | "prompt"
  | "file"
  | "idea"
  | "draft"
  | "published-post"
  | "project-asset"
  | "script"
  | "hook"
  | "cta"
  | "reference"
  | "link"
  | "lecture-material";

export type PublishedStatus =
  | "published"
  | "unpublished-valuable"
  | "draft"
  | "ready";

export interface ContentLibraryItem {
  id: string;
  assetName: string;
  type: LibraryAssetType;
  projectId: string | null;
  platform: Platform | null;
  contentType: ContentType | null;
  tags: string[];
  driveLink: string | null;
  source: ItemSource;
  bestUse: string; // למה הכי כדאי להשתמש
  publishedStatus: PublishedStatus;
  duplicateFlag: boolean;
  readyToPublish: boolean;
  goodForRecycle: boolean;
  goodForLecture: boolean;
  notes: string;
  createdAt: string;
}

/* ---------- 5. דוחות שבועיים (WeeklyReviews) ---------- */

export interface WeeklyReview {
  id: string;
  week: string; // למשל "19-25 במאי 2026"
  activeProjects: string[];
  newIdeas: string[];
  readyToPublish: string[];
  publishedContent: string[];
  stuckContent: string[];
  identifiedTrends: string[];
  missedTrends: string[];
  notWorthContinuing: string[];
  makeSeries: string[];
  lectureMaterial: string[];
  nextWeekPublishing: string[];
  recommendations: string[]; // שלוש פעולות מומלצות
  topAction: string; // הפעולה הכי חשובה
  strategicInsight: string; // המלצת SHELLY OG לשבוע הבא
  createdAt: string;
}

/* ---------- 6. תוכן שפורסם (PublishedContent) ---------- */

export interface PublishedContentItem {
  id: string;
  title: string;
  platform: Platform;
  publishDate: string;
  link: string;
  sourceIdeaId: string | null;
  performanceNotes: string;
  repurposeSuggestions: string[];
  metrics: { views: number; engagement: number; saves: number };
}

/* ---------- 7. הזדמנויות (Opportunities) ---------- */

export type OpportunityType =
  | "lecture-invite" // הזמנה להרצאה
  | "collaboration" // שיתוף פעולה
  | "job-offer" // הצעת עבודה
  | "client-inquiry" // פנייה מלקוח
  | "quote-request" // בקשת הצעת מחיר
  | "ai-tool-update" // עדכון כלי AI
  | "important-newsletter" // ניוזלטר חשוב
  | "task" // משימה
  | "follow-up"; // פולואפ נדרש

export type OpportunityStatus =
  | "new"
  | "reviewed"
  | "drafted"
  | "actioned"
  | "dismissed";

export interface Opportunity {
  id: string;
  source: ItemSource;
  title: string;
  from: string;
  summary: string;
  type: OpportunityType;
  importance: Urgency;
  urgency: Urgency;
  recommendedAction: string;
  shouldDraftReply: boolean;
  shouldTurnIntoContent: boolean;
  shouldSaveToProject: boolean;
  shouldCreateReminder: boolean;
  status: OpportunityStatus;
  relatedProjectId: string | null;
  createdAt: string;
}

/* ---------- ניווט ומצבי עבודה ---------- */

/** מצבי העבודה במסך "מה לעשות עכשיו" */
export type WorkMode =
  | "quick-15" // יש לי רק 15 דקות
  | "on-camera" // רוצה לצלם מול מצלמה
  | "linkedin" // רוצה לכתוב לינקדאין
  | "carousel" // רוצה להכין קרוסלה
  | "react-trend" // רוצה להגיב מהר לטרנד
  | "organize" // רוצה לעשות סדר
  | "lecture" // רוצה להכין הרצאה
  | "viral" // רוצה רעיון ויראלי
  | "recycle"; // רוצה להפוך משהו ישן לתוכן חדש

/** פעולה מומלצת — היחידה של מסך "מה לעשות עכשיו" */
export interface NextAction {
  id: string;
  title: string;
  whyNow: string; // למה זה חשוב עכשיו
  whyOnBrand: string; // למה זה מתאים למותג של Shelly
  urgency: Urgency;
  effort: EffortLevel;
  platform: Platform;
  whatsMissing: string[]; // מה חסר כדי לפרסם
  nextStep: string; // הצעד הבא
  strategicReason: string; // סיבה אסטרטגית
  ctaLabel: string; // טקסט כפתור הפעולה
  relatedMode: WorkMode[]; // באילו מצבי עבודה הפעולה רלוונטית
  sourceType: "idea" | "trend" | "opportunity" | "project";
  sourceId: string;
}

/* ---------- ניקוד עדיפות תוכן ---------- */

/** 12 ממדי הניקוד של Content Priority Score */
export interface ScoreBreakdown {
  freshness: number;
  trendUrgency: number;
  brandRelevance: number;
  audienceValue: number;
  productionEffort: number; // ככל שגבוה — קל יותר להפיק
  readiness: number;
  platformFit: number;
  differentiation: number;
  businessValue: number;
  cameraPotential: number;
  repurposingPotential: number;
  strategicAuthority: number;
}
