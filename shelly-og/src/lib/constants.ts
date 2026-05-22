/* =============================================================
 * SHELLY OG — קבועים, תוויות עבריות וניווט
 * ============================================================= */

import type {
  Platform,
  ContentType,
  WorkMode,
  TrendType,
  TrendCategory,
  TrendDecision,
  IdeaClassification,
  IdeaStatus,
  ProjectType,
  ProjectStatus,
  OpportunityType,
  ItemSource,
  LibraryAssetType,
} from "./types";

/* ---------- ניווט ראשי ---------- */
export interface NavItem {
  href: string;
  label: string;
  icon: string; // שם אייקון מ-lucide-react
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "הבית", icon: "LayoutDashboard", description: "מרכז השליטה" },
  { href: "/now", label: "מה לעשות עכשיו", icon: "Target", description: "הפעולה הבאה" },
  { href: "/trends", label: "רדאר טרנדים", icon: "Radar", description: "מה חם עכשיו" },
  { href: "/ideas", label: "רעיונות", icon: "Lightbulb", description: "תיבת רעיונות" },
  { href: "/studio", label: "סטודיו תוכן", icon: "Sparkles", description: "מרעיון לפוסט" },
  { href: "/projects", label: "פרויקטים", icon: "FolderKanban", description: "ניהול פרויקטים" },
  { href: "/library", label: "ספרייה", icon: "Library", description: "כל הנכסים" },
  { href: "/calendar", label: "יומן פרסום", icon: "CalendarDays", description: "תכנון פרסום" },
  { href: "/weekly", label: "דוח שבועי", icon: "BarChart3", description: "סיכום והמלצות" },
  { href: "/settings", label: "הגדרות", icon: "Settings", description: "חיבורים ומצב" },
];

/* ---------- תוויות פלטפורמה ---------- */
export const PLATFORM_LABELS: Record<Platform, string> = {
  linkedin: "לינקדאין",
  instagram: "אינסטגרם",
  tiktok: "טיקטוק",
  youtube: "יוטיוב",
  newsletter: "ניוזלטר",
  community: "קהילה",
  lecture: "הרצאה",
};

export const PLATFORM_ICON: Record<Platform, string> = {
  linkedin: "Linkedin",
  instagram: "Instagram",
  tiktok: "Music2",
  youtube: "Youtube",
  newsletter: "Mail",
  community: "Users",
  lecture: "Presentation",
};

/* ---------- תוויות סוג תוכן ---------- */
export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  post: "פוסט",
  carousel: "קרוסלה",
  reels: "רילס",
  script: "תסריט",
  newsletter: "ניוזלטר",
  prompt: "פרומפט",
  lecture: "הרצאה",
  thread: "שרשור",
  story: "סטורי",
};

/* ---------- מצבי עבודה ---------- */
export interface WorkModeOption {
  value: WorkMode;
  label: string;
  icon: string;
}

export const WORK_MODES: WorkModeOption[] = [
  { value: "quick-15", label: "יש לי רק 15 דקות", icon: "Timer" },
  { value: "on-camera", label: "רוצה לצלם מול מצלמה", icon: "Video" },
  { value: "linkedin", label: "רוצה לכתוב לינקדאין", icon: "Linkedin" },
  { value: "carousel", label: "רוצה להכין קרוסלה", icon: "GalleryHorizontalEnd" },
  { value: "react-trend", label: "רוצה להגיב מהר לטרנד", icon: "Zap" },
  { value: "organize", label: "רוצה לעשות סדר", icon: "ListChecks" },
  { value: "lecture", label: "רוצה להכין הרצאה", icon: "Presentation" },
  { value: "viral", label: "רוצה רעיון ויראלי", icon: "Flame" },
  { value: "recycle", label: "להפוך משהו ישן לתוכן חדש", icon: "RefreshCw" },
];

/* ---------- טרנדים ---------- */
export const TREND_TYPE_LABELS: Record<TrendType, string> = {
  passing: "טרנד חולף",
  evergreen: "Evergreen",
  "strategic-asset": "נכס אסטרטגי",
  noise: "רעש",
};

export const TREND_CATEGORY_LABELS: Record<TrendCategory, string> = {
  "hot-trend": "טרנד חם",
  "content-opportunity": "הזדמנות תוכן",
  noise: "רעש",
  "for-lecture": "לשמור להרצאה",
  "for-demo": "מתאים לדמו",
  "for-carousel": "מתאים לקרוסלה",
  "for-reels": "מתאים לרילס",
  "for-linkedin": "מתאים ללינקדאין",
  "for-community": "מתאים לקהילה",
};

export const TREND_DECISION_LABELS: Record<TrendDecision, string> = {
  "publish-now": "לפרסם עכשיו",
  "create-today": "ליצור היום",
  "save-week": "לשמור לשבוע",
  "save-lecture": "לשמור להרצאה",
  ignore: "להתעלם",
};

/* ---------- רעיונות ---------- */
export const IDEA_CLASSIFICATION_LABELS: Record<IdeaClassification, string> = {
  "post-idea": "רעיון לפוסט",
  trend: "טרנד",
  prompt: "פרומפט",
  "project-asset": "נכס לפרויקט",
  "business-opportunity": "הזדמנות עסקית",
  "lecture-material": "חומר להרצאה",
  task: "משימה",
  reference: "רפרנס",
  "future-content": "תוכן עתידי",
  noise: "רעש",
};

export const IDEA_STATUS_LABELS: Record<IdeaStatus, string> = {
  inbox: "בתיבה",
  "in-progress": "בעבודה",
  "almost-ready": "כמעט מוכן",
  ready: "מוכן לפרסום",
  scheduled: "מתוזמן",
  published: "פורסם",
  parked: "הוקפא",
};

/* ---------- פרויקטים ---------- */
export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  lecture: "הרצאה",
  "content-series": "סדרת תוכן",
  client: "לקוח",
  collaboration: "שיתוף פעולה",
  product: "מוצר",
  "personal-brand": "מותג אישי",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: "בתכנון",
  active: "פעיל",
  stuck: "תקוע",
  review: "בבדיקה",
  done: "הושלם",
};

/* ---------- הזדמנויות ---------- */
export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  "lecture-invite": "הזמנה להרצאה",
  collaboration: "שיתוף פעולה",
  "job-offer": "הצעת עבודה",
  "client-inquiry": "פנייה מלקוח",
  "quote-request": "בקשת הצעת מחיר",
  "ai-tool-update": "עדכון כלי AI",
  "important-newsletter": "ניוזלטר חשוב",
  task: "משימה",
  "follow-up": "פולואפ נדרש",
};

/* ---------- מקורות ---------- */
export const SOURCE_LABELS: Record<ItemSource, string> = {
  gmail: "Gmail",
  drive: "Google Drive",
  docs: "Google Docs",
  sheets: "Google Sheets",
  calendar: "Google Calendar",
  "saved-link": "לינק שמור",
  manual: "הוזן ידנית",
  screenshot: "צילום מסך",
  upload: "קובץ שהועלה",
  "trend-radar": "רדאר טרנדים",
};

export const SOURCE_ICON: Record<ItemSource, string> = {
  gmail: "Mail",
  drive: "HardDrive",
  docs: "FileText",
  sheets: "Sheet",
  calendar: "Calendar",
  "saved-link": "Link",
  manual: "PenLine",
  screenshot: "Image",
  upload: "Upload",
  "trend-radar": "Radar",
};

/* ---------- ספרייה ---------- */
export const LIBRARY_TYPE_LABELS: Record<LibraryAssetType, string> = {
  prompt: "פרומפט",
  file: "קובץ",
  idea: "רעיון",
  draft: "טיוטה",
  "published-post": "פוסט שפורסם",
  "project-asset": "נכס פרויקט",
  script: "תסריט",
  hook: "הוק",
  cta: "CTA",
  reference: "רפרנס",
  link: "לינק",
  "lecture-material": "חומר להרצאה",
};

/* ---------- כלי הסטודיו ---------- */
export interface StudioAction {
  id: string;
  label: string;
  icon: string;
  /** סוג ה-task שנשלח ל-/api/ai */
  task: string;
}

export const STUDIO_ACTIONS: StudioAction[] = [
  { id: "linkedin", label: "הפכי לפוסט לינקדאין", icon: "Linkedin", task: "linkedin-post" },
  { id: "instagram", label: "הפכי לפוסט אינסטגרם", icon: "Instagram", task: "instagram-post" },
  { id: "tiktok", label: "הפכי לסקריפט טיקטוק", icon: "Music2", task: "tiktok-script" },
  { id: "carousel", label: "הפכי לקרוסלה", icon: "GalleryHorizontalEnd", task: "carousel" },
  { id: "hooks", label: "תני לי 5 הוקים", icon: "Anchor", task: "hooks" },
  { id: "camera", label: "מה להגיד מול מצלמה?", icon: "Video", task: "camera-coach" },
  { id: "reels", label: "צרי תסריט רילס", icon: "Clapperboard", task: "reels-script" },
  { id: "community", label: "צרי פוסט לקהילה", icon: "Users", task: "community-post" },
  { id: "newsletter", label: "צרי ניוזלטר קצר", icon: "Mail", task: "newsletter" },
  { id: "visual", label: "צרי פרומפט ויזואלי", icon: "ImagePlus", task: "visual-prompt" },
  { id: "cta", label: "צרי CTA", icon: "MousePointerClick", task: "cta" },
  { id: "titles", label: "צרי כותרות", icon: "Heading", task: "titles" },
  { id: "sharper", label: "צרי גרסה יותר חדה", icon: "Scissors", task: "sharper" },
  { id: "personal", label: "צרי גרסה יותר אישית", icon: "Heart", task: "personal" },
  { id: "professional", label: "צרי גרסה מקצועית יותר", icon: "Briefcase", task: "professional" },
  { id: "funny", label: "צרי גרסה מצחיקה יותר", icon: "Laugh", task: "funny" },
];

/* ---------- זוויות מנוע הזוויות ---------- */
export const VIRAL_ANGLES: { id: string; label: string }[] = [
  { id: "educational", label: "זווית חינוכית" },
  { id: "critical", label: "זווית ביקורתית" },
  { id: "personal", label: "זווית אישית" },
  { id: "funny", label: "זווית מצחיקה" },
  { id: "professional", label: "זווית מקצועית" },
  { id: "brands", label: "זווית למותגים" },
  { id: "creators", label: "זווית ליוצרים" },
  { id: "lecture", label: "זווית להרצאה" },
  { id: "debate", label: "זווית שמייצרת דיון" },
  { id: "differentiating", label: "זווית שמבדלת את Shelly" },
];

/** פרטי המותג של Shelly — מזין את מנוע ה-AI. */
export const SHELLY_BRAND = {
  name: "Shelly Or Gisser",
  roles: ["יוצרת AI", "מרצה", "Head of AI", "אסטרטגית קריאייטיב"],
  voice:
    "חכמה, ישירה, בטוחה, אנושית, מקצועית, לא רובוטית, לא גנרית, עם קריצה קטנה, בלי להגזים",
  audience: "יוצרי תוכן, מותגים, אנשי שיווק ומקצוענים שרוצים להבין AI באמת",
};
