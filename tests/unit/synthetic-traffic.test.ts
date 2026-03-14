import { beforeEach, describe, expect, it } from "vitest";
import { buildSessionReplays } from "@/lib/analytics/replays";
import { generateSyntheticTraffic } from "@/lib/analytics/synthetic";
import { createCampaignAndVariants, getDefaultSetupValues } from "@/lib/marketer/setup";
import { resetRepositories } from "@/lib/repos";

describe("synthetic traffic and replay helpers", () => {
  beforeEach(() => {
    resetRepositories();
  });

  it("generates deterministic analytics traffic for each variant", () => {
    createCampaignAndVariants({
      ...getDefaultSetupValues(),
      campaignName: "Synthetic dashboard coverage",
      headline: "Stress the analytics panel with safe demo traffic.",
    });

    const result = generateSyntheticTraffic({
      sessionsPerVariant: 3,
    });

    expect(result.totalCreated).toBeGreaterThan(0);
    expect(
      result.events.filter((event) => event.eventType === "session_start"),
    ).toHaveLength(6);
    expect(
      result.events.filter((event) => event.eventType === "lead_submit").length,
    ).toBeGreaterThan(0);
  });

  it("builds replay timelines from analytics events", () => {
    const created = createCampaignAndVariants({
      ...getDefaultSetupValues(),
      campaignName: "Replay coverage",
      headline: "Turn event logs into readable session timelines.",
    });

    const result = generateSyntheticTraffic({
      sessionsPerVariant: 2,
    });
    const replays = buildSessionReplays(result.events, created.variants);

    expect(replays).toHaveLength(4);
    expect(replays[0].steps[0].eventType).toBe("session_start");
    expect(replays.some((replay) => replay.leadSubmitted)).toBe(true);
  });
});
