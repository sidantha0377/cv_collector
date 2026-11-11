"use server";

import { redirect } from "next/navigation";
import { otpService } from "@/lib/service/otp/otp-service";
import { sessionRepository } from "@/lib/repositories/sessionRepository";
import { adminRepository } from "@/lib/repositories/adminRepository";
import { candidateService } from "@/lib/service/candidate/candidate-service";
import { destroySession, getSession } from "@/lib/auth/session";
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

export async function verifyOtp(
  email: string,
  otpCode: string,
  role: "candidate" | "admin",
) {
  const normalizedEmail = email.toLowerCase().trim();

  if (role === "admin") {
    const adminRecord = await adminRepository.findByEmail(normalizedEmail);
    if (!adminRecord) throw new Error("Unauthorized");
  }

  const result = await otpService.verify(normalizedEmail, otpCode.trim());
  if (!result.valid)
    throw new Error(result.error ?? "Invalid or expired code.");

  const resolvedRole = result.role as "candidate" | "admin";

  const session = await sessionRepository.create(
    normalizedEmail,
    resolvedRole,
    DEFAULT_TENANT_ID,
  );

  // NEW: ensure candidate profile exists
  if (resolvedRole === "candidate") {
    const existing = await candidateService.getProfile(
      DEFAULT_TENANT_ID,
      normalizedEmail,
    );

    if (!existing) {
      await candidateService.createProfile(
        DEFAULT_TENANT_ID,
        normalizedEmail,
        true, // default notify on
        [], // default no preferred tags
      );
    }
  }

  const cookieStore = await cookies();
  cookieStore.set("session_id", session.sessionId, cookieOptions);
  cookieStore.set("session_role", resolvedRole, cookieOptions);

  redirect(resolvedRole === "admin" ? "/admin" : "/dashboard");
}

export async function getSessionRole(): Promise<"candidate" | "admin" | null> {
  const session = await getSession();
  return session?.role ?? null;
}

export async function logout() {
  await destroySession();
  redirect("/");
}
