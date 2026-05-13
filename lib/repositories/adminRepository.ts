import { getTableClient, TABLE_NAMES } from "@/lib/azure/table-client";
import type { AdminEntity } from "@/lib/types/azure-tables";

// Manages the admin whitelist — only emails in this table can log in as admin.

export const adminRepository = {
  // Check if an email is an authorized admin
  async findByEmail(email: string): Promise<AdminEntity | null> {
    const client = getTableClient(TABLE_NAMES.ADMINS);
    try {
      const entity = await client.getEntity<AdminEntity>(
        "admin",
        email.toLowerCase(),
      );
      return entity;
    } catch {
      return null; // not found = not an admin
    }
  },

  // Add a new admin (called from admin dashboard, not public signup)
  async create(email: string, createdBy: string): Promise<AdminEntity> {
    const client = getTableClient(TABLE_NAMES.ADMINS);

    const entity: AdminEntity = {
      partitionKey: "admin",
      rowKey: email.toLowerCase(),
      email: email.toLowerCase(),
      createdAt: new Date().toISOString(),
      createdBy: createdBy.toLowerCase(),
    };

    await client.upsertEntity(entity, "Replace");
    return entity;
  },

  // Remove an admin
  async delete(email: string): Promise<void> {
    const client = getTableClient(TABLE_NAMES.ADMINS);
    await client.deleteEntity("admin", email.toLowerCase());
  },

  // List all admins (for the admin dashboard manage page)
  async listAll(): Promise<AdminEntity[]> {
    const client = getTableClient(TABLE_NAMES.ADMINS);
    const admins: AdminEntity[] = [];

    const entities = client.listEntities<AdminEntity>({
      queryOptions: { filter: `PartitionKey eq 'admin'` },
    });

    for await (const entity of entities) {
      admins.push(entity);
    }

    return admins.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },
};
