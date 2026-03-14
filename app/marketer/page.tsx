import { getRepositorySummary } from "@/lib/repos";

export const dynamic = "force-dynamic";

export default function MarketerPage() {
  const summary = getRepositorySummary();

  return (
    <main className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="glass-panel rounded-[1.75rem] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Stage 1 workspace shell
        </p>
        <h2 className="display-font mt-3 text-4xl font-semibold">
          Repositories and route protection are wired for later stages.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
          Upcoming stages can now layer setup chat, analytics, CRM simulation,
          and walkthrough flows on top of a stable route shell.
        </p>
      </section>

      <aside className="glass-panel rounded-[1.75rem] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          In-memory status
        </p>
        <dl className="mt-4 space-y-4" data-testid="marketer-summary">
          {[
            ["Campaigns", summary.campaigns],
            ["Experience variants", summary.experiences],
            ["Leads", summary.leads],
            ["Analytics events", summary.analyticsEvents],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-[1.25rem] border border-[var(--border)] bg-white/75 px-4 py-4"
            >
              <dt className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                {label}
              </dt>
              <dd className="mt-2 text-2xl font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </main>
  );
}
