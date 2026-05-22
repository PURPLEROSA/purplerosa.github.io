// =====================================================================
// AI.GOS Opportunity OS - shared type definitions
// These mirror the Google Sheets schema (see lib/sheetsSchema.ts).
// =====================================================================

export type OpportunityType =
  | "Speaking Request"
  | "Workshop Request"
  | "Consulting Request"
  | "Quote Request"
  | "Collaboration"
  | "Media Request"
  | "Follow-up Needed"
  | "Past Client Reactivation"
  | "Warm Lead"
  | "Content Opportunity"
  | "Not Relevant";

export type OpportunityStatus =
  | "New"
  | "Open"
  | "Waiting for Me"
  | "Waiting for Client"
  | "Proposal Needed"
  | "Proposal Sent"
  | "Follow-up Needed"
  | "Hot Lead"
  | "Scheduled"
  | "Won"
  | "Lost"
  | "Closed"
  | "Snoozed";

export type Priority = "Low" | "Medium" | "High" | "Critical";

export type RelationshipStage =
  | "New Contact"
  | "Warm Lead"
  | "Active Client"
  | "Past Client"
  | "Partner"
  | "Media"
  | "Community"
  | "Unknown";

export type ServiceType =
  | "Personal Consulting"
  | "AI Workshop"
  | "Keynote Lecture"
  | "Team Training"
  | "Creative Direction"
  | "AI Content Strategy"
  | "Monthly Retainer"
  | "Custom Project"
  | "Other";

export type PriceStatus =
  | "Proposed"
  | "Accepted"
  | "Rejected"
  | "Negotiating"
  | "Unknown";

export type FollowUpStatus = "Pending" | "Done" | "Snoozed" | "Cancelled";

export type InsightType =
  | "Missed Opportunity"
  | "Hot Lead"
  | "Price Reminder"
  | "Follow-up Risk"
  | "Reactivation"
  | "Content Idea"
  | "Collaboration Idea";

/** A short, ready-to-review email draft. Never sent automatically. */
export interface SuggestedEmail {
  subject: string;
  body: string;
}

// --- Opportunities -----------------------------------------------------
export interface Opportunity {
  id: string;
  createdAt: string;
  updatedAt: string;
  source: string;
  gmailThreadId?: string;
  gmailMessageId?: string;
  contactId: string;
  contactName: string;
  email: string;
  company?: string;
  type: OpportunityType;
  status: OpportunityStatus;
  priority: Priority;
  relationshipStage: RelationshipStage;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  reminderText?: string;
  serviceOffered?: string;
  topicOfInterest?: string;
  summary: string;
  /** Hard facts taken directly from the email / calendar / sheet. */
  facts: string[];
  /** Things the AI guessed. Treat with suspicion. */
  aiAssumptions: string[];
  suggestedNextStep: string;
  suggestedEmailDraft?: SuggestedEmail;
  estimatedValue?: number;
  confidenceScore: number;
  needsUserApproval: boolean;
  notes?: string;
}

// --- Contacts ----------------------------------------------------------
export interface Contact {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  relationshipSummary: string;
  howWeMet?: string;
  topicsTheyCareAbout: string[];
  lastInteractionDate?: string;
  nextFollowUpDate?: string;
  defaultTone?: string;
  preferredService?: string;
  totalEstimatedValue: number;
  relationshipStage: RelationshipStage;
  tags: string[];
  notes?: string;
}

// --- Price memory ------------------------------------------------------
export interface PriceRecord {
  id: string;
  createdAt: string;
  contactId: string;
  contactName: string;
  company?: string;
  serviceType: string;
  priceProposed?: number;
  priceCharged?: number;
  currency: string;
  dateOffered?: string;
  dateAccepted?: string;
  status: PriceStatus;
  context?: string;
  notes?: string;
}

// --- Follow-ups --------------------------------------------------------
export interface FollowUp {
  id: string;
  createdAt: string;
  contactId: string;
  opportunityId?: string;
  contactName: string;
  dueDate: string;
  reminderText: string;
  reason: string;
  suggestedTopic?: string;
  suggestedOffer?: string;
  suggestedEmailDraft?: SuggestedEmail;
  status: FollowUpStatus;
  calendarEventId?: string;
  isCalendarCreated: boolean;
  needsApproval: boolean;
}

// --- AI insights -------------------------------------------------------
export interface AIInsight {
  id: string;
  createdAt: string;
  type: InsightType;
  relatedContactId?: string;
  relatedOpportunityId?: string;
  title: string;
  insight: string;
  reasoning: string;
  suggestedAction: string;
  confidenceScore: number;
  isDismissed: boolean;
}

// --- Settings ----------------------------------------------------------
export interface AppSettings {
  defaultFollowUpDays: number;
  hotLeadThreshold: number;
  defaultCurrency: string;
  tone: string;
  emailTone: string;
  requireApprovalBeforeDraft: boolean;
  requireApprovalBeforeCalendar: boolean;
  requireApprovalBeforeEmailSend: boolean;
}

// --- Mock Gmail message ------------------------------------------------
export interface EmailMessage {
  id: string;
  threadId: string;
  from: string;
  fromName: string;
  company?: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  unread: boolean;
}

// --- AI classification result -----------------------------------------
export interface ClassificationResult {
  opportunityType: OpportunityType;
  priority: Priority;
  status: OpportunityStatus;
  summary: string;
  facts: string[];
  aiAssumptions: string[];
  suggestedNextStep: string;
  suggestedFollowUpDate?: string;
  suggestedEmailDraft?: SuggestedEmail;
  confidenceScore: number;
  needsUserApproval: boolean;
}

// --- Proactive opportunity suggestion (Opportunity Generator) ----------
export interface OpportunitySuggestion {
  id: string;
  contactId: string;
  contactName: string;
  company?: string;
  whyNow: string;
  topicToMention: string;
  suggestedOffer: string;
  suggestedPriceRange: string;
  previousPrice?: number;
  suggestedEmailDraft: SuggestedEmail;
  confidenceScore: number;
  riskIfIgnored: string;
  managerNote: string;
}

// --- Google connection status -----------------------------------------
export interface ConnectionStatus {
  demoMode: boolean;
  gmail: boolean;
  sheets: boolean;
  calendar: boolean;
  ai: boolean;
  spreadsheetId?: string;
  account?: string;
}
