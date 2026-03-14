"use client";

import { useState } from "react";
import type { ExperienceVariant } from "@/lib/domain/models";
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

type CopySet = {
  intro: string;
  promptLabel: string;
  promptPlaceholder: string;
  sendLabel: string;
  suggestionTitle: string;
  activeLanguageLabel: string;
  analyticsLabel: string;
  assistantFollowUp: string;
};

const copyByLanguage: Record<string, CopySet> = {
  "de-CH": {
    intro:
      "Willkommen. Ich kann Ihnen bildungsorientierte Inhalte zu Vermoegensplanung und UBS Themen zeigen.",
    promptLabel: "Ihre Frage",
    promptPlaceholder: "Beschreiben Sie, was Sie heute erkunden moechten",
    sendLabel: "Senden",
    suggestionTitle: "Empfohlene Inhalte",
    activeLanguageLabel: "Aktive Sprache",
    analyticsLabel: "Letztes Ereignis",
    assistantFollowUp:
      "Ich habe die Inhalte nach Ihren Prioritaeten und der aktiven Variante sortiert.",
  },
  "en-US": {
    intro:
      "Welcome. I can surface educational UBS content tied to your planning priorities and this campaign variant.",
    promptLabel: "Your question",
    promptPlaceholder: "Describe what you want to explore today",
    sendLabel: "Send",
    suggestionTitle: "Recommended content",
    activeLanguageLabel: "Active language",
    analyticsLabel: "Last event",
    assistantFollowUp:
      "I ranked these items against your prompt and the active campaign configuration.",
  },
};

const starterPrompts = [
  "How can I prepare for a portfolio review?",
  "Show me content for family succession planning.",
  "What educational UBS resources cover sustainable investing?",
];

async function trackEvent(payload: {
  campaignId: string;
  variantId: string;
  sessionId: string;
  eventType: "message_sent" | "recommendation_click";
  language: string;
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

export function VisitorExperience({ experience }: VisitorExperienceProps) {
  const [language, setLanguage] = useState(experience.languages[0] ?? "en-US");
  const [input, setInput] = useState("");
  const [lastEvent, setLastEvent] = useState("session_start");
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

  const sessionId = `sess-${experience.id}-visitor`;
  const copy = copyByLanguage[language] ?? copyByLanguage["en-US"];

  async function updateRecommendations(query: string) {
    const nextRecommendations = getRecommendations({
      experience,
      language,
      query,
    });

    setMessages((previous) => [
      ...previous,
      {
        id: `assistant-${previous.length + 1}`,
        role: "assistant",
        body: copy.assistantFollowUp,
      },
    ]);
    setRecommendations(nextRecommendations);
    setLastEvent("message_sent");

    await trackEvent({
      campaignId: experience.campaignId,
      variantId: experience.id,
      sessionId,
      eventType: "message_sent",
      language,
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

    setMessages((previous) => [
      ...previous,
      {
        id: `user-${previous.length + 1}`,
        role: "user",
        body: trimmed,
      },
    ]);
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
      metadata: {
        recommendationId: recommendation.id,
        sourceUrl: recommendation.sourceUrl,
      },
    });
  }

  function handleLanguageChange(nextLanguage: string) {
    setLanguage(nextLanguage);
    setMessages([
      {
        id: `assistant-language-${nextLanguage}`,
        role: "assistant",
        body: copyByLanguage[nextLanguage]?.intro ?? copyByLanguage["en-US"].intro,
      },
    ]);
    setRecommendations(
      getRecommendations({
        experience,
        language: nextLanguage,
        query: experience.conversionGoal,
      }),
    );
    setLastEvent("session_start");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="glass-panel rounded-[1.75rem] p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Visitor chat
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
                  ? "max-w-3xl rounded-[1.25rem] border border-[var(--border)] bg-white/80 px-5 py-4"
                  : "ml-auto max-w-2xl rounded-[1.25rem] bg-[var(--accent)] px-5 py-4 text-white"
              }
            >
              <p className="text-xs uppercase tracking-[0.22em] opacity-70">
                {message.role}
              </p>
              <p className="mt-2 text-sm leading-7">{message.body}</p>
            </div>
          ))}
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
                  className="mt-4 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold"
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
            <li>Lead fields: {experience.leadFields.map((field) => field.label).join(", ")}</li>
          </ul>
          <p
            className="mt-6 rounded-[1.25rem] border border-[var(--border)] bg-white/75 px-4 py-4 text-sm font-semibold"
            data-testid="last-event"
          >
            {copy.analyticsLabel}: {lastEvent}
          </p>
        </section>
      </aside>
    </div>
  );
}
