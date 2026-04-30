import { NextRequest, NextResponse } from "next/server";
import { otpService } from "@/lib/otp/otp-service";

export async function POST(req: NextRequest) {
  let body: { email?: string; role?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, role } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  if (role !== "candidate" && role !== "admin") {
    return NextResponse.json(
      { error: 'role must be "candidate" or "admin"' },
      { status: 400 },
    );
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 },
    );
  }

  const result = await otpService.send(email.toLowerCase(), role);

  if (!result.success) {
    console.error("[POST /api/auth/send-otp] Send failed:", result.error);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 },
    );
  }

  // Always return a generic success — never reveal if the email exists or not
  return NextResponse.json(
    { message: "If this email is registered, a code has been sent." },
    { status: 200 },
  );
}
