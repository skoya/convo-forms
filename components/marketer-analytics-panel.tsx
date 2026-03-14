"use client";

import { useEffect, useState } from "react";
import { buildAnalyticsDashboard } from "@/lib/analytics/aggregates";
import { buildSessionReplays } from "@/lib/analytics/replays";
import type { AnalyticsEvent, ExperienceVariant } from "@/lib/domain/models";

type SyntheticTrafficResponse = {
  totalCreated: number;
  events: Array<AnalyticsEvent & { id: string }>;
};

type MarketerAnalyticsPanelProps = {
  events: Array<AnalyticsEvent & { id: string }>;
  experiences: ExperienceVariant[];
};

async function defaultGenerateSyntheticTraffic(
  sessionsPerVariant: number,
): Promise<SyntheticTrafficResponse> {
  const response = await fetch("/api/analytics/synthetic", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionsPerVariant,
    }),
  });

  if (!response.ok) {
    throw new Error("Synthetic traffic generation failed.");
  }

  return (await response.json()) as SyntheticTrafficResponse;
}

export function MarketerAnalyticsPanel({
  events: initialEvents,
  experiences,
}: MarketerAnalyticsPanelProps) {
  const [events, setEvents] = useState(initialEvents);
  const [sessionsPerVariant, setSessionsPerVariant] = useState("4");
  const [generatorStatus, setGeneratorStatus] = useState("");
  const [generatorError, setGeneratorError] = useState("");
  const [isGeneratingTraffic, setIsGeneratingTraffic] = useState(false);

  const dashboard = buildAnalyticsDashboard(events, experiences);
  const replays = buildSessionReplays(events, experiences);
  const [selectedReplayKey, setSelectedReplayKey] = useState(replays[0]?.key ?? "");
  const selectedReplay =
    replays.find((replay) => replay.key === selectedReplayKey) ?? replays[0];

  useEffect(() => {
    if (!selectedReplayKey && replays[0]) {
      setSelectedReplayKey(replays[0].key);
      return;
    }

    if (
      selectedReplayKey &&
      !replays.some((replay) => replay.key === selectedReplayKey) &&
      replays[0]
    ) {
      setSelectedReplayKey(replays[0].key);
    }
  }, [replays, selectedReplayKey]);

  async function handleGenerateTraffic() {
    setGeneratorError("");
    setGeneratorStatus("");
    setIsGeneratingTraffic(true);

    try {
      const result = await defaultGenerateSyntheticTraffic(
        Number(sessionsPerVariant),
      );
      setEvents(result.events);
      setGeneratorStatus(`Generated ${result.totalCreated} deterministic events.`);
    } catch (error) {
      setGeneratorError(
        error instanceof Error
          ? error.message
          : "Synthetic traffic generation failed.",
      );
    } finally {
      setIsGeneratingTraffic(false);
    }
  }

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

      <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-white/75 p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Synthetic traffic generator</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Create deterministic sessions for each variant to pressure-test the
              dashboard and replay viewer.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm font-semibold">
              Sessions per variant
              <input
                className="mt-2 w-28 rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3"
                data-testid="synthetic-sessions-input"
                max="12"
                min="1"
                onChange={(event) => {
                  setSessionsPerVariant(event.target.value);
                }}
                type="number"
                value={sessionsPerVariant}
              />
            </label>
            <button
              className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              data-testid="synthetic-generate"
              disabled={isGeneratingTraffic}
              onClick={handleGenerateTraffic}
              type="button"
            >
              {isGeneratingTraffic ? "Generating..." : "Generate traffic"}
            </button>
          </div>
        </div>

        {generatorError ? (
          <p className="mt-3 text-sm text-red-700" data-testid="synthetic-error">
            {generatorError}
          </p>
        ) : null}
        {generatorStatus ? (
          <p
            className="mt-3 text-sm text-[var(--success)]"
            data-testid="synthetic-status"
          >
            {generatorStatus}
          </p>
        ) : null}
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

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/75 p-5">
          <p className="text-sm font-semibold">Session replay viewer</p>
          <div className="mt-4 space-y-3" data-testid="replay-session-list">
            {replays.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No sessions yet.</p>
            ) : (
              replays.map((replay) => (
                <button
                  className={`w-full rounded-[1rem] border px-4 py-3 text-left ${
                    replay.key === selectedReplay?.key
                      ? "border-[var(--accent)] bg-[var(--surface-strong)]"
                      : "border-[var(--border)] bg-white"
                  }`}
                  key={replay.key}
                  onClick={() => {
                    setSelectedReplayKey(replay.key);
                  }}
                  type="button"
                >
                  <p className="font-semibold">{replay.variantName}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {replay.sessionId} · {replay.eventCount} events · Lead{" "}
                    {replay.leadSubmitted ? "submitted" : "not submitted"}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/75 p-5">
          <p className="text-sm font-semibold">Replay timeline</p>
          {selectedReplay ? (
            <div className="mt-4 space-y-3" data-testid="replay-steps">
              <div className="rounded-[1rem] border border-[var(--border)] px-4 py-4">
                <p className="font-semibold">{selectedReplay.variantName}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {selectedReplay.sessionId} · Started {selectedReplay.startedAt}
                </p>
              </div>
              {selectedReplay.steps.map((step) => (
                <div
                  className="rounded-[1rem] border border-[var(--border)] px-4 py-4"
                  key={`${selectedReplay.key}-${step.timestamp}-${step.eventType}`}
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                    {step.eventType}
                  </p>
                  <p className="mt-2 text-sm font-semibold">{step.label}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {step.timestamp}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--muted)]">
              Generate traffic or run a visitor journey to inspect a replay.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
