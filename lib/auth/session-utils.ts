import type { SessionEntity } from "../types/azure-tables";

export interface SessionMeta {
  name?: string;
  phone?: string;
  location?: string;
}

export function parseSessionMeta(session: SessionEntity): SessionMeta {
  if (!session.metaJson) return {};
  try {
    return JSON.parse(session.metaJson) as SessionMeta;
  } catch {
    return {};
  }
}
