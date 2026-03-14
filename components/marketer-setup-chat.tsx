"use client";

import Link from "next/link";
import { useState } from "react";
import type { ExperienceVariant } from "@/lib/domain/models";
import {
  getDefaultSetupValues,
  validateSetupValues,
  type MarketerSetupErrors,
  type MarketerSetupResult,
  type MarketerSetupValues,
} from "@/lib/marketer/setup";
import type { RepositorySummary } from "@/lib/repos/types";

type MarketerSetupChatProps = {
  initialExperiences: ExperienceVariant[];
  initialSummary: RepositorySummary;
  submitSetup?: (
    values: MarketerSetupValues,
  ) => Promise<MarketerSetupResult>;
};

type StepDefinition = {
  title: string;
  prompt: string;
  fields: Array<keyof MarketerSetupValues>;
};

const setupSteps: StepDefinition[] = [
  {
    title: "Campaign context",
    prompt:
      "Start with the campaign signal the visitor is bringing in from the ad click.",
    fields: ["campaignName", "adSource", "audience", "headline", "promise", "cta"],
  },
  {
    title: "Goal and content mode",
    prompt:
      "Choose the conversion target and whether the visitor sees curated or runtime-simulated content.",
    fields: ["conversionGoal", "contentMode", "curatedUrlsText"],
  },
  {
    title: "Languages and lead schema",
    prompt:
      "Define languages and the editable lead fields this journey should capture later.",
    fields: ["languagesText", "leadFieldsText"],
  },
  {
    title: "Qualification and safety",
    prompt:
      "Set the qualification, consent, and safety defaults before any personal data is requested.",
    fields: ["qualificationEnabled", "consentRequired", "safetyProfile"],
  },
  {
    title: "Identity and layout",
    prompt:
      "Control whether the flow stays anonymous-first and how the visitor shell is framed.",
    fields: ["identificationMode", "layoutMode"],
  },
  {
    title: "Variant strategy",
    prompt:
      "Decide whether to create a single path or a two-variant A/B test and name each experience.",
    fields: ["variantCount", "primaryVariantName", "secondaryVariantName"],
  },
  {
    title: "Review and create",
    prompt:
      "Review the generated configuration summary, then create the campaign and shareable links.",
    fields: [],
  },
];

async function defaultSubmitSetup(
  values: MarketerSetupValues,
): Promise<MarketerSetupResult> {
  const response = await fetch("/api/marketer/setup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  const payload = (await response.json()) as
    | MarketerSetupResult
    | { errors?: MarketerSetupErrors; message?: string };

  if (!response.ok) {
    const message =
      payload && "message" in payload && payload.message
        ? payload.message
        : "Setup submission failed.";
    throw new Error(message);
  }

  return payload as MarketerSetupResult;
}

function renderError(error?: string) {
  if (!error) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-700">{error}</p>;
}

export function MarketerSetupChat({
  initialExperiences,
  initialSummary,
  submitSetup = defaultSubmitSetup,
}: MarketerSetupChatProps) {
  const [values, setValues] = useState<MarketerSetupValues>(() => {
    return getDefaultSetupValues();
  });
  const [summary, setSummary] = useState(initialSummary);
  const [experiences, setExperiences] = useState(initialExperiences);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<MarketerSetupErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<MarketerSetupResult | null>(null);

  function updateValue<TKey extends keyof MarketerSetupValues>(
    key: TKey,
    nextValue: MarketerSetupValues[TKey],
  ) {
    setValues((previous) => ({
      ...previous,
      [key]: nextValue,
    }));
    setErrors((previous) => ({
      ...previous,
      [key]: undefined,
    }));
  }

  function validateStep(stepIndex: number): boolean {
    const fieldErrors = validateSetupValues(values);
    const relevantErrors: MarketerSetupErrors = {};

    setupSteps[stepIndex].fields.forEach((field) => {
      if (fieldErrors[field]) {
        relevantErrors[field] = fieldErrors[field];
      }
    });

    setErrors((previous) => ({
      ...previous,
      ...relevantErrors,
    }));

    return Object.keys(relevantErrors).length === 0;
  }

  async function handleContinue() {
    setSubmitError("");

    if (currentStep < setupSteps.length - 1) {
      if (!validateStep(currentStep)) {
        return;
      }

      setCurrentStep((step) => step + 1);
      return;
    }

    const fieldErrors = validateSetupValues(values);
    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionResult = await submitSetup(values);
      setResult(submissionResult);
      setSummary(submissionResult.summary);
      setExperiences((previous) => {
        return [...submissionResult.variants, ...previous];
      });
      setCurrentStep(setupSteps.length - 1);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Setup submission failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeStep = setupSteps[currentStep];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="glass-panel rounded-[1.75rem] p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Guided setup chat
            </p>
            <h2
              className="display-font mt-3 text-4xl font-semibold"
              data-testid="setup-step-title"
            >
              {activeStep.title}
            </h2>
          </div>
          <div className="rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Step {currentStep + 1} of {setupSteps.length}
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-white/75 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
            Assistant prompt
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">
            {activeStep.prompt}
          </p>
        </div>

        {submitError ? (
          <div className="mt-5 rounded-[1.25rem] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        <div className="mt-6 space-y-5">
          {currentStep === 0 ? (
            <>
              <label className="block">
                <span className="text-sm font-semibold">Campaign name</span>
                <input
                  className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3"
                  name="campaignName"
                  onChange={(event) => {
                    updateValue("campaignName", event.target.value);
                  }}
                  value={values.campaignName}
                />
                {renderError(errors.campaignName)}
              </label>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold">Ad source</span>
                  <input
                    className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3"
                    onChange={(event) => {
                      updateValue("adSource", event.target.value);
                    }}
                    value={values.adSource}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Audience</span>
                  <input
                    className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3"
                    onChange={(event) => {
                      updateValue("audience", event.target.value);
                    }}
                    value={values.audience}
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-semibold">Headline</span>
                <input
                  className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3"
                  onChange={(event) => {
                    updateValue("headline", event.target.value);
                  }}
                  value={values.headline}
                />
                {renderError(errors.headline)}
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Promise</span>
                <textarea
                  className="mt-2 min-h-24 w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3"
                  onChange={(event) => {
                    updateValue("promise", event.target.value);
                  }}
                  value={values.promise}
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Call to action</span>
                <input
                  className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3"
                  onChange={(event) => {
                    updateValue("cta", event.target.value);
                  }}
                  value={values.cta}
                />
              </label>
            </>
          ) : null}

          {currentStep === 1 ? (
            <>
              <label className="block">
                <span className="text-sm font-semibold">Conversion goal</span>
                <select
                  className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3"
                  onChange={(event) => {
                    updateValue("conversionGoal", event.target.value);
                  }}
                  value={values.conversionGoal}
                >
                  <option value="advisor-consultation">Advisor consultation</option>
                  <option value="portfolio-review">Portfolio review</option>
                  <option value="event-rsvp">Event RSVP</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Content mode</span>
                <select
                  className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3"
                  onChange={(event) => {
                    updateValue(
                      "contentMode",
                      event.target.value as MarketerSetupValues["contentMode"],
                    );
                  }}
                  value={values.contentMode}
                >
                  <option value="curated">Curated</option>
                  <option value="runtime-simulated">Runtime simulated</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold">
                  UBS URLs, one per line
                </span>
                <textarea
                  className="mt-2 min-h-28 w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3"
                  onChange={(event) => {
                    updateValue("curatedUrlsText", event.target.value);
                  }}
                  value={values.curatedUrlsText}
                />
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Runtime-simulated mode may still use these as fallback or
                  reference fixtures.
                </p>
                {renderError(errors.curatedUrlsText)}
              </label>
            </>
          ) : null}

          {currentStep === 2 ? (
            <>
              <label className="block">
                <span className="text-sm font-semibold">
                  Languages, comma or line separated
                </span>
                <textarea
                  className="mt-2 min-h-24 w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3"
                  onChange={(event) => {
                    updateValue("languagesText", event.target.value);
                  }}
                  value={values.languagesText}
                />
                {renderError(errors.languagesText)}
              </label>
              <label className="block">
                <span className="text-sm font-semibold">
                  Lead fields, one per line
                </span>
                <textarea
                  className="mt-2 min-h-32 w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3 font-mono text-sm"
                  onChange={(event) => {
                    updateValue("leadFieldsText", event.target.value);
                  }}
                  value={values.leadFieldsText}
                />
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Use <code>key|Label|required|type</code>, for example
                  <code> fullName|Full name|required|text</code>.
                </p>
                {renderError(errors.leadFieldsText)}
              </label>
            </>
          ) : null}

          {currentStep === 3 ? (
            <>
              <label className="flex items-center justify-between rounded-[1rem] border border-[var(--border)] bg-white px-4 py-4">
                <span className="font-semibold">Qualification enabled</span>
                <input
                  checked={values.qualificationEnabled}
                  onChange={(event) => {
                    updateValue("qualificationEnabled", event.target.checked);
                  }}
                  type="checkbox"
                />
              </label>
              <label className="flex items-center justify-between rounded-[1rem] border border-[var(--border)] bg-white px-4 py-4">
                <span className="font-semibold">Consent required</span>
                <input
                  checked={values.consentRequired}
                  onChange={(event) => {
                    updateValue("consentRequired", event.target.checked);
                  }}
                  type="checkbox"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Safety profile</span>
                <select
                  className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3"
                  onChange={(event) => {
                    updateValue(
                      "safetyProfile",
                      event.target.value as MarketerSetupValues["safetyProfile"],
                    );
                  }}
                  value={values.safetyProfile}
                >
                  <option value="educational-only">Educational only</option>
                  <option value="marketer-defined">Marketer defined</option>
                </select>
              </label>
            </>
          ) : null}

          {currentStep === 4 ? (
            <>
              <label className="block">
                <span className="text-sm font-semibold">Identification mode</span>
                <select
                  className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3"
                  onChange={(event) => {
                    updateValue(
                      "identificationMode",
                      event.target.value as MarketerSetupValues["identificationMode"],
                    );
                  }}
                  value={values.identificationMode}
                >
                  <option value="anonymous-first">Anonymous first</option>
                  <option value="early-identification">Early identification</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Layout mode</span>
                <select
                  className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3"
                  onChange={(event) => {
                    updateValue(
                      "layoutMode",
                      event.target.value as MarketerSetupValues["layoutMode"],
                    );
                  }}
                  value={values.layoutMode}
                >
                  <option value="fullscreen">Fullscreen</option>
                  <option value="embedded">Embedded</option>
                </select>
              </label>
            </>
          ) : null}

          {currentStep === 5 ? (
            <>
              <label className="block">
                <span className="text-sm font-semibold">Variant count</span>
                <select
                  className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3"
                  onChange={(event) => {
                    updateValue(
                      "variantCount",
                      Number(event.target.value) as 1 | 2,
                    );
                  }}
                  value={String(values.variantCount)}
                >
                  <option value="1">1 variant</option>
                  <option value="2">2 variants (A/B)</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Primary variant name</span>
                <input
                  className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3"
                  onChange={(event) => {
                    updateValue("primaryVariantName", event.target.value);
                  }}
                  value={values.primaryVariantName}
                />
                {renderError(errors.primaryVariantName)}
              </label>
              {values.variantCount === 2 ? (
                <label className="block">
                  <span className="text-sm font-semibold">
                    Secondary variant name
                  </span>
                  <input
                    className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3"
                    onChange={(event) => {
                      updateValue("secondaryVariantName", event.target.value);
                    }}
                    value={values.secondaryVariantName}
                  />
                  {renderError(errors.secondaryVariantName)}
                </label>
              ) : null}
            </>
          ) : null}

          {currentStep === 6 ? (
            <div
              className="rounded-[1.5rem] border border-[var(--border)] bg-white/75 p-5"
              data-testid="setup-review"
            >
              <dl className="grid gap-4 md:grid-cols-2">
                {[
                  ["Campaign", values.campaignName || "Not set"],
                  ["Goal", values.conversionGoal],
                  ["Mode", values.contentMode],
                  ["Languages", values.languagesText],
                  ["Lead fields", values.leadFieldsText.split(/\r?\n/).length],
                  ["Variants", values.variantCount],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                      {label}
                    </dt>
                    <dd className="mt-2 text-base font-semibold">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap justify-between gap-4">
          <button
            className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            disabled={currentStep === 0 || isSubmitting}
            onClick={() => {
              setCurrentStep((step) => Math.max(step - 1, 0));
            }}
            type="button"
          >
            Back
          </button>
          <button
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="setup-continue"
            disabled={isSubmitting}
            onClick={handleContinue}
            type="button"
          >
            {currentStep === setupSteps.length - 1
              ? isSubmitting
                ? "Creating variants..."
                : "Create variants"
              : "Continue"}
          </button>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="glass-panel rounded-[1.75rem] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Workspace status
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
        </section>

        <section className="glass-panel rounded-[1.75rem] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Created variants
          </p>
          {result ? (
            <div
              className="mt-4 rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4"
              data-testid="setup-result"
            >
              <p className="text-sm font-semibold text-[var(--success)]">
                Campaign {result.campaign.name} created.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {result.variants.map((variant) => (
                  <Link
                    key={variant.id}
                    className="rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold"
                    href={variant.sharePath}
                  >
                    Open {variant.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          <div
            className="mt-4 space-y-3"
            data-testid="variant-list"
          >
            {experiences.length === 0 ? (
              <p className="rounded-[1.25rem] border border-dashed border-[var(--border)] px-4 py-4 text-sm text-[var(--muted)]">
                No variants yet. Finish the guided flow to publish the first
                share link.
              </p>
            ) : (
              experiences.map((variant) => (
                <div
                  key={variant.id}
                  className="rounded-[1.25rem] border border-[var(--border)] bg-white/75 px-4 py-4"
                >
                  <p className="font-semibold">{variant.name}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {variant.contentMode} · {variant.layoutMode} ·{" "}
                    {variant.languages.join(", ")}
                  </p>
                  <Link
                    className="mt-3 inline-flex text-sm font-semibold text-[var(--accent)]"
                    href={variant.sharePath}
                  >
                    {variant.sharePath}
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}
