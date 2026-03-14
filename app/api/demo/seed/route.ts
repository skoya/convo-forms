import { NextResponse } from "next/server";
import { seedDemoData } from "@/lib/repos";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(seedDemoData());
}
