import { NextRequest, NextResponse } from "next/server";
import {
  MARKETER_SESSION_COOKIE,
  MARKETER_SESSION_VALUE,
} from "@/lib/auth/marketer-session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "login";
  const redirect = searchParams.get("redirect") ?? "/marketer";

  const response = NextResponse.redirect(new URL(redirect, request.url));

  if (mode === "logout") {
    response.cookies.delete(MARKETER_SESSION_COOKIE);
    return response;
  }

  response.cookies.set(MARKETER_SESSION_COOKIE, MARKETER_SESSION_VALUE, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
