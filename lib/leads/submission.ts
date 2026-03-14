import { randomUUID } from "node:crypto";
import type { AnalyticsEvent, ExperienceVariant, Lead } from "@/lib/domain/models";
import type { CrmPayload } from "@/lib/crm-sim/store";

export type LeadSubmissionInput = {
  sessionId: string;
  data: Record<string, string>;
  qualification?: Record<string, string>;
  consent: {
    contactConsent: boolean;
    privacyAccepted: boolean;
  };
};

export type LeadSubmissionErrors = {
  leadFieldErrors: Record<string, string>;
  qualificationErrors: Record<string, string>;
  consentErrors: string[];
};

export type LeadSubmissionResult = {
  lead: Lead;
  crmPayload: CrmPayload;
  analyticsEvents: AnalyticsEvent[];
};

export function getQualificationFields() {
  return [
    {
      key: "planningNeed",
      label: "Primary planning need",
    },
    {
      key: "timeline",
      label: "Decision timeline",
    },
  ];
}

export function validateLeadSubmission(
  experience: ExperienceVariant,
  input: LeadSubmissionInput,
): LeadSubmissionErrors {
  const leadFieldErrors: Record<string, string> = {};
  const qualificationErrors: Record<string, string> = {};
  const consentErrors: string[] = [];

  experience.leadFields.forEach((field) => {
    if (field.required && !input.data[field.key]?.trim()) {
      leadFieldErrors[field.key] = `${field.label} is required.`;
    }
  });

  if (experience.qualificationEnabled) {
    getQualificationFields().forEach((field) => {
      if (!input.qualification?.[field.key]?.trim()) {
        qualificationErrors[field.key] = `${field.label} is required.`;
      }
    });
  }

  if (experience.consentRequired) {
    if (!input.consent.contactConsent) {
      consentErrors.push("Contact consent is required before submission.");
    }

    if (!input.consent.privacyAccepted) {
      consentErrors.push("Privacy notice acknowledgment is required.");
    }
  }

  return {
    leadFieldErrors,
    qualificationErrors,
    consentErrors,
  };
}

export function buildCrmPayload(
  experience: ExperienceVariant,
  input: LeadSubmissionInput,
): CrmPayload {
  const createdAt = new Date().toISOString();

  return {
    deliveryId: `crm-${randomUUID()}`,
    campaignId: experience.campaignId,
    variantId: experience.id,
    sessionId: input.sessionId,
    data: input.data,
    consent: {
      contactConsent: input.consent.contactConsent,
      privacyAccepted: input.consent.privacyAccepted,
      timestamp: createdAt,
    },
    qualification: input.qualification,
    createdAt,
  };
}

export function buildLeadSubmissionResult(
  experience: ExperienceVariant,
  input: LeadSubmissionInput,
): LeadSubmissionResult {
  const crmPayload = buildCrmPayload(experience, input);
  const lead: Lead = {
    id: `lead-${randomUUID()}`,
    campaignId: experience.campaignId,
    variantId: experience.id,
    sessionId: input.sessionId,
    data: input.data,
    consent: crmPayload.consent,
    qualification: input.qualification,
    createdAt: crmPayload.createdAt,
  };

  const analyticsEvents: AnalyticsEvent[] = [
    {
      eventId: `evt-${randomUUID()}`,
      timestamp: crmPayload.createdAt,
      eventType: "consent_given",
      campaignId: experience.campaignId,
      variantId: experience.id,
      sessionId: input.sessionId,
      metadata: {
        contactConsent: input.consent.contactConsent,
        privacyAccepted: input.consent.privacyAccepted,
      },
    },
    {
      eventId: `evt-${randomUUID()}`,
      timestamp: crmPayload.createdAt,
      eventType: "lead_submit",
      campaignId: experience.campaignId,
      variantId: experience.id,
      sessionId: input.sessionId,
      metadata: {
        leadFieldCount: Object.keys(input.data).length,
      },
    },
  ];

  if (experience.qualificationEnabled && input.qualification) {
    analyticsEvents.push({
      eventId: `evt-${randomUUID()}`,
      timestamp: crmPayload.createdAt,
      eventType: "qualification_complete",
      campaignId: experience.campaignId,
      variantId: experience.id,
      sessionId: input.sessionId,
      metadata: {
        qualificationKeys: Object.keys(input.qualification),
      },
    });
  }

  return {
    lead,
    crmPayload,
    analyticsEvents,
  };
}
