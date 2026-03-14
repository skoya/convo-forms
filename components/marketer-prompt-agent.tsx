"use client";

import { FormEvent, useMemo, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const starterMessage: Message = {
  role: "assistant",
  content:
    "I’m your Marketer Prompt Agent. Let’s tailor this step-by-step. First: what is the core campaign objective (e.g., booked consultation, qualified lead, or callback request)?",
};

export function MarketerPromptAgent() {
  const [messages, setMessages] = useState<Message[]>([starterMessage]);
  const [input, setInput] = useState("");
  const [promptDraft, setPromptDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [modelLabel, setModelLabel] = useState("gpt-5-mini");
  const [error, setError] = useState<string | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;

    const nextUserMessage: Message = { role: "user", content: input.trim() };
    const nextMessages = [...messages, nextUserMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/marketer/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          promptDraft,
        }),
      });

      const data = (await response.json()) as {
        assistantReply?: string;
        promptDraft?: string;
        model?: string;
        error?: string;
      };

      if (!response.ok || data.error) {
        throw new Error(data.error ?? "Marketer agent request failed.");
      }

      if (data.model) {
        setModelLabel(data.model);
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data.assistantReply ??
            "I updated the visitor prompt draft. Keep refining with your next instruction.",
        },
      ]);

      if (data.promptDraft) {
        setPromptDraft(data.promptDraft);
      }
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unexpected error";
      setError(message);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I hit an error while updating the draft. Please retry your last instruction.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass-panel rounded-[1.75rem] p-6 md:p-8" data-testid="marketer-prompt-agent">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">Agent</p>
          <h2 className="display-font mt-2 text-3xl font-semibold">Marketer Prompt Agent</h2>
        </div>
        <span className="rounded-full border border-[var(--border)] bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
          Model: {modelLabel}
        </span>
      </div>

      <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">
        Converse with this agent to build the exact visitor chatbot prompt. It will iteratively refine a ready-to-use draft.
      </p>

      <div className="mt-5 rounded-[1.25rem] border border-[var(--border)] bg-white/70 p-4">
        <div className="max-h-72 space-y-3 overflow-y-auto pr-1" data-testid="marketer-prompt-agent-messages">
          {messages.map((message, index) => (
            <article
              className={`rounded-xl px-4 py-3 text-sm leading-6 ${
                message.role === "assistant"
                  ? "border border-[var(--border)] bg-[var(--surface-strong)]"
                  : "bg-[var(--accent)] text-white"
              }`}
              key={`${message.role}-${index}`}
            >
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] opacity-75">
                {message.role}
              </p>
              <p>{message.content}</p>
            </article>
          ))}
        </div>

        <form className="mt-4 flex gap-3" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-full border border-[var(--border)] bg-white px-4 py-3 text-sm"
            onChange={(event) => setInput(event.target.value)}
            placeholder="Tell the agent what the visitor chatbot should do next..."
            value={input}
          />
          <button
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canSend}
            type="submit"
          >
            {loading ? "Thinking…" : "Send"}
          </button>
        </form>
        {error ? <p className="mt-3 text-xs text-red-700">{error}</p> : null}
      </div>

      <div className="mt-5" data-testid="visitor-prompt-draft">
        <label
          className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]"
          htmlFor="visitor-prompt-draft-textarea"
        >
          Visitor prompt draft
        </label>
        <textarea
          className="mt-2 min-h-48 w-full rounded-[1rem] border border-[var(--border)] bg-white/80 p-4 text-sm leading-6"
          id="visitor-prompt-draft-textarea"
          onChange={(event) => setPromptDraft(event.target.value)}
          value={promptDraft}
        />
      </div>
    </section>
  );
}
