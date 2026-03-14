import { describe, expect, it } from "vitest";
import { demoExperienceFixtures } from "@/lib/domain/fixtures";
import {
  buildCrmPayload,
  buildLeadSubmissionResult,
  validateLeadSubmission,
} from "@/lib/leads/submission";

describe("lead submission", () => {
  it("blocks submission when required consent and fields are missing", () => {
    const errors = validateLeadSubmission(demoExperienceFixtures[0], {
      sessionId: "sess-1",
      data: {},
      qualification: {},
      consent: {
        contactConsent: false,
        privacyAccepted: false,
      },
    });

    expect(errors.leadFieldErrors.fullName).toBe("Full name is required.");
    expect(errors.qualificationErrors.planningNeed).toBe(
      "Primary planning need is required.",
    );
    expect(errors.consentErrors).toContain(
      "Contact consent is required before submission.",
    );
  });

  it("builds a CRM payload with campaign, variant, session, and consent timestamp", () => {
    const payload = buildCrmPayload(demoExperienceFixtures[0], {
      sessionId: "sess-2",
      data: {
        fullName: "Alex Morgan",
        email: "alex@example.com",
      },
      qualification: {
        planningNeed: "Portfolio review",
        timeline: "This quarter",
      },
      consent: {
        contactConsent: true,
        privacyAccepted: true,
      },
    });

    expect(payload).toMatchObject({
      campaignId: demoExperienceFixtures[0].campaignId,
      variantId: demoExperienceFixtures[0].id,
      sessionId: "sess-2",
      consent: {
        contactConsent: true,
        privacyAccepted: true,
      },
    });
    expect(payload.consent.timestamp).toMatch(/T/);
  });

  it("emits qualification and lead analytics events for qualified submissions", () => {
    const result = buildLeadSubmissionResult(demoExperienceFixtures[0], {
      sessionId: "sess-3",
      data: {
        fullName: "Alex Morgan",
        email: "alex@example.com",
      },
      qualification: {
        planningNeed: "Portfolio review",
        timeline: "This quarter",
      },
      consent: {
        contactConsent: true,
        privacyAccepted: true,
      },
    });

    expect(result.analyticsEvents.map((event) => event.eventType)).toEqual(
      expect.arrayContaining([
        "consent_given",
        "qualification_complete",
        "lead_submit",
      ]),
    );
  });
});
