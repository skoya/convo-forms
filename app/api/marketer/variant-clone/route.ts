import { NextRequest, NextResponse } from "next/server";
import {
  cloneExperienceVariant,
  validateVariantCloneValues,
  type VariantCloneValues,
} from "@/lib/marketer/setup";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const values = (await request.json()) as VariantCloneValues;
  const errors = validateVariantCloneValues(values);

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      {
        errors,
        message: "The clone wizard has validation errors. Review the highlighted fields.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json(cloneExperienceVariant(values));
}
