// app/api/auth/verify-otp/route.ts

import { NextRequest, NextResponse } from "next/server";
import { otpService } from "@/lib/otp/otp-service";
import { sessionRepository } from "@/lib/azure/repositories";

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID ?? "default";

export async function POST(req: NextRequest) {
  let body: { email?: string; otpCode?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, otpCode } = body;

  if (!email || !otpCode) {
    return NextResponse.json(
      { error: "email and otpCode are required" },
      { status: 400 },
    );
  }

  const result = await otpService.verify(email.toLowerCase(), otpCode.trim());

  if (!result.valid) {
    return NextResponse.json(
      { error: result.error ?? "Invalid or expired code." },
      { status: 401 },
    );
  }

  const session = await sessionRepository.create(
    email.toLowerCase(),
    result.role!,
    DEFAULT_TENANT_ID,
  );

  const response = NextResponse.json(
    { message: "Authenticated successfully", role: result.role },
    { status: 200 },
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };

  // ← must match SESSION_COOKIE and ROLE_COOKIE in session.ts exactly
  response.cookies.set("session_id", session.sessionId, cookieOptions);
  response.cookies.set("session_role", result.role!, cookieOptions);

  return response;
}
