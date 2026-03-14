import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function fallbackResponse(messages: ChatMessage[], promptDraft: string) {
  const userMessages = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n");

  const answered = {
    objective: /objective|consultation|lead|callback|book/i.test(userMessages),
    audience: /hnw|uhnw|audience|persona|segment/i.test(userMessages),
    tone: /tone|formal|premium|friendly|concise/i.test(userMessages),
    content: /ubs|content|article|insight|recommend/i.test(userMessages),
    leadFields: /email|phone|country|asset|lead/i.test(userMessages),
    compliance: /consent|privacy|compliance|advice/i.test(userMessages),
  };

  const nextQuestion = !answered.objective
    ? "What is the primary conversion objective for this campaign?"
    : !answered.audience
      ? "Which audience segment should the visitor bot optimize for first?"
      : !answered.tone
        ? "What tone should the visitor bot use (e.g., premium-formal, premium-warm, concise-analytical)?"
        : !answered.content
          ? "Should recommendations focus on curated UBS pages, runtime-simulated retrieval, or both?"
          : !answered.leadFields
            ? "Which lead fields should be mandatory vs optional before advisor handoff?"
            : !answered.compliance
              ? "What compliance posture should the bot enforce before collecting personal details?"
              : "Great — do you want me to produce a final ready-to-paste visitor system prompt now?";

  const suggestion = !answered.objective
    ? "Suggested options: booked consultation, qualified callback request, or advisor-intent lead submit."
    : !answered.audience
      ? "Suggested segments: HNW growth planners, UHNW legacy planners, or cross-border wealth clients."
      : !answered.tone
        ? "Suggested tone: premium, clear, and advisory — never promotional hype."
        : !answered.content
          ? "Suggested strategy: start curated for control, then enable runtime-simulated retrieval for depth."
          : !answered.leadFields
            ? "Suggested default fields: name, email, phone, country, asset band, preferred contact window."
            : !answered.compliance
              ? "Suggested guardrails: educational-only responses, explicit consent, privacy acknowledgment, advisor escalation for personalized advice."
              : "Suggested next step: run two prompt variants and compare conversion + drop-off in A/B analytics.";

  const synthesizedPrompt = [
    "You are a visitor-facing wealth conversation assistant for HNW/UHNW prospects.",
    "Provide educational guidance only, never personalized investment advice.",
    "Use a premium but concise tone.",
    "Recommend relevant public UBS.com content when useful.",
    "Collect consent before personal data capture.",
    "Capture lead details for advisor follow-up when visitor shows intent.",
    promptDraft?.trim() ? `Existing draft context: ${promptDraft.trim()}` : "",
    userMessages.trim() ? `Marketer guidance so far:\n${userMessages.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    assistantReply: `${suggestion}\n\nNext question: ${nextQuestion}`,
    promptDraft: synthesizedPrompt,
    model: "gpt-5-mini (fallback simulated)",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      messages?: ChatMessage[];
      promptDraft?: string;
    };

    const messages = Array.isArray(body.messages) ? body.messages : [];
    const promptDraft = typeof body.promptDraft === "string" ? body.promptDraft : "";

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "At least one chat message is required." },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(fallbackResponse(messages, promptDraft));
    }

    const systemPrompt = `You are a marketer enablement agent helping define the VISITOR chatbot system prompt for a wealth management prototype.\n\nYou must coach by asking adaptive discovery questions and making concrete suggestions.\n\nOutput STRICT JSON with keys:\n- assistantReply: concise conversational response to marketer that includes (1) one practical suggestion and (2) one next question\n- promptDraft: updated full visitor system prompt draft\n\nBehavior requirements:\n- Ask one focused next question per turn, based on what is still unknown\n- Suggest concrete options after each marketer answer\n- Keep tone practical, premium, and concise\n\nRules for promptDraft:\n- educational information only, no personalized investment advice\n- include consent-before-PII behavior\n- include lead handoff behavior\n- include rich content recommendation behavior using public UBS.com pages\n- keep language clear and implementation-ready`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: JSON.stringify({
              messages,
              currentPromptDraft: promptDraft,
            }),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "marketer_prompt_agent_output",
            strict: true,
            schema: {
              type: "object",
              properties: {
                assistantReply: { type: "string" },
                promptDraft: { type: "string" },
              },
              required: ["assistantReply", "promptDraft"],
              additionalProperties: false,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("marketer agent error", text);
      return NextResponse.json(fallbackResponse(messages, promptDraft));
    }

    const data = (await response.json()) as {
      output_text?: string;
    };

    const parsed = JSON.parse(data.output_text ?? "{}") as {
      assistantReply?: string;
      promptDraft?: string;
    };

    if (!parsed.assistantReply || !parsed.promptDraft) {
      return NextResponse.json(fallbackResponse(messages, promptDraft));
    }

    return NextResponse.json({
      assistantReply: parsed.assistantReply,
      promptDraft: parsed.promptDraft,
      model: "gpt-5-mini",
    });
  } catch (error) {
    console.error("marketer agent route failed", error);
    return NextResponse.json(
      { error: "Unable to process marketer agent request." },
      { status: 500 },
    );
  }
}
