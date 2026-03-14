import type { AnalyticsEvent, Campaign, ExperienceVariant } from "@/lib/domain/models";
import { analyticsRepo, listAnalyticsEvents, listCampaigns, listExperiences } from "@/lib/repos";

export type SyntheticTrafficOptions = {
  sessionsPerVariant: number;
};

export type SyntheticTrafficResult = {
  createdEvents: AnalyticsEvent[];
  totalCreated: number;
  events: Array<AnalyticsEvent & { id: string }>;
};

function toTimestamp(offsetMinutes: number, offsetSeconds: number): string {
  return new Date(
    Date.UTC(2026, 2, 14, 9, offsetMinutes, offsetSeconds),
  ).toISOString();
}

function buildEvent(
  variant: ExperienceVariant,
  campaign: Campaign | undefined,
  sessionId: string,
  eventType: AnalyticsEvent["eventType"],
  offsetMinutes: number,
  offsetSeconds: number,
  language: string,
  metadata?: Record<string, unknown>,
): AnalyticsEvent {
  return {
    eventId: `evt-synthetic-${variant.id}-${sessionId}-${eventType}-${offsetSeconds}`,
    timestamp: toTimestamp(offsetMinutes, offsetSeconds),
    eventType,
    campaignId: variant.campaignId,
    variantId: variant.id,
    sessionId,
    language,
    source: campaign?.adContext.source ?? "synthetic-traffic",
    adContext: campaign?.adContext.headline ?? variant.name,
    metadata: {
      synthetic: true,
      ...metadata,
    },
  };
}

export function generateSyntheticTraffic(
  options: SyntheticTrafficOptions,
  experiences: ExperienceVariant[] = listExperiences(),
  campaigns: Campaign[] = listCampaigns(),
): SyntheticTrafficResult {
  const sessionsPerVariant = Math.max(1, Math.min(options.sessionsPerVariant, 12));
  const campaignLookup = new Map(campaigns.map((campaign) => [campaign.id, campaign]));
  const createdEvents: AnalyticsEvent[] = [];

  experiences.forEach((variant, variantIndex) => {
    const campaign = campaignLookup.get(variant.campaignId);

    for (let sessionIndex = 0; sessionIndex < sessionsPerVariant; sessionIndex += 1) {
      const language = variant.languages[sessionIndex % variant.languages.length] ?? "en-US";
      const timelineOffset = variantIndex * sessionsPerVariant + sessionIndex;
      const sessionId = `synthetic-${variant.id}-${sessionIndex + 1}`;
      const converts = sessionIndex % (variantIndex + 2) === 0;
      const recommendationClicks = (sessionIndex + variantIndex) % 2 === 0;

      createdEvents.push(
        buildEvent(
          variant,
          campaign,
          sessionId,
          "session_start",
          timelineOffset,
          0,
          language,
          {
            seededVariant: variant.id,
          },
        ),
      );
      createdEvents.push(
        buildEvent(
          variant,
          campaign,
          sessionId,
          "message_sent",
          timelineOffset,
          10,
          language,
          {
            query: `Synthetic interest in ${variant.conversionGoal}`,
          },
        ),
      );

      if (recommendationClicks) {
        createdEvents.push(
          buildEvent(
            variant,
            campaign,
            sessionId,
            "recommendation_click",
            timelineOffset,
            20,
            language,
            {
              recommendationId: `${variant.id}-recommendation-${sessionIndex + 1}`,
              sourceUrl: variant.curatedUrls[0] ?? variant.sharePath,
            },
          ),
        );
      }

      if (!converts) {
        continue;
      }

      createdEvents.push(
        buildEvent(
          variant,
          campaign,
          sessionId,
          "consent_given",
          timelineOffset,
          30,
          language,
          {
            contactConsent: true,
            privacyAccepted: true,
          },
        ),
      );

      if (variant.qualificationEnabled) {
        createdEvents.push(
          buildEvent(
            variant,
            campaign,
            sessionId,
            "qualification_complete",
            timelineOffset,
            40,
            language,
            {
              qualificationKeys: ["planningNeed", "timeline"],
            },
          ),
        );
      }

      createdEvents.push(
        buildEvent(
          variant,
          campaign,
          sessionId,
          "lead_submit",
          timelineOffset,
          50,
          language,
          {
            leadFieldCount: variant.leadFields.length,
          },
        ),
      );
    }
  });

  createdEvents.forEach((event) => {
    analyticsRepo.upsert(event);
  });

  return {
    createdEvents,
    totalCreated: createdEvents.length,
    events: listAnalyticsEvents(),
  };
}
