"use client";

import { useEffect, useRef, useState } from "react";
import type { ExperienceVariant } from "@/lib/domain/models";
import { getQualificationFields } from "@/lib/leads/submission";
import {
  getRecommendations,
  type Recommendation,
} from "@/lib/retrieval/engine";

type VisitorExperienceProps = {
  experience: ExperienceVariant;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  body: string;
};

type LeadSubmitResponse = {
  crmPayload: {
    campaignId: string;
    variantId: string;
    sessionId: string;
    consent: {
      timestamp: string;
    };
  };
};

type LeadSubmitErrorResponse = {
  errors?: {
    leadFieldErrors: Record<string, string>;
    qualificationErrors: Record<string, string>;
    consentErrors: string[];
  };
};

type CopySet = {
  intro: string;
  promptLabel: string;
  promptPlaceholder: string;
  sendLabel: string;
  suggestionTitle: string;
  activeLanguageLabel: string;
  analyticsLabel: string;
  assistantFollowUp: string;
  leadInvite: string;
  leadConsentPrompt: string;
  leadComplete: string;
  leadStartLabel: string;
  leadContinueLabel: string;
};

type LeadCaptureField = {
  key: string;
  label: string;
  type: string;
  required: boolean;
  section: "qualification" | "lead";
};

const copyByLanguage: Record<string, CopySet> = {
  "de-CH": {
    intro:
      "Willkommen. Ich kann Ihnen bildungsorientierte Inhalte zu Vermoegensplanung und globale Wealth-Themen zeigen.",
    promptLabel: "Ihre Frage",
    promptPlaceholder: "Beschreiben Sie, was Sie heute erkunden moechten",
    sendLabel: "Senden",
    suggestionTitle: "Empfohlene Inhalte",
    activeLanguageLabel: "Aktive Sprache",
    analyticsLabel: "Letztes Ereignis",
    assistantFollowUp:
      "Ich habe die Inhalte nach Ihren Prioritaeten und der aktiven Variante sortiert.",
    leadInvite:
      "Wenn Sie einen Rueckruf wuenschen, kann ich Ihre Angaben direkt hier im Chat aufnehmen.",
    leadConsentPrompt:
      "Bevor ich das an einen Advisor weitergebe, bestaetigen Sie bitte Kontakt- und Datenschutzeinwilligung.",
    leadComplete:
      "Danke. Ihre Anfrage wurde fuer eine Advisor-Nachverfolgung vorgemerkt.",
    leadStartLabel: "Rueckruf im Chat starten",
    leadContinueLabel: "Weiter",
  },
  "en-US": {
    intro:
      "Welcome. I can surface educational market insights content tied to your planning priorities and this campaign variant.",
    promptLabel: "Your question",
    promptPlaceholder: "Describe what you want to explore today",
    sendLabel: "Send",
    suggestionTitle: "Recommended content",
    activeLanguageLabel: "Active language",
    analyticsLabel: "Last event",
    assistantFollowUp:
      "I ranked these items against your prompt and the active campaign configuration.",
    leadInvite:
      "If you would like advisor follow-up, I can collect the details here in the chat.",
    leadConsentPrompt:
      "Before I hand this off, please confirm contact consent and privacy notice acknowledgment.",
    leadComplete:
      "Thank you. Your request has been logged for advisor follow-up.",
    leadStartLabel: "Start follow-up in chat",
    leadContinueLabel: "Continue",
  },
};

const starterPrompts = [
  "How can I prepare for a portfolio review?",
  "Show me content for family succession planning.",
  "What educational resources cover sustainable investing?",
];

async function trackEvent(payload: {
  campaignId: string;
  variantId: string;
  sessionId: string;
  eventType: "session_start" | "message_sent" | "recommendation_click";
  language: string;
  source?: string;
  adContext?: string;
  metadata?: Record<string, unknown>;
}) {
  await fetch("/api/analytics/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

function buildLeadCaptureFields(experience: ExperienceVariant): LeadCaptureField[] {
  const qualificationFields = experience.qualificationEnabled
    ? getQualificationFields().map((field) => {
        return {
          ...field,
          type: "text",
          required: true,
          section: "qualification" as const,
        };
      })
    : [];

  return [
    ...qualificationFields,
    ...experience.leadFields.map((field) => {
      return {
        ...field,
        section: "lead" as const,
      };
    }),
  ];
}

export function VisitorExperience({ experience }: VisitorExperienceProps) {
  const [language, setLanguage] = useState(experience.languages[0] ?? "en-US");
  const [input, setInput] = useState("");
  const [leadInput, setLeadInput] = useState("");
  const [lastEvent, setLastEvent] = useState("session_start");
  const [leadData, setLeadData] = useState<Record<string, string>>({});
  const [qualificationData, setQualificationData] = useState<Record<string, string>>(
    {},
  );
  const [contactConsent, setContactConsent] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState<LeadSubmitResponse | null>(
    null,
  );
  const [leadCaptureStarted, setLeadCaptureStarted] = useState(false);
  const [leadCaptureIndex, setLeadCaptureIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "assistant-intro",
      role: "assistant",
      body: copyByLanguage[language]?.intro ?? copyByLanguage["en-US"].intro,
    },
  ]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(() => {
    return getRecommendations({
      experience,
      language,
      query: experience.conversionGoal,
    });
  });
  const messageCountRef = useRef(1);

  const sessionId = `sess-${experience.id}-visitor`;
  const copy = copyByLanguage[language] ?? copyByLanguage["en-US"];
  const leadCaptureFields = buildLeadCaptureFields(experience);
  const currentLeadField = leadCaptureFields[leadCaptureIndex];
  const leadCaptureComplete = leadCaptureStarted && leadCaptureIndex >= leadCaptureFields.length;
  function appendMessage(role: ChatMessage["role"], body: string) {
    messageCountRef.current += 1;
    setMessages((previous) => {
      return [
        ...previous,
        {
          id: `${role}-${messageCountRef.current}`,
          role,
          body,
        },
      ];
    });
  }

  function resetLeadCaptureForLanguage(nextLanguage: string) {
    setLeadData({});
    setQualificationData({});
    setLeadInput("");
    setContactConsent(false);
    setPrivacyAccepted(false);
    setSubmitErrors([]);
    setSubmitSuccess(null);
    setLeadCaptureStarted(false);
    setLeadCaptureIndex(0);
    messageCountRef.current = 1;
    setMessages([
      {
        id: `assistant-language-${nextLanguage}`,
        role: "assistant",
        body: copyByLanguage[nextLanguage]?.intro ?? copyByLanguage["en-US"].intro,
      },
    ]);
  }

  useEffect(() => {
    void trackEvent({
      campaignId: experience.campaignId,
      variantId: experience.id,
      sessionId,
      eventType: "session_start",
      language,
      metadata: {
        seededVariant: experience.id,
      },
    });
  }, [experience.campaignId, experience.id, language, sessionId]);

  async function updateRecommendations(query: string) {
    const nextRecommendations = getRecommendations({
      experience,
      language,
      query,
    });

    appendMessage("assistant", copy.assistantFollowUp);
    setRecommendations(nextRecommendations);
    setLastEvent("message_sent");

    await trackEvent({
      campaignId: experience.campaignId,
      variantId: experience.id,
      sessionId,
      eventType: "message_sent",
      language,
      source: "visitor-chat",
      adContext: experience.name,
      metadata: {
        query,
      },
    });
  }

  async function handleSubmit(query: string) {
    const trimmed = query.trim();

    if (!trimmed) {
      return;
    }

    appendMessage("user", trimmed);
    setInput("");

    await updateRecommendations(trimmed);
  }

  async function handleRecommendationClick(recommendation: Recommendation) {
    setLastEvent("recommendation_click");

    await trackEvent({
      campaignId: experience.campaignId,
      variantId: experience.id,
      sessionId,
      eventType: "recommendation_click",
      language,
      source: "recommendation-card",
      adContext: experience.name,
      metadata: {
        recommendationId: recommendation.id,
        sourceUrl: recommendation.sourceUrl,
      },
    });
  }

  function handleLanguageChange(nextLanguage: string) {
    setLanguage(nextLanguage);
    resetLeadCaptureForLanguage(nextLanguage);
    setRecommendations(
      getRecommendations({
        experience,
        language: nextLanguage,
        query: experience.conversionGoal,
      }),
    );
    setLastEvent("session_start");
  }

  function startLeadCapture() {
    setLeadCaptureStarted(true);
    setLeadCaptureIndex(0);
    setLeadInput("");
    setSubmitErrors([]);
    setSubmitSuccess(null);
    appendMessage("assistant", copy.leadInvite);

    if (leadCaptureFields[0]) {
      appendMessage("assistant", `Let's start with ${leadCaptureFields[0].label}.`);
    } else {
      appendMessage("assistant", copy.leadConsentPrompt);
    }
  }

  function storeLeadFieldValue(field: LeadCaptureField, value: string) {
    if (field.section === "qualification") {
      setQualificationData((previous) => ({
        ...previous,
        [field.key]: value,
      }));
      return;
    }

    setLeadData((previous) => ({
      ...previous,
      [field.key]: value,
    }));
  }

  function handleLeadFieldContinue() {
    if (!currentLeadField) {
      return;
    }

    const trimmed = leadInput.trim();

    if (currentLeadField.required && !trimmed) {
      setSubmitErrors([`${currentLeadField.label} is required.`]);
      return;
    }

    setSubmitErrors([]);
    storeLeadFieldValue(currentLeadField, trimmed);
    appendMessage("user", trimmed || "Skipped");

    const nextIndex = leadCaptureIndex + 1;
    setLeadCaptureIndex(nextIndex);
    setLeadInput("");

    if (leadCaptureFields[nextIndex]) {
      appendMessage("assistant", `Next, ${leadCaptureFields[nextIndex].label}.`);
      return;
    }

    appendMessage("assistant", copy.leadConsentPrompt);
  }

  async function handleLeadSubmit() {
    const response = await fetch("/api/leads/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        variantId: experience.id,
        sessionId,
        data: leadData,
        qualification: qualificationData,
        consent: {
          contactConsent,
          privacyAccepted,
        },
      }),
    });

    const payload = (await response.json()) as
      | LeadSubmitResponse
      | LeadSubmitErrorResponse;

    if (!response.ok) {
      const errorPayload = payload as LeadSubmitErrorResponse;
      const nextErrors = [
        ...Object.values(errorPayload.errors?.leadFieldErrors ?? {}),
        ...Object.values(errorPayload.errors?.qualificationErrors ?? {}),
        ...(errorPayload.errors?.consentErrors ?? []),
      ];
      setSubmitErrors(nextErrors);
      setSubmitSuccess(null);
      return;
    }

    setSubmitErrors([]);
    setSubmitSuccess(payload as LeadSubmitResponse);
    setLastEvent("lead_submit");
    appendMessage("assistant", copy.leadComplete);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
      <section className="glass-panel rounded-[1.75rem] border-2 border-[color-mix(in_srgb,var(--accent)_25%,white)] bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">
              Visitor concierge chat
            </p>
            <h2 className="display-font mt-3 text-4xl font-semibold">
              {experience.name}
            </h2>
          </div>
          {experience.languages.length > 1 ? (
            <label className="text-sm font-semibold">
              {copy.activeLanguageLabel}
              <select
                className="ml-3 rounded-full border border-[var(--border)] bg-white px-4 py-2"
                data-testid="language-select"
                onChange={(event) => {
                  handleLanguageChange(event.target.value);
                }}
                value={language}
              >
                {experience.languages.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p
              className="rounded-full border border-[var(--border)] bg-white/75 px-4 py-2 text-sm font-semibold"
              data-testid="language-status"
            >
              {copy.activeLanguageLabel}: {language}
            </p>
          )}
        </div>

        <div className="mt-6 space-y-4" data-testid="chat-thread">
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "assistant"
                  ? "max-w-3xl rounded-[1.25rem] border border-[color-mix(in_srgb,var(--accent)_18%,white)] bg-white px-5 py-4 shadow-sm"
                  : "ml-auto max-w-2xl rounded-[1.25rem] bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] px-5 py-4 text-white shadow-[0_10px_30px_rgba(0,112,243,0.28)]"
              }
            >
              <p className="text-xs uppercase tracking-[0.22em] opacity-70">
                {message.role}
              </p>
              <p className="mt-2 text-sm leading-7">{message.body}</p>
            </div>
          ))}

          <div
            className="max-w-3xl rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-5"
            data-testid="lead-capture-chat"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
              Advisor follow-up in chat
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">
              This chatbot provides educational information only and not
              personalized investment advice. For tailored recommendations,
              speak with a licensed advisor.
            </p>

            {!leadCaptureStarted ? (
              <div className="mt-5">
                <button
                  className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
                  data-testid="lead-capture-start"
                  onClick={startLeadCapture}
                  type="button"
                >
                  {copy.leadStartLabel}
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                {experience.qualificationEnabled ? (
                  <div
                    className="rounded-[1.25rem] border border-[var(--border)] bg-white/80 px-4 py-4"
                    data-testid="qualification-section"
                  >
                    <p className="text-sm font-semibold">Qualification</p>
                    <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                      {getQualificationFields().map((field) => (
                        <p key={field.key}>
                          {field.label}: {qualificationData[field.key] || "Pending"}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="rounded-[1.25rem] border border-[var(--border)] bg-white/80 px-4 py-4">
                  <p className="text-sm font-semibold">Lead details</p>
                  <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                    {experience.leadFields.map((field) => (
                      <p key={field.key}>
                        {field.label}: {leadData[field.key] || "Pending"}
                      </p>
                    ))}
                  </div>
                </div>

                {currentLeadField ? (
                  <div className="rounded-[1.25rem] border border-[var(--border)] bg-white/85 px-4 py-4">
                    <label className="block">
                      <span className="text-sm font-semibold">
                        {currentLeadField.label}
                      </span>
                      <input
                        className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3"
                        data-testid="lead-capture-input"
                        onChange={(event) => {
                          setLeadInput(event.target.value);
                        }}
                        type={currentLeadField.type}
                        value={leadInput}
                      />
                    </label>
                    <div className="mt-4 flex justify-end">
                      <button
                        className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
                        data-testid="lead-capture-continue"
                        onClick={handleLeadFieldContinue}
                        type="button"
                      >
                        {copy.leadContinueLabel}
                      </button>
                    </div>
                  </div>
                ) : null}

                {leadCaptureComplete ? (
                  <div className="space-y-4 rounded-[1.25rem] border border-[var(--border)] bg-white/85 px-4 py-4">
                    <p className="text-sm leading-7 text-[var(--foreground)]">
                      {copy.leadConsentPrompt}
                    </p>
                    <div className="space-y-4 rounded-[1rem] border border-[var(--border)] bg-white px-4 py-4">
                      <label className="flex items-start gap-3">
                        <input
                          checked={contactConsent}
                          onChange={(event) => {
                            setContactConsent(event.target.checked);
                          }}
                          type="checkbox"
                        />
                        <span className="text-sm leading-6">
                          I consent to being contacted about this educational inquiry.
                        </span>
                      </label>
                      <label className="flex items-start gap-3">
                        <input
                          checked={privacyAccepted}
                          onChange={(event) => {
                            setPrivacyAccepted(event.target.checked);
                          }}
                          type="checkbox"
                        />
                        <span className="text-sm leading-6">
                          I acknowledge the privacy notice and understand how my
                          information will be used.
                        </span>
                      </label>
                    </div>
                    <div className="flex justify-end">
                      <button
                        className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
                        data-testid="lead-submit-button"
                        onClick={() => {
                          void handleLeadSubmit();
                        }}
                        type="button"
                      >
                        Submit lead
                      </button>
                    </div>
                  </div>
                ) : null}

                {submitErrors.length > 0 ? (
                  <div
                    className="rounded-[1.25rem] border border-red-300 bg-red-50 px-4 py-4 text-sm text-red-700"
                    data-testid="lead-errors"
                  >
                    {submitErrors.map((error) => (
                      <p key={error}>{error}</p>
                    ))}
                  </div>
                ) : null}

                {submitSuccess ? (
                  <div
                    className="rounded-[1.25rem] border border-[var(--border)] bg-white/85 px-4 py-4 text-sm"
                    data-testid="lead-submit-success"
                  >
                    Lead submitted for variant {submitSuccess.crmPayload.variantId}.
                    Consent timestamp: {submitSuccess.crmPayload.consent.timestamp}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              className="rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-semibold"
              onClick={() => {
                void handleSubmit(prompt);
              }}
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form
          className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-white/80 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit(input);
          }}
        >
          <label className="block">
            <span className="text-sm font-semibold">{copy.promptLabel}</span>
            <textarea
              className="mt-2 min-h-24 w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3"
              data-testid="visitor-input"
              onChange={(event) => {
                setInput(event.target.value);
              }}
              placeholder={copy.promptPlaceholder}
              value={input}
            />
          </label>
          <div className="mt-4 flex justify-end">
            <button
              className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
              data-testid="visitor-send"
              type="submit"
            >
              {copy.sendLabel}
            </button>
          </div>
        </form>
      </section>

      <aside className="space-y-6">
        <section className="glass-panel rounded-[1.75rem] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            {copy.suggestionTitle}
          </p>
          <div className="mt-4 space-y-4" data-testid="recommendation-cards">
            {recommendations.map((recommendation) => (
              <article
                key={recommendation.id}
                className="rounded-[1.25rem] border border-[var(--border)] bg-white/75 px-5 py-4"
              >
                <h3 className="text-lg font-semibold">{recommendation.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {recommendation.summary}
                </p>
                <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                  Rationale: {recommendation.rationaleSnippet}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  Source URL
                </p>
                <p className="mt-1 break-all text-sm text-[var(--accent)]">
                  {recommendation.sourceUrl}
                </p>
                <button
                  className="mt-4 rounded-full border border-[color-mix(in_srgb,var(--accent)_35%,white)] bg-[color-mix(in_srgb,var(--accent)_8%,white)] px-4 py-2 text-sm font-semibold"
                  onClick={() => {
                    void handleRecommendationClick(recommendation);
                  }}
                  type="button"
                >
                  Open recommendation
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-[1.75rem] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Experience settings
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted)]">
            <li>Content mode: {experience.contentMode}</li>
            <li>Qualification enabled: {String(experience.qualificationEnabled)}</li>
            <li>Consent required: {String(experience.consentRequired)}</li>
            <li>
              Lead fields: {experience.leadFields.map((field) => field.label).join(", ")}
            </li>
          </ul>
          <p
            className="mt-6 rounded-[1.25rem] border border-[var(--border)] bg-white/75 px-4 py-4 text-sm font-semibold"
            data-testid="last-event"
          >
            {copy.analyticsLabel}: {lastEvent}
          </p>
          {leadCaptureStarted ? (
            <div className="mt-6 rounded-[1.25rem] border border-[var(--border)] bg-white/75 px-4 py-4 text-sm text-[var(--muted)]">
              <p className="font-semibold text-[var(--foreground)]">
                Follow-up progress
              </p>
              <p className="mt-2">
                {leadCaptureComplete
                  ? "Awaiting consent and submission."
                  : `Current prompt: ${currentLeadField?.label ?? "Completed"}`}
              </p>
              <p className="mt-2">
                Captured lead fields:{" "}
                {experience.leadFields.filter((field) => leadData[field.key]).length}/
                {experience.leadFields.length}
              </p>
              {experience.qualificationEnabled ? (
                <p className="mt-2">
                  Qualification answers:{" "}
                  {
                    getQualificationFields().filter((field) => {
                      return qualificationData[field.key];
                    }).length
                  }
                  /{getQualificationFields().length}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      </aside>
    </div>
  );
}
