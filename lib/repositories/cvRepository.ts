import { odata } from "@azure/data-tables";
import { v4 as uuidv4 } from "uuid";
import { getTableClient, TABLE_NAMES } from "@/lib/azure/table-client";
import type { CvEntity } from "@/lib/types/azure-tables";

//Stores metadata and parsed text content of uploaded resumes.

export const cvRepository = {
  /**
   * Creates a new CV record.
   * PartitionKey: User's normalized email (allows efficient listing by user).
   * RowKey: Random UUID (allows multiple CVs per user).
   */
  async create(
    email: string,
    fileName: string,
    blobName: string,
    url: string,
    content: string,
  ): Promise<CvEntity> {
    const client = getTableClient(TABLE_NAMES.CVS);

    const entity: CvEntity = {
      partitionKey: email.toLowerCase(),
      rowKey: uuidv4(),
      fileName,
      blobName,
      url,
      content,
      uploadedAt: new Date().toISOString(),
    };

    console.log(`[cvRepository.create] Creating CV for ${entity.partitionKey}`);

    await client.upsertEntity(entity, "Replace");
    return entity;
  },

  // Retrieves all CVs for a specific user, sorted by newest first.

  async listByUser(email: string): Promise<CvEntity[]> {
    const client = getTableClient(TABLE_NAMES.CVS);
    const cvs: CvEntity[] = [];
    const normalizedEmail = email.toLowerCase();

    const entities = client.listEntities<CvEntity>({
      queryOptions: {
        filter: odata`PartitionKey eq ${normalizedEmail}`,
      },
    });

    for await (const entity of entities) {
      cvs.push(entity);
    }

    // Sort descending by upload date
    return cvs.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    );
  },

  //Fetches a single CV by its ID and user email.

  async getById(email: string, cvId: string): Promise<CvEntity | null> {
    const client = getTableClient(TABLE_NAMES.CVS);
    try {
      const entity = await client.getEntity<CvEntity>(
        email.toLowerCase(),
        cvId,
      );
      return entity;
    } catch (error) {
      console.error(`[cvRepository.getById] CV ${cvId} not found for ${email}`);
      return null;
    }
  },

  /**
   * Deletes a CV record from the table.
   * Note: This does not delete the file from Blob Storage (that should be handled in a Service).
   */
  async delete(email: string, cvId: string): Promise<void> {
    const client = getTableClient(TABLE_NAMES.CVS);
    console.log(`[cvRepository.delete] Removing CV ${cvId}`);
    await client.deleteEntity(email.toLowerCase(), cvId);
  },
};
