import { beforeEach, describe, expect, it } from "vitest";
import { demoExperienceFixtures } from "@/lib/domain/fixtures";
import {
  getCuratedRecommendations,
  getRecommendations,
  rankRuntimeRecommendations,
} from "@/lib/retrieval/engine";
import { resetRepositories } from "@/lib/repos";

describe("recommendation engine", () => {
  beforeEach(() => {
    resetRepositories();
  });

  it("returns curated recommendations from configured UBS URLs", () => {
    const recommendations = getCuratedRecommendations(
      demoExperienceFixtures[0],
      "en-US",
    );

    expect(recommendations).toHaveLength(2);
    expect(recommendations[0]).toMatchObject({
      title: "UBS Wealth Management",
      sourceUrl: "https://www.ubs.com/global/en/wealthmanagement.html",
    });
  });

  it("ranks runtime-simulated recommendations deterministically from fixtures", () => {
    const recommendations = rankRuntimeRecommendations({
      experience: demoExperienceFixtures[1],
      language: "en-US",
      query: "I need help with portfolio allocation and markets",
    });

    expect(recommendations[0].title).toBe("UBS Chief Investment Office");
    expect(recommendations[0].score).toBeGreaterThanOrEqual(
      recommendations[1].score,
    );
  });

  it("uses runtime ranking for runtime-simulated variants", () => {
    const recommendations = getRecommendations({
      experience: demoExperienceFixtures[1],
      language: "en-US",
      query: "sustainable portfolio values",
    });

    expect(recommendations).toHaveLength(3);
    expect(recommendations[0].title).toBe("UBS Chief Investment Office");
  });
});
