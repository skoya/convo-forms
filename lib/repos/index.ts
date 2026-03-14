import { getDemoFixtures } from "@/lib/domain/fixtures";
import type {
  AnalyticsEvent,
  Campaign,
  ExperienceVariant,
  Lead,
} from "@/lib/domain/models";
import { InMemoryRepository } from "@/lib/repos/in-memory-repository";
import type { RepositorySummary, SeedResult } from "@/lib/repos/types";

class CampaignRepo extends InMemoryRepository<Campaign> {}

class ExperienceRepo extends InMemoryRepository<ExperienceVariant> {
  listByCampaignId(campaignId: string): ExperienceVariant[] {
    return this.list().filter((item) => item.campaignId === campaignId);
  }
}

class LeadRepo extends InMemoryRepository<Lead> {
  listByVariantId(variantId: string): Lead[] {
    return this.list().filter((item) => item.variantId === variantId);
  }
}

class AnalyticsRepo extends InMemoryRepository<AnalyticsEvent & { id: string }> {
  upsert(event: AnalyticsEvent): AnalyticsEvent & { id: string } {
    return super.upsert({
      ...event,
      id: event.eventId,
    });
  }
}

type RepoRegistry = {
  campaignRepo: CampaignRepo;
  experienceRepo: ExperienceRepo;
  leadRepo: LeadRepo;
  analyticsRepo: AnalyticsRepo;
};

declare global {
  var __convoFormsRepoRegistry: RepoRegistry | undefined;
}

function createRepoRegistry(): RepoRegistry {
  return {
    campaignRepo: new CampaignRepo(),
    experienceRepo: new ExperienceRepo(),
    leadRepo: new LeadRepo(),
    analyticsRepo: new AnalyticsRepo(),
  };
}

const repoRegistry =
  globalThis.__convoFormsRepoRegistry ?? createRepoRegistry();

if (!globalThis.__convoFormsRepoRegistry) {
  globalThis.__convoFormsRepoRegistry = repoRegistry;
}

export const campaignRepo = repoRegistry.campaignRepo;
export const experienceRepo = repoRegistry.experienceRepo;
export const leadRepo = repoRegistry.leadRepo;
export const analyticsRepo = repoRegistry.analyticsRepo;

export function resetRepositories(): void {
  campaignRepo.clear();
  experienceRepo.clear();
  leadRepo.clear();
  analyticsRepo.clear();
}

export function getRepositorySummary(): RepositorySummary {
  return {
    campaigns: campaignRepo.count(),
    experiences: experienceRepo.count(),
    leads: leadRepo.count(),
    analyticsEvents: analyticsRepo.count(),
  };
}

export function seedDemoData(): SeedResult {
  resetRepositories();

  const fixtures = getDemoFixtures();
  campaignRepo.upsert(fixtures.campaign);
  fixtures.experiences.forEach((experience) => {
    experienceRepo.upsert(experience);
  });
  fixtures.leads.forEach((lead) => {
    leadRepo.upsert(lead);
  });
  fixtures.analyticsEvents.forEach((event) => {
    analyticsRepo.upsert(event);
  });

  return {
    campaignId: fixtures.campaign.id,
    variantIds: fixtures.experiences.map((experience) => experience.id),
    summary: getRepositorySummary(),
  };
}
