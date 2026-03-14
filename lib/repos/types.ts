export type RepositorySummary = {
  campaigns: number;
  experiences: number;
  leads: number;
  analyticsEvents: number;
};

export type SeedResult = {
  campaignId: string;
  variantIds: string[];
  summary: RepositorySummary;
};
