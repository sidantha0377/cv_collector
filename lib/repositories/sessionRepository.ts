import { v4 as uuidv4 } from "uuid";
import { getTableClient, TABLE_NAMES } from "@/lib/azure/table-client";
import type { SessionEntity } from "@/lib/types/azure-tables";

// Manages user authentication sessions and JWT-like metadata.

export const sessionRepository = {
  //Creates a persistent session in Azure Tables
  async create(
    email: string,
    role: SessionEntity["role"],
    tenantId: string,
    meta?: { name?: string; phone?: string; location?: string },
    ttlHours = 24 * 7,
  ): Promise<SessionEntity> {
    const client = getTableClient(TABLE_NAMES.SESSIONS);
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + ttlHours * 3_600_000).toISOString();

    const entity: SessionEntity = {
      partitionKey: role,
      rowKey: sessionId,
      sessionId,
      email: email.toLowerCase(),
      role,
      tenantId,
      expiresAt,
      createdAt: new Date().toISOString(),
      metaJson: meta ? JSON.stringify(meta) : undefined,
    };

    await client.upsertEntity(entity, "Replace");
    return entity;
  },

  // Retrieves a session if it hasn't expired
  async findById(
    role: SessionEntity["role"],
    sessionId: string,
  ): Promise<SessionEntity | null> {
    const client = getTableClient(TABLE_NAMES.SESSIONS);
    try {
      const entity = await client.getEntity<SessionEntity>(role, sessionId);
      if (new Date(entity.expiresAt) < new Date()) return null;
      return entity;
    } catch {
      return null;
    }
  },

  // Removes session from DB on logout
  async delete(role: SessionEntity["role"], sessionId: string): Promise<void> {
    const client = getTableClient(TABLE_NAMES.SESSIONS);
    await client.deleteEntity(role, sessionId);
  },
};
