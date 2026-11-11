import { getTableClient, TABLE_NAMES } from "@/lib/azure/table-client";
import type { TagsEntity } from "@/lib/types/azure-tables";

// Handles CRUD operations for tags.
export const tagRepository = {
  // Creates a new tag row (count starts at 1)
  async create(tenantId: string, tag: string): Promise<void> {
    const client = getTableClient(TABLE_NAMES.TAGS);
    const normalized = normalizeTag(tag);

    const entity: TagsEntity = {
      partitionKey: tenantId,
      rowKey: normalized,
      tag: normalized,
      count: 1,
    };

    await client.createEntity(entity);
  },

  // Gets one tag by tenant + tag
  async get(tenantId: string, tag: string): Promise<TagsEntity | null> {
    const client = getTableClient(TABLE_NAMES.TAGS);
    const normalized = normalizeTag(tag);

    try {
      return await client.getEntity<TagsEntity>(tenantId, normalized);
    } catch {
      return null;
    }
  },

  // Lists all tags for a tenant
  async listByTenant(tenantId: string): Promise<TagsEntity[]> {
    const client = getTableClient(TABLE_NAMES.TAGS);
    const items: TagsEntity[] = [];

    const escapedTenant = tenantId.replace(/'/g, "''");
    const entities = client.listEntities<TagsEntity>({
      queryOptions: {
        filter: `PartitionKey eq '${escapedTenant}'`,
      },
    });

    for await (const entity of entities) {
      items.push(entity);
    }

    return items;
  },
  async listAll(): Promise<TagsEntity[]> {
    const client = getTableClient(TABLE_NAMES.TAGS);
    const items: TagsEntity[] = [];

    const entities = client.listEntities<TagsEntity>();
    for await (const entity of entities) {
      items.push(entity);
    }

    return items;
  },

  // Updates an existing tag (e.g. count change)
  async updateCount(
    tenantId: string,
    tag: string,
    count: number,
  ): Promise<void> {
    const client = getTableClient(TABLE_NAMES.TAGS);
    const normalized = normalizeTag(tag);

    await client.updateEntity(
      {
        partitionKey: tenantId,
        rowKey: normalized,
        tag: normalized,
        count,
      },
      "Merge",
    );
  },

  // Deletes a tag row
  async delete(tenantId: string, tag: string): Promise<void> {
    const client = getTableClient(TABLE_NAMES.TAGS);
    const normalized = normalizeTag(tag);

    await client.deleteEntity(tenantId, normalized);
  },
};

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}
