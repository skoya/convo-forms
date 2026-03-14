import { NextResponse } from "next/server";
import { getRepositorySummary, resetRepositories } from "@/lib/repos";

export const dynamic = "force-dynamic";

export async function POST() {
  resetRepositories();
  return NextResponse.json(getRepositorySummary());
}
