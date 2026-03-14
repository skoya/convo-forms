"use client";

import Link from "next/link";
import { useState } from "react";
import type { RepositorySummary, SeedResult } from "@/lib/repos/types";

type SeedDemoButtonProps = {
  initialSummary: RepositorySummary;
};

export function SeedDemoButton({ initialSummary }: SeedDemoButtonProps) {
  const [summary, setSummary] = useState<RepositorySummary>(initialSummary);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");

  async function handleSeed() {
    setStatus("pending");

    const response = await fetch("/api/demo/seed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    const result = (await response.json()) as SeedResult;
    setSummary(result.summary);
    setSeedResult(result);
    setStatus("idle");
  }

  return (
    <div className="mt-6 space-y-6">
      <button
        className="rounded-full bg-[var(--accent-strong)] px-5 py-3 text-sm font-semibold text-white"
        data-testid="seed-demo-button"
        disabled={status === "pending"}
        onClick={handleSeed}
        type="button"
      >
        {status === "pending" ? "Seeding demo..." : "Seed demo data"}
      </button>

      <dl className="grid gap-4 sm:grid-cols-2" data-testid="repo-summary">
        {[
          ["Campaigns", summary.campaigns],
          ["Experience variants", summary.experiences],
          ["Leads", summary.leads],
          ["Analytics events", summary.analyticsEvents],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-[1.25rem] border border-[var(--border)] bg-white/70 px-4 py-4"
          >
            <dt className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
              {label}
            </dt>
            <dd className="mt-2 text-2xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      {status === "error" ? (
        <p className="rounded-[1.25rem] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          Demo seed failed. Check the route handler implementation.
        </p>
      ) : null}

      {seedResult ? (
        <div
          className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-5"
          data-testid="seed-result"
        >
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--success)]">
            Seed complete
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            Created campaign <strong>{seedResult.campaignId}</strong> with
            variant shells ready for marketer and visitor route checks.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {seedResult.variantIds.map((variantId) => (
              <Link
                key={variantId}
                className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold"
                href={`/experience/${variantId}`}
              >
                Open {variantId}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
