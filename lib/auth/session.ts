import { cookies } from "next/headers";
import { sessionRepository } from "@/lib/repositories/sessionRepository";
import type { SessionEntity } from "../types/azure-tables";
import { SessionMeta } from "./session-utils";
export { parseSessionMeta } from "@/lib/auth/session-utils";
export type { SessionMeta };

const SESSION_COOKIE = "session_id";
const ROLE_COOKIE = "session_role";

export async function getSession(): Promise<SessionEntity | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  const role = cookieStore.get(ROLE_COOKIE)?.value as
    | SessionEntity["role"]
    | undefined;

  if (!sessionId || !role) return null;

  const result = await sessionRepository.findById(role, sessionId);

  return result;
}

export async function createSession(
  email: string,
  role: SessionEntity["role"],
  tenantId: string,
  meta?: SessionMeta,
): Promise<SessionEntity> {
  const entity = await sessionRepository.create(email, role, tenantId, meta);

  const expires = new Date(entity.expiresAt);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, entity.sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });

  cookieStore.set(ROLE_COOKIE, role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });

  return entity;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  const role = cookieStore.get(ROLE_COOKIE)?.value as
    | SessionEntity["role"]
    | undefined;

  if (sessionId && role) {
    try {
      await sessionRepository.delete(role, sessionId);
    } catch {}
  }

  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(ROLE_COOKIE);
}

export async function requireSession(): Promise<SessionEntity> {
  const session = await getSession();
  if (!session) throw new Error("Unauthenticated");
  return session;
}

export async function requireAdmin(): Promise<SessionEntity> {
  const session = await requireSession();
  if (session.role !== "admin") throw new Error("Forbidden");
  return session;
}
