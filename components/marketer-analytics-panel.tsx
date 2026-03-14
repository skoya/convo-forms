import { buildAnalyticsDashboard } from "@/lib/analytics/aggregates";
import type { AnalyticsEvent, ExperienceVariant } from "@/lib/domain/models";

type MarketerAnalyticsPanelProps = {
  events: Array<AnalyticsEvent & { id: string }>;
  experiences: ExperienceVariant[];
};

export function MarketerAnalyticsPanel({
  events,
  experiences,
}: MarketerAnalyticsPanelProps) {
  const dashboard = buildAnalyticsDashboard(events, experiences);
  const splitSections: Array<{
    label: string;
    items: Array<{ label: string; count: number }>;
  }> = [
    {
      label: "Language splits",
      items: dashboard.splits.languages,
    },
    {
      label: "Source splits",
      items: dashboard.splits.sources,
    },
    {
      label: "Ad context splits",
      items: dashboard.splits.adContexts,
    },
  ];

  return (
    <section
      className="glass-panel rounded-[1.75rem] p-6 md:p-8"
      data-testid="analytics-dashboard"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Analytics dashboard
          </p>
          <h2 className="display-font mt-3 text-4xl font-semibold">
            A/B performance and funnel snapshot
          </h2>
        </div>
        <p className="rounded-full border border-[var(--border)] bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          Conversion rate = lead_submit / session_start
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ["Events", dashboard.totals.events],
          ["Sessions", dashboard.totals.sessions],
          ["Leads", dashboard.totals.leads],
        ].map(([label, value]) => (
          <div
            className="rounded-[1.25rem] border border-[var(--border)] bg-white/75 px-4 py-4"
            key={label}
          >
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              {label}
            </p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/75 p-5">
          <p className="text-sm font-semibold">Funnel drop-off</p>
          <div className="mt-4 space-y-3" data-testid="analytics-funnel">
            {dashboard.funnel.map((step) => (
              <div
                className="flex items-center justify-between rounded-[1rem] border border-[var(--border)] px-4 py-3"
                key={step.label}
              >
                <span>{step.label}</span>
                <span className="font-semibold">{step.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/75 p-5">
          <p className="text-sm font-semibold">Variant comparison</p>
          <div className="mt-4 space-y-3" data-testid="variant-comparison">
            {dashboard.variants.map((variant) => (
              <div
                className="rounded-[1rem] border border-[var(--border)] px-4 py-4"
                key={variant.variantId}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold">{variant.variantName}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {variant.variantId}
                  </p>
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Sessions {variant.sessions} · Messages {variant.messages} ·
                  Recommendation clicks {variant.recommendationClicks} · Leads{" "}
                  {variant.leads}
                </p>
                <p className="mt-2 text-sm font-semibold">
                  Conversion rate {variant.conversionRate.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {splitSections.map((section) => (
          <div
            className="rounded-[1.5rem] border border-[var(--border)] bg-white/75 p-5"
            key={section.label}
          >
            <p className="text-sm font-semibold">{section.label}</p>
            <div className="mt-4 space-y-3">
              {section.items.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No data yet.</p>
              ) : (
                section.items.map((item) => (
                  <div
                    className="flex items-center justify-between rounded-[1rem] border border-[var(--border)] px-4 py-3"
                    key={item.label}
                  >
                    <span>{item.label}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
