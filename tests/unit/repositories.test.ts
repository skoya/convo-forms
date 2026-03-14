import { describe, expect, it } from "vitest";
import { getDemoFixtures } from "@/lib/domain/fixtures";
import {
  analyticsRepo,
  campaignRepo,
  experienceRepo,
  getRepositorySummary,
  leadRepo,
  resetRepositories,
  seedDemoData,
} from "@/lib/repos";

describe("in-memory repositories", () => {
  it("performs CRUD for campaigns", () => {
    resetRepositories();
    const fixtures = getDemoFixtures();

    expect(campaignRepo.count()).toBe(0);
    campaignRepo.upsert(fixtures.campaign);

    expect(campaignRepo.getById(fixtures.campaign.id)).toEqual(fixtures.campaign);
    expect(campaignRepo.list()).toHaveLength(1);
    expect(campaignRepo.delete(fixtures.campaign.id)).toBe(true);
    expect(campaignRepo.getById(fixtures.campaign.id)).toBeUndefined();
  });

  it("performs CRUD for experiences, leads, and analytics", () => {
    resetRepositories();
    const fixtures = getDemoFixtures();

    fixtures.experiences.forEach((experience) => {
      experienceRepo.upsert(experience);
    });
    fixtures.leads.forEach((lead) => {
      leadRepo.upsert(lead);
    });
    fixtures.analyticsEvents.forEach((event) => {
      analyticsRepo.upsert(event);
    });

    expect(experienceRepo.listByCampaignId(fixtures.campaign.id)).toHaveLength(2);
    expect(leadRepo.list()).toHaveLength(1);
    expect(analyticsRepo.list()).toHaveLength(3);
    expect(analyticsRepo.getById(fixtures.analyticsEvents[0].eventId)).toMatchObject({
      id: fixtures.analyticsEvents[0].eventId,
      eventType: "session_start",
    });
  });

  it("resets and reseeds deterministically", () => {
    resetRepositories();
    const firstSeed = seedDemoData();
    const secondSeed = seedDemoData();

    expect(firstSeed).toEqual(secondSeed);
    expect(getRepositorySummary()).toEqual({
      campaigns: 1,
      experiences: 2,
      leads: 1,
      analyticsEvents: 3,
    });
  });
});
