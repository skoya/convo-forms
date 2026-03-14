import type { AnalyticsEvent, ExperienceVariant } from "@/lib/domain/models";

export type AnalyticsDashboard = {
  totals: {
    events: number;
    sessions: number;
    leads: number;
  };
  funnel: Array<{
    label: string;
    count: number;
  }>;
  variants: Array<{
    variantId: string;
    variantName: string;
    sessions: number;
    messages: number;
    recommendationClicks: number;
    leads: number;
    conversionRate: number;
  }>;
  splits: {
    languages: Array<{ label: string; count: number }>;
    sources: Array<{ label: string; count: number }>;
    adContexts: Array<{ label: string; count: number }>;
  };
};

function toCounts(values: Array<string | undefined>): Array<{ label: string; count: number }> {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    if (!value) {
      return;
    }

    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

export function buildAnalyticsDashboard(
  events: Array<AnalyticsEvent & { id: string }>,
  experiences: ExperienceVariant[],
): AnalyticsDashboard {
  const variantLookup = new Map(
    experiences.map((experience) => [experience.id, experience.name]),
  );

  const uniqueSessions = new Set(
    events
      .filter((event) => event.eventType === "session_start")
      .map((event) => `${event.variantId}:${event.sessionId}`),
  );

  const variantIds = new Set([
    ...experiences.map((experience) => experience.id),
    ...events.map((event) => event.variantId),
  ]);

  const variants = Array.from(variantIds)
    .map((variantId) => {
      const variantEvents = events.filter((event) => event.variantId === variantId);
      const sessions = variantEvents.filter((event) => event.eventType === "session_start").length;
      const leads = variantEvents.filter((event) => event.eventType === "lead_submit").length;

      return {
        variantId,
        variantName: variantLookup.get(variantId) ?? variantId,
        sessions,
        messages: variantEvents.filter((event) => event.eventType === "message_sent").length,
        recommendationClicks: variantEvents.filter(
          (event) => event.eventType === "recommendation_click",
        ).length,
        leads,
        conversionRate: sessions === 0 ? 0 : leads / sessions,
      };
    })
    .sort((left, right) => left.variantName.localeCompare(right.variantName));

  return {
    totals: {
      events: events.length,
      sessions: uniqueSessions.size,
      leads: events.filter((event) => event.eventType === "lead_submit").length,
    },
    funnel: [
      {
        label: "Session start",
        count: events.filter((event) => event.eventType === "session_start").length,
      },
      {
        label: "Message sent",
        count: events.filter((event) => event.eventType === "message_sent").length,
      },
      {
        label: "Consent given",
        count: events.filter((event) => event.eventType === "consent_given").length,
      },
      {
        label: "Qualification complete",
        count: events.filter((event) => event.eventType === "qualification_complete").length,
      },
      {
        label: "Lead submit",
        count: events.filter((event) => event.eventType === "lead_submit").length,
      },
    ],
    variants,
    splits: {
      languages: toCounts(events.map((event) => event.language)),
      sources: toCounts(events.map((event) => event.source)),
      adContexts: toCounts(events.map((event) => event.adContext)),
    },
  };
}
