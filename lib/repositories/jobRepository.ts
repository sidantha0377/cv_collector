import { odata } from "@azure/data-tables";
import { getTableClient, TABLE_NAMES } from "@/lib/azure/table-client";
import type { JobEntity } from "@/lib/types/azure-tables";

// Handles retrieval of job postings for specific tenants (companies).

export const jobRepository = {
  // Fetches only active jobs for a company
  async listActive(tenantId: string): Promise<JobEntity[]> {
    const client = getTableClient(TABLE_NAMES.JOBS);
    const jobs: JobEntity[] = [];
    const entities = client.listEntities<JobEntity>({
      queryOptions: {
        filter: odata`PartitionKey eq ${tenantId} and isActive eq true`,
      },
    });

    for await (const entity of entities) {
      jobs.push(entity);
    }
    return jobs.sort(
      (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
    );
  },

  // Fetches a single job detail
  async getById(tenantId: string, jobId: string): Promise<JobEntity | null> {
    const client = getTableClient(TABLE_NAMES.JOBS);
    try {
      return await client.getEntity<JobEntity>(tenantId, jobId);
    } catch {
      return null;
    }
  },
};
