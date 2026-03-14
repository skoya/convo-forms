import type { CrmPayload } from "@/lib/crm-sim/store";
import type {
  AnalyticsEvent,
  Campaign,
  ExperienceVariant,
  Lead,
} from "@/lib/domain/models";

const FIXTURE_TIMESTAMP = "2026-03-14T09:00:00.000Z";

export const demoCampaignFixture: Campaign = {
  id: "cmp-premium-wealth-launch",
  name: "Premium wealth launch",
  adContext: {
    source: "linkedin",
    audience: "hnw-executives",
    headline: "Turn complexity into confidence.",
    promise: "Explore wealth planning themes through a guided conversation.",
    cta: "Start the conversation",
  },
  createdAt: FIXTURE_TIMESTAMP,
};

export const demoExperienceFixtures: ExperienceVariant[] = [
  {
    id: "exp-premium-wealth-curated",
    campaignId: demoCampaignFixture.id,
    name: "Curated guidance path",
    conversionGoal: "advisor-consultation",
    contentMode: "curated",
    curatedUrls: [
      "https://www.blackrock.com/us/individual/insights",
      "https://www.fidelity.com/learning-center/overview",
    ],
    languages: ["en-US"],
    qualificationEnabled: true,
    consentRequired: true,
    safetyProfile: "educational-only",
    identificationMode: "anonymous-first",
    leadFields: [
      {
        key: "fullName",
        label: "Full name",
        required: true,
        type: "text",
      },
      {
        key: "email",
        label: "Email address",
        required: true,
        type: "email",
      },
    ],
    layoutMode: "fullscreen",
    sharePath: "/experience/exp-premium-wealth-curated",
    createdAt: FIXTURE_TIMESTAMP,
  },
  {
    id: "exp-premium-wealth-runtime",
    campaignId: demoCampaignFixture.id,
    name: "Runtime simulation path",
    conversionGoal: "portfolio-review",
    contentMode: "runtime-simulated",
    curatedUrls: [
      "https://www.jpmorgan.com/insights/wealth-management",
    ],
    languages: ["en-US", "de-CH"],
    qualificationEnabled: false,
    consentRequired: true,
    safetyProfile: "educational-only",
    identificationMode: "early-identification",
    leadFields: [
      {
        key: "fullName",
        label: "Full name",
        required: true,
        type: "text",
      },
      {
        key: "email",
        label: "Email address",
        required: true,
        type: "email",
      },
      {
        key: "country",
        label: "Country",
        required: false,
        type: "text",
      },
    ],
    layoutMode: "embedded",
    sharePath: "/experience/exp-premium-wealth-runtime",
    createdAt: FIXTURE_TIMESTAMP,
  },
];

export const demoLeadFixtures: Lead[] = [
  {
    id: "lead-demo-001",
    campaignId: demoCampaignFixture.id,
    variantId: demoExperienceFixtures[0].id,
    sessionId: "sess-demo-lead-001",
    data: {
      fullName: "Alex Morgan",
      email: "alex@example.com",
    },
    consent: {
      contactConsent: true,
      privacyAccepted: true,
      timestamp: FIXTURE_TIMESTAMP,
    },
    qualification: {
      planningNeed: "Family governance",
      timeline: "This quarter",
    },
    createdAt: FIXTURE_TIMESTAMP,
  },
];

export const demoAnalyticsFixtures: AnalyticsEvent[] = [
  {
    eventId: "evt-seeded-session-start",
    timestamp: FIXTURE_TIMESTAMP,
    eventType: "session_start",
    campaignId: demoCampaignFixture.id,
    variantId: demoExperienceFixtures[0].id,
    sessionId: "sess-demo-001",
    language: "en-US",
    source: demoCampaignFixture.adContext.source,
    adContext: demoCampaignFixture.adContext.headline,
    metadata: {
      seeded: true,
    },
  },
  {
    eventId: "evt-seeded-message",
    timestamp: FIXTURE_TIMESTAMP,
    eventType: "message_sent",
    campaignId: demoCampaignFixture.id,
    variantId: demoExperienceFixtures[0].id,
    sessionId: "sess-demo-001",
    language: "en-US",
    source: "visitor-chat",
    adContext: demoExperienceFixtures[0].name,
    metadata: {
      seeded: true,
    },
  },
  {
    eventId: "evt-seeded-recommendation",
    timestamp: FIXTURE_TIMESTAMP,
    eventType: "recommendation_click",
    campaignId: demoCampaignFixture.id,
    variantId: demoExperienceFixtures[0].id,
    sessionId: "sess-demo-001",
    language: "en-US",
    source: "recommendation-card",
    adContext: demoExperienceFixtures[0].name,
    metadata: {
      seeded: true,
    },
  },
];

export const demoCrmPayloadFixtures: CrmPayload[] = [
  {
    deliveryId: "crm-demo-001",
    campaignId: demoCampaignFixture.id,
    variantId: demoExperienceFixtures[0].id,
    sessionId: "sess-demo-lead-001",
    data: {
      fullName: "Alex Morgan",
      email: "alex@example.com",
    },
    consent: {
      contactConsent: true,
      privacyAccepted: true,
      timestamp: FIXTURE_TIMESTAMP,
    },
    qualification: {
      planningNeed: "Family governance",
      timeline: "This quarter",
    },
    createdAt: FIXTURE_TIMESTAMP,
  },
];

export function getDemoFixtures() {
  return {
    campaign: demoCampaignFixture,
    experiences: demoExperienceFixtures,
    leads: demoLeadFixtures,
    analyticsEvents: demoAnalyticsFixtures,
    crmPayloads: demoCrmPayloadFixtures,
  };
}
