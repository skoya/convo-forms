import { NextRequest, NextResponse } from "next/server";
import {
  coerceMarketerConfigArchive,
  createMarketerConfigArchive,
  importMarketerConfigArchive,
} from "@/lib/marketer/setup";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(createMarketerConfigArchive());
}

export async function POST(request: NextRequest) {
  try {
    const archive = coerceMarketerConfigArchive((await request.json()) as unknown);
    return NextResponse.json(importMarketerConfigArchive(archive));
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Configuration import failed.",
      },
      { status: 400 },
    );
  }
}
