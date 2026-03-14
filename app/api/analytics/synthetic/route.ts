import { NextRequest, NextResponse } from "next/server";
import { generateSyntheticTraffic } from "@/lib/analytics/synthetic";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => {
    return {};
  })) as { sessionsPerVariant?: number };

  return NextResponse.json(
    generateSyntheticTraffic({
      sessionsPerVariant: payload.sessionsPerVariant ?? 4,
    }),
  );
}
