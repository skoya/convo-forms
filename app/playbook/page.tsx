export const dynamic = "force-dynamic";

const sections = [
  {
    title: "1. Seed the workspace",
    body: "Use the landing page seed action to load the baseline campaign, variants, recommendations, and sample lead handoff data.",
  },
  {
    title: "2. Configure the marketer path",
    body: "Sign in to the simulated marketer workspace, run the setup chat, and create two A/B variants with share links.",
  },
  {
    title: "3. Run the visitor demo",
    body: "Open a share link, test recommendations, switch language where available, and submit a consented lead.",
  },
  {
    title: "4. Inspect CRM and analytics",
    body: "Return to marketer view to inspect the CRM payload inspector and the A/B analytics dashboard with denominator labels.",
  },
];

const productionGaps = [
  {
    title: "Authentication and authorization",
    body: "Replace the simulated marketer cookie with real SSO, scoped roles, and auditable access control for campaign configuration and lead data.",
  },
  {
    title: "Persistence and auditability",
    body: "Move campaigns, variants, analytics, leads, and configuration archives from in-memory storage into durable services with audit trails and recovery workflows.",
  },
  {
    title: "Compliance and privacy controls",
    body: "Formalize consent capture, retention, privacy notices, disclosure copy approval, and legal review for any PII or regulated wealth-management messaging.",
  },
  {
    title: "Content and retrieval governance",
    body: "Replace fixture-backed retrieval with approved ingestion, provenance tracking, content freshness controls, and policy-enforced ranking rules.",
  },
  {
    title: "Operational readiness",
    body: "Add observability, rate limits, error budgets, CI/CD promotion gates, and real integrations for CRM delivery, scheduling, and support escalation.",
  },
];

export default function PlaybookPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-8">
      <section className="glass-panel rounded-[2rem] px-6 py-8 md:px-10 md:py-10">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Playbook
        </p>
        <h1 className="display-font mt-3 text-5xl font-semibold">
          Run the prototype in under 10 minutes
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">
          This playbook is written for first-time marketers who need a clean
          demo flow from setup through lead handoff.
        </p>
      </section>
      <section className="space-y-4">
        {sections.map((section) => (
          <article
            className="glass-panel rounded-[1.5rem] px-6 py-6"
            key={section.title}
          >
            <h2 className="text-2xl font-semibold">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              {section.body}
            </p>
          </article>
        ))}
      </section>
      <section
        className="glass-panel rounded-[2rem] px-6 py-8 md:px-10 md:py-10"
        data-testid="production-gap-register"
      >
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Prototype-to-production gap register
        </p>
        <h2 className="mt-3 text-3xl font-semibold">
          What still has to change before this can leave demo mode
        </h2>
        <div className="mt-6 space-y-4">
          {productionGaps.map((gap) => (
            <article
              className="rounded-[1.5rem] border border-[var(--border)] bg-white/75 px-5 py-5"
              key={gap.title}
            >
              <h3 className="text-lg font-semibold">{gap.title}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                {gap.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
