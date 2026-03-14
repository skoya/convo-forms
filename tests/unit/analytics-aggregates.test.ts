import { describe, expect, it } from "vitest";
import { buildAnalyticsDashboard } from "@/lib/analytics/aggregates";
import { demoExperienceFixtures } from "@/lib/domain/fixtures";

describe("analytics aggregates", () => {
  it("builds totals, funnel counts, variant conversion rates, and splits", () => {
    const events = [
      {
        id: "1",
        eventId: "1",
        timestamp: "2026-03-14T09:00:00.000Z",
        eventType: "session_start" as const,
        campaignId: demoExperienceFixtures[0].campaignId,
        variantId: demoExperienceFixtures[0].id,
        sessionId: "sess-a",
        language: "en-US",
        source: "linkedin",
        adContext: "Launch",
      },
      {
        id: "2",
        eventId: "2",
        timestamp: "2026-03-14T09:01:00.000Z",
        eventType: "lead_submit" as const,
        campaignId: demoExperienceFixtures[0].campaignId,
        variantId: demoExperienceFixtures[0].id,
        sessionId: "sess-a",
        language: "en-US",
        source: "linkedin",
        adContext: "Launch",
      },
      {
        id: "3",
        eventId: "3",
        timestamp: "2026-03-14T09:02:00.000Z",
        eventType: "session_start" as const,
        campaignId: demoExperienceFixtures[1].campaignId,
        variantId: demoExperienceFixtures[1].id,
        sessionId: "sess-b",
        language: "de-CH",
        source: "newsletter",
        adContext: "Runtime",
      },
    ];

    const dashboard = buildAnalyticsDashboard(events, demoExperienceFixtures);

    expect(dashboard.totals).toEqual({
      events: 3,
      sessions: 2,
      leads: 1,
    });
    expect(dashboard.funnel.find((step) => step.label === "Lead submit")?.count).toBe(
      1,
    );
    expect(
      dashboard.variants.find(
        (variant) => variant.variantId === demoExperienceFixtures[0].id,
      )?.conversionRate,
    ).toBe(1);
    expect(dashboard.splits.languages).toEqual(
      expect.arrayContaining([{ label: "de-CH", count: 1 }]),
    );
  });

  it("keeps conversion rate at zero when a variant has no sessions", () => {
    const dashboard = buildAnalyticsDashboard([], demoExperienceFixtures);

    expect(
      dashboard.variants.find(
        (variant) => variant.variantId === demoExperienceFixtures[0].id,
      )?.conversionRate,
    ).toBe(0);
  });
});
