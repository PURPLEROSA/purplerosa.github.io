// =====================================================================
// sheetsSchema - the Google Sheets "database" structure.
//
// This is the single source of truth for the spreadsheet layout.
// lib/sheetsService.ts uses it to create the tabs and header rows.
// =====================================================================

export interface SheetTab {
  name: string;
  description: string;
  columns: string[];
}

export const SHEET_TABS: SheetTab[] = [
  {
    name: "Opportunities",
    description: "כל הזדמנות עסקית ככרטיס מובנה.",
    columns: [
      "OpportunityID",
      "CreatedAt",
      "UpdatedAt",
      "Source",
      "GmailThreadID",
      "GmailMessageID",
      "ContactID",
      "ContactName",
      "Email",
      "Company",
      "OpportunityType",
      "Status",
      "Priority",
      "RelationshipStage",
      "LastContactDate",
      "NextFollowUpDate",
      "ReminderText",
      "ServiceOffered",
      "TopicOfInterest",
      "Summary",
      "Facts",
      "AIAssumptions",
      "SuggestedNextStep",
      "SuggestedEmailDraft",
      "EstimatedValue",
      "ConfidenceScore",
      "NeedsUserApproval",
      "Notes",
    ],
  },
  {
    name: "Contacts",
    description: "אנשי הקשר וההיסטוריה מולם.",
    columns: [
      "ContactID",
      "CreatedAt",
      "UpdatedAt",
      "Name",
      "Email",
      "Phone",
      "Company",
      "Role",
      "RelationshipSummary",
      "HowWeMet",
      "TopicsTheyCareAbout",
      "LastInteractionDate",
      "NextFollowUpDate",
      "DefaultTone",
      "PreferredService",
      "TotalEstimatedValue",
      "Tags",
      "Notes",
    ],
  },
  {
    name: "PriceMemory",
    description: "מה הצעת, מה לקחת, ומתי.",
    columns: [
      "PriceID",
      "CreatedAt",
      "ContactID",
      "ContactName",
      "Company",
      "ServiceType",
      "PriceProposed",
      "PriceCharged",
      "Currency",
      "DateOffered",
      "DateAccepted",
      "Status",
      "Context",
      "Notes",
    ],
  },
  {
    name: "FollowUps",
    description: "תזכורות ופולואפים.",
    columns: [
      "FollowUpID",
      "CreatedAt",
      "ContactID",
      "OpportunityID",
      "ContactName",
      "DueDate",
      "ReminderText",
      "Reason",
      "SuggestedTopic",
      "SuggestedOffer",
      "SuggestedEmailDraft",
      "Status",
      "CalendarEventID",
      "IsCalendarCreated",
      "NeedsApproval",
    ],
  },
  {
    name: "AIInsights",
    description: "תובנות והתראות שה-AI מייצר.",
    columns: [
      "InsightID",
      "CreatedAt",
      "Type",
      "RelatedContactID",
      "RelatedOpportunityID",
      "Title",
      "Insight",
      "Reasoning",
      "SuggestedAction",
      "ConfidenceScore",
      "IsDismissed",
    ],
  },
  {
    name: "Settings",
    description: "הגדרות המערכת.",
    columns: ["SettingKey", "SettingValue", "Description"],
  },
];

/** Default rows for the Settings tab. */
export const DEFAULT_SETTINGS_ROWS: string[][] = [
  ["defaultFollowUpDays", "14", "ברירת מחדל לימים עד פולואפ"],
  ["hotLeadThreshold", "80", "ניקוד מינימלי לליד חם"],
  ["defaultCurrency", "ILS", "מטבע ברירת מחדל"],
  ["tone", "tough_personal_manager", "טון המערכת"],
  ["requireApprovalBeforeDraft", "true", "אישור לפני יצירת טיוטה"],
  ["requireApprovalBeforeCalendar", "true", "אישור לפני יצירת אירוע יומן"],
  ["requireApprovalBeforeEmailSend", "true", "אישור לפני שליחת מייל"],
];
