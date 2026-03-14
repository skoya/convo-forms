import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { analyticsRepo } from "@/lib/repos";
import type { AnalyticsEvent } from "@/lib/domain/models";

export const dynamic = "force-dynamic";

type TrackPayload = Pick<
  AnalyticsEvent,
  "campaignId" | "variantId" | "sessionId" | "eventType" | "language" | "metadata"
>;

export async function POST(request: NextRequest) {
  let payload: TrackPayload;

  try {
    payload = (await request.json()) as TrackPayload;
  } catch {
    return NextResponse.json(
      {
        message: "Analytics payload must be valid JSON.",
      },
      { status: 400 },
    );
  }

  const event: AnalyticsEvent = {
    eventId: randomUUID(),
    timestamp: new Date().toISOString(),
    eventType: payload.eventType,
    campaignId: payload.campaignId,
    variantId: payload.variantId,
    sessionId: payload.sessionId,
    language: payload.language,
    metadata: payload.metadata,
  };

  analyticsRepo.upsert(event);

  return NextResponse.json(event);
}
