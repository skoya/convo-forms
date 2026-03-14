import { MarketerAnalyticsPanel } from "@/components/marketer-analytics-panel";
import { MarketerCrmPanel } from "@/components/marketer-crm-panel";
import { MarketerSetupChat } from "@/components/marketer-setup-chat";
import { listCrmPayloads } from "@/lib/crm-sim/store";
import {
  getRepositorySummary,
  listAnalyticsEvents,
  listExperiences,
} from "@/lib/repos";

export const dynamic = "force-dynamic";

export default function MarketerPage() {
  const summary = getRepositorySummary();
  const experiences = listExperiences();
  const crmPayloads = listCrmPayloads();
  const analyticsEvents = listAnalyticsEvents();

  return (
    <div className="space-y-6">
      <MarketerSetupChat
        initialExperiences={experiences}
        initialSummary={summary}
      />
      <MarketerCrmPanel payloads={crmPayloads} />
      <MarketerAnalyticsPanel
        events={analyticsEvents}
        experiences={experiences}
      />
    </div>
  );
}
