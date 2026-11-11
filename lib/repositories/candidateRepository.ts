import { getTableClient, TABLE_NAMES } from "@/lib/azure/table-client";
import type { CandidateEntity } from "@/lib/types/azure-tables";

// Manages candidate notification preferences and favorite tags.
// Suggested key design:
// - partitionKey: tenantId (or "default" if single tenant)
// - rowKey: candidate email (lowercase)

export const candidateRepository = {
  // Get one candidate by tenant + email
  async findByEmail(
    tenantId: string,
    email: string,
  ): Promise<CandidateEntity | null> {
    const client = getTableClient(TABLE_NAMES.CANDIDATES);
    // console.log(client);

    try {
      const entity = await client.getEntity<CandidateEntity>(
        tenantId,
        email.toLowerCase(),
      );
      return entity;
    } catch {
      return null;
    }
  },

  // Create or update candidate notification settings
  async upsertPreference(
    tenantId: string,
    email: string,
    enotify: boolean,
    ftags: string[],
  ): Promise<CandidateEntity> {
    const client = getTableClient(TABLE_NAMES.CANDIDATES);

    const normalizedTags = Array.from(
      new Set((ftags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean)),
    );

    const entity: CandidateEntity = {
      partitionKey: tenantId,
      rowKey: email.toLowerCase(),
      email: email.toLowerCase(),
      enotify,
      ftags: JSON.stringify(normalizedTags), // stored as string per your type
    };

    await client.upsertEntity(entity, "Replace");
    return entity;
  },

  // Enable/disable candidate email notifications only
  async updateNotify(
    tenantId: string,
    email: string,
    enotify: boolean,
  ): Promise<void> {
    const client = getTableClient(TABLE_NAMES.CANDIDATES);

    await client.updateEntity(
      {
        partitionKey: tenantId,
        rowKey: email.toLowerCase(),
        enotify,
      },
      "Merge",
    );
  },
  async create(
    tenantId: string,
    email: string,
    enotify: boolean,
    ftags: string[],
  ): Promise<CandidateEntity> {
    const client = getTableClient(TABLE_NAMES.CANDIDATES);

    const normalizedTags = Array.from(
      new Set((ftags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean)),
    );

    const entity: CandidateEntity = {
      partitionKey: tenantId,
      rowKey: email.toLowerCase(),
      email: email.toLowerCase(),
      enotify,
      ftags: JSON.stringify(normalizedTags), // stored as string
    };

    await client.createEntity(entity);
    return entity;
  },

  // Update only favorite tags
  async updateTags(
    tenantId: string,
    email: string,
    ftags: string[],
  ): Promise<void> {
    const client = getTableClient(TABLE_NAMES.CANDIDATES);

    const normalizedTags = Array.from(
      new Set((ftags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean)),
    );

    await client.updateEntity(
      {
        partitionKey: tenantId,
        rowKey: email.toLowerCase(),
        ftags: JSON.stringify(normalizedTags),
      },
      "Merge",
    );
  },

  // Delete candidate preference record
  async delete(tenantId: string, email: string): Promise<void> {
    const client = getTableClient(TABLE_NAMES.CANDIDATES);
    await client.deleteEntity(tenantId, email.toLowerCase());
  },

  // List all candidates in tenant
  async listAll(tenantId: string): Promise<CandidateEntity[]> {
    const client = getTableClient(TABLE_NAMES.CANDIDATES);
    const items: CandidateEntity[] = [];

    const safeTenantId = tenantId.replace(/'/g, "''");
    const entities = client.listEntities<CandidateEntity>({
      queryOptions: { filter: `PartitionKey eq '${safeTenantId}'` },
    });

    for await (const entity of entities) {
      items.push(entity);
    }

    return items.sort((a, b) => a.email.localeCompare(b.email));
  },

  // List only candidates with email notifications enabled
  async listNotifiable(tenantId: string): Promise<CandidateEntity[]> {
    const client = getTableClient(TABLE_NAMES.CANDIDATES);
    const items: CandidateEntity[] = [];

    const safeTenantId = tenantId.replace(/'/g, "''");
    const entities = client.listEntities<CandidateEntity>({
      queryOptions: {
        filter: `PartitionKey eq '${safeTenantId}' and enotify eq true`,
      },
    });

    for await (const entity of entities) {
      items.push(entity);
    }

    return items;
  },
};
