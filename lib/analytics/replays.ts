import type { AnalyticsEvent, ExperienceVariant } from "@/lib/domain/models";

export type ReplayStep = {
  timestamp: string;
  eventType: AnalyticsEvent["eventType"];
  label: string;
};

export type SessionReplay = {
  key: string;
  sessionId: string;
  campaignId: string;
  variantId: string;
  variantName: string;
  startedAt: string;
  lastEventAt: string;
  leadSubmitted: boolean;
  eventCount: number;
  steps: ReplayStep[];
};

function formatReplayLabel(event: AnalyticsEvent): string {
  switch (event.eventType) {
    case "session_start":
      return `Session started${event.language ? ` in ${event.language}` : ""}`;
    case "message_sent":
      return typeof event.metadata?.query === "string"
        ? `Visitor asked: ${event.metadata.query}`
        : "Visitor sent a message";
    case "recommendation_click":
      return typeof event.metadata?.sourceUrl === "string"
        ? `Recommendation opened: ${event.metadata.sourceUrl}`
        : "Recommendation opened";
    case "consent_given":
      return "Consent captured";
    case "qualification_complete":
      return "Qualification completed";
    case "lead_submit":
      return "Lead submitted";
    default:
      return event.eventType;
  }
}

export function buildSessionReplays(
  events: Array<AnalyticsEvent & { id: string }>,
  experiences: ExperienceVariant[],
): SessionReplay[] {
  const experienceLookup = new Map(
    experiences.map((experience) => [experience.id, experience.name]),
  );
  const sessions = new Map<string, Array<AnalyticsEvent & { id: string }>>();

  events.forEach((event) => {
    const key = `${event.variantId}:${event.sessionId}`;
    const sessionEvents = sessions.get(key) ?? [];
    sessionEvents.push(event);
    sessions.set(key, sessionEvents);
  });

  return Array.from(sessions.entries())
    .map(([key, sessionEvents]) => {
      const sortedEvents = [...sessionEvents].sort((left, right) => {
        return left.timestamp.localeCompare(right.timestamp);
      });
      const firstEvent = sortedEvents[0];
      const lastEvent = sortedEvents.at(-1);

      return {
        key,
        sessionId: firstEvent.sessionId,
        campaignId: firstEvent.campaignId,
        variantId: firstEvent.variantId,
        variantName:
          experienceLookup.get(firstEvent.variantId) ?? firstEvent.variantId,
        startedAt: firstEvent.timestamp,
        lastEventAt: lastEvent?.timestamp ?? firstEvent.timestamp,
        leadSubmitted: sortedEvents.some((event) => event.eventType === "lead_submit"),
        eventCount: sortedEvents.length,
        steps: sortedEvents.map((event) => {
          return {
            timestamp: event.timestamp,
            eventType: event.eventType,
            label: formatReplayLabel(event),
          };
        }),
      };
    })
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt));
}
