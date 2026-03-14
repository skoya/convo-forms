"use client";

import { useState } from "react";

const steps = [
  {
    title: "Seed the demo",
    body: "Start with the deterministic demo seed so campaigns, variants, and sample lead data are ready.",
  },
  {
    title: "Configure the marketer path",
    body: "Use the setup chat to create or compare variants in under eight guided steps.",
  },
  {
    title: "Run the visitor journey",
    body: "Open a share link, trigger recommendations, and submit a consented lead.",
  },
  {
    title: "Inspect handoff and analytics",
    body: "Return to the marketer view to inspect the CRM payload and dashboard deltas.",
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
          Walkthrough complete.
        </p>
      ) : null}
      {isOpen ? (
        <div
          className="glass-panel fixed inset-0 z-50 flex items-center justify-center bg-[rgba(16,32,40,0.24)] px-6"
          data-testid="guided-tour"
        >
          <div className="w-full max-w-2xl rounded-[1.75rem] bg-[var(--surface-strong)] p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Guided tour
            </p>
            <h2 className="display-font mt-3 text-4xl font-semibold">
              {step.title}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              {step.body}
            </p>
            <div className="mt-6 flex items-center justify-between gap-4">
              <span className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                Step {stepIndex + 1} of {steps.length}
              </span>
              <div className="flex gap-3">
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
