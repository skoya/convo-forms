import type {
  AnalyticsEvent,
  Campaign,
  ExperienceVariant,
  Lead,
} from "@/lib/domain/models";

const FIXTURE_TIMESTAMP = "2026-03-14T09:00:00.000Z";

export const demoCampaignFixture: Campaign = {
  id: "cmp-ubs-wealth-launch",
  name: "UBS wealth launch",
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
    id: "exp-ubs-wealth-curated",
    campaignId: demoCampaignFixture.id,
    name: "Curated guidance path",
    conversionGoal: "advisor-consultation",
    contentMode: "curated",
    curatedUrls: [
      "https://www.ubs.com/global/en/wealthmanagement.html",
      "https://www.ubs.com/global/en/wealthmanagement/chief-investment-office.html",
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
    sharePath: "/experience/exp-ubs-wealth-curated",
    createdAt: FIXTURE_TIMESTAMP,
  },
  {
    id: "exp-ubs-wealth-runtime",
    campaignId: demoCampaignFixture.id,
    name: "Runtime simulation path",
    conversionGoal: "portfolio-review",
    contentMode: "runtime-simulated",
    curatedUrls: [
      "https://www.ubs.com/global/en/wealthmanagement/insights.html",
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
    sharePath: "/experience/exp-ubs-wealth-runtime",
    createdAt: FIXTURE_TIMESTAMP,
  },
];

export const demoLeadFixtures: Lead[] = [];

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
];

export function getDemoFixtures() {
  return {
    campaign: demoCampaignFixture,
    experiences: demoExperienceFixtures,
    leads: demoLeadFixtures,
    analyticsEvents: demoAnalyticsFixtures,
  };
}
