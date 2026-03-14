import { NextRequest, NextResponse } from "next/server";
import {
  createCampaignAndVariants,
  validateSetupValues,
  type MarketerSetupValues,
} from "@/lib/marketer/setup";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const values = (await request.json()) as MarketerSetupValues;
  const errors = validateSetupValues(values);

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      {
        errors,
        message: "The setup flow has validation errors. Review the highlighted fields.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json(createCampaignAndVariants(values));
}
