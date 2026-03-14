import { MarketerSetupChat } from "@/components/marketer-setup-chat";
import { getRepositorySummary, listExperiences } from "@/lib/repos";

export const dynamic = "force-dynamic";

export default function MarketerPage() {
  const summary = getRepositorySummary();
  const experiences = listExperiences();

  return (
    <MarketerSetupChat
      initialExperiences={experiences}
      initialSummary={summary}
    />
  );
}
