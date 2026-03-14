"use client";

import Link from "next/link";
import { useState } from "react";

type TourStep = {
  title: string;
  objective: string;
  where: string;
  success: string;
  actionLabel?: string;
  actionHref?: string;
};

const steps: TourStep[] = [
  {
    title: "1) Enter marketer mode + set campaign context",
    objective:
      "Open marketer workspace, pass simulated auth, then define ad source, audience, promise, and CTA in setup chat.",
    where: "Landing page → Open marketer route → Setup chat",
    success:
      "You can see setup, CRM simulation, and analytics panels; campaign context saves successfully.",
    actionLabel: "Open marketer route",
    actionHref: "/marketer",
  },
  {
    title: "2) Configure variants from a marketer perspective",
    objective:
      "Set conversion goal, content mode, language, qualification, lead fields, and compliance settings, then create A/B variants.",
    where: "Marketer setup chat + variant creation",
    success:
      "At least two shareable variant links are generated for comparison.",
  },
  {
    title: "3) Run the visitor flow end-to-end",
    objective:
      "Open variant link, validate recommendations, pass consent, complete qualification (if enabled), and submit lead.",
    where: "Visitor route /experience/[id]",
    success:
      "Visitor can complete journey and lead only submits after required consent.",
    actionLabel: "Open seeded visitor route",
    actionHref: "/experience/exp-ubs-wealth-curated",
  },
  {
    title: "4) Inspect handoff, analytics, and iterate",
    objective:
      "Return to marketer view to verify CRM payload, compare variant analytics, and decide next optimization loop.",
    where: "Marketer CRM panel + Analytics panel + Playbook",
    success:
      "You can see payload details and variant conversion deltas, then relaunch with refinements.",
    actionLabel: "Read full playbook",
    actionHref: "/playbook",
  },
];

export function GuidedTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [complete, setComplete] = useState(false);

  const step = steps[stepIndex];

  function closeTour() {
    setIsOpen(false);
    setStepIndex(0);
  }

  function handleNext() {
    if (stepIndex === steps.length - 1) {
      setComplete(true);
      closeTour();
      return;
    }

    setStepIndex((current) => current + 1);
  }

  function handleBack() {
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <button
          className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold"
          onClick={() => {
            setIsOpen(true);
            setComplete(false);
          }}
          type="button"
        >
          Launch walkthrough
        </button>
      </div>
      {complete ? (
        <p
          className="rounded-[1rem] border border-[var(--border)] bg-white/75 px-4 py-3 text-sm font-semibold"
          data-testid="tour-complete"
        >
          Walkthrough complete. You now have the full marketer operating path.
        </p>
      ) : null}
      {isOpen ? (
        <div
          className="glass-panel fixed inset-0 z-50 flex items-center justify-center bg-[rgba(16,32,40,0.24)] px-6"
          data-testid="guided-tour"
        >
          <div className="w-full max-w-3xl rounded-[1.75rem] bg-[var(--surface-strong)] p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Marketer visual guide
            </p>
            <h2 className="display-font mt-3 text-3xl font-semibold md:text-4xl">
              {step.title}
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <article className="rounded-2xl border border-[var(--border)] bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  Objective
                </p>
                <p className="mt-2 text-sm leading-6">{step.objective}</p>
              </article>
              <article className="rounded-2xl border border-[var(--border)] bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  Where to do it
                </p>
                <p className="mt-2 text-sm leading-6">{step.where}</p>
              </article>
              <article className="rounded-2xl border border-[var(--border)] bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  Success signal
                </p>
                <p className="mt-2 text-sm leading-6">{step.success}</p>
              </article>
            </div>

            {step.actionHref && step.actionLabel ? (
              <div className="mt-4">
                <Link
                  className="inline-flex rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold"
                  href={step.actionHref}
                  onClick={closeTour}
                >
                  {step.actionLabel}
                </Link>
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-between gap-4">
              <span className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                Step {stepIndex + 1} of {steps.length}
              </span>
              <div className="flex gap-3">
                <button
                  className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={stepIndex === 0}
                  onClick={handleBack}
                  type="button"
                >
                  Back
                </button>
                <button
                  className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold"
                  onClick={closeTour}
                  type="button"
                >
                  Close
                </button>
                <button
                  className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
                  data-testid="tour-next"
                  onClick={handleNext}
                  type="button"
                >
                  {stepIndex === steps.length - 1 ? "Finish" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
