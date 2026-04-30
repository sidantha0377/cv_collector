"use server";

import { redirect } from "next/navigation";
import { otpService } from "@/lib/otp/otp-service";
import { sessionRepository } from "@/lib/azure/repositories";
import { destroySession } from "@/lib/session";
import { cookies } from "next/headers";

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID ?? "default";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export async function sendOtp(email: string, role: "candidate" | "admin") {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new Error("Invalid email address");
  if (role !== "candidate" && role !== "admin") throw new Error("Invalid role");

  const result = await otpService.send(email.toLowerCase(), role);
  if (!result.success) throw new Error("Failed to send OTP. Please try again.");
}

export async function verifyOtp(email: string, otpCode: string) {
  const result = await otpService.verify(email.toLowerCase(), otpCode.trim());

  if (!result.valid)
    throw new Error(result.error ?? "Invalid or expired code.");

  const session = await sessionRepository.create(
    email.toLowerCase(),
    result.role!,
    DEFAULT_TENANT_ID,
  );

  const cookieStore = await cookies();
  cookieStore.set("session_id", session.sessionId, cookieOptions);
  cookieStore.set("session_role", result.role!, cookieOptions);

  redirect(result.role === "admin" ? "/admin" : "/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
