import { MarketerAnalyticsPanel } from "@/components/marketer-analytics-panel";
import { MarketerCrmPanel } from "@/components/marketer-crm-panel";
import { MarketerSetupChat } from "@/components/marketer-setup-chat";
import { MarketerPromptAgent } from "@/components/marketer-prompt-agent";
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
      <MarketerPromptAgent />
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
