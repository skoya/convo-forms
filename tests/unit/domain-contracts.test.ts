import { describe, expect, it } from "vitest";
import {
  demoAnalyticsFixtures,
  demoCampaignFixture,
  demoExperienceFixtures,
} from "@/lib/domain/fixtures";
import type {
  AnalyticsEvent,
  Campaign,
  ExperienceVariant,
} from "@/lib/domain/models";

describe("domain contracts", () => {
  it("keeps the campaign fixture aligned with the campaign contract", () => {
    const campaign: Campaign = demoCampaignFixture;

    expect(campaign).toMatchObject({
      id: "cmp-premium-wealth-launch",
      name: "Premium wealth launch",
      adContext: {
        source: "linkedin",
      },
    });
  });

  it("keeps the experience fixtures aligned with the experience variant contract", () => {
    const experiences: ExperienceVariant[] = demoExperienceFixtures;

    expect(experiences[0]).toMatchObject({
      contentMode: "curated",
      consentRequired: true,
      leadFields: expect.arrayContaining([
        expect.objectContaining({
          key: "fullName",
          required: true,
        }),
      ]),
    });
    expect(experiences[1].contentMode).toBe("runtime-simulated");
  });

  it("keeps the analytics fixture aligned with the analytics contract", () => {
    const analyticsEvent: AnalyticsEvent = demoAnalyticsFixtures[0];

    expect(analyticsEvent).toMatchObject({
      eventId: "evt-seeded-session-start",
      eventType: "session_start",
      metadata: {
        seeded: true,
      },
    });
  });
});
