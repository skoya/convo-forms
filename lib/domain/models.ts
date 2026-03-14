export type Campaign = {
  id: string;
  name: string;
  adContext: {
    source?: string;
    audience?: string;
    headline?: string;
    promise?: string;
    cta?: string;
  };
  createdAt: string;
};

export type LeadField = {
  key: string;
  label: string;
  required: boolean;
  type: string;
};

export type ExperienceVariant = {
  id: string;
  campaignId: string;
  name: string;
  conversionGoal: string;
  contentMode: "curated" | "runtime-simulated";
  curatedUrls: string[];
  languages: string[];
  qualificationEnabled: boolean;
  consentRequired: boolean;
  safetyProfile: "educational-only" | "marketer-defined";
  identificationMode: "anonymous-first" | "early-identification";
  leadFields: LeadField[];
  layoutMode: "embedded" | "fullscreen";
  sharePath: string;
  createdAt: string;
};

export type Lead = {
  id: string;
  campaignId: string;
  variantId: string;
  sessionId: string;
  data: Record<string, string>;
  consent: {
    contactConsent: boolean;
    privacyAccepted: boolean;
    timestamp: string;
  };
  qualification?: Record<string, string>;
  createdAt: string;
};

export type AnalyticsEvent = {
  eventId: string;
  timestamp: string;
  eventType:
    | "session_start"
    | "message_sent"
    | "recommendation_click"
    | "consent_given"
    | "qualification_complete"
    | "lead_submit";
  campaignId: string;
  variantId: string;
  sessionId: string;
  language?: string;
  source?: string;
  adContext?: string;
  metadata?: Record<string, unknown>;
};
