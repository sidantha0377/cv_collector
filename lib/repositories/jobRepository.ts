import { odata } from "@azure/data-tables";
import { getTableClient, TABLE_NAMES } from "@/lib/azure/table-client";
import type { JobEntity } from "@/lib/types/azure-tables";

// Handles retrieval and persistence of job postings.

export const jobRepository = {
  // Fetches all active jobs across all tenants (for candidates browsing)
  async listActive(tenantId: string): Promise<JobEntity[]> {
    const client = getTableClient(TABLE_NAMES.JOBS);
    const jobs: JobEntity[] = [];

    const entities = client.listEntities<JobEntity>({
      queryOptions: {
        filter: odata`isActive eq true`,
      },
    });

    for await (const entity of entities) {
      jobs.push(entity);
    }

    return jobs.sort(
      (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
    );
  },

  // Fetches active jobs belonging to a specific admin/tenant (for admin dashboard)
  async listAdmin(tenantId: string): Promise<JobEntity[]> {
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

  // Persists a new job entity
  async create(job: JobEntity): Promise<void> {
    const client = getTableClient(TABLE_NAMES.JOBS);
    try {
      await client.createEntity<JobEntity>(job);
    } catch (error) {
      console.error("Error creating job entity:", error);
      throw new Error("Failed to persist job to storage.");
    }
  },

  // Fetches a single job by tenantId (partitionKey) and jobId (rowKey)
  async getById(tenantId: string, jobId: string): Promise<JobEntity | null> {
    const client = getTableClient(TABLE_NAMES.JOBS);
    try {
      return await client.getEntity<JobEntity>(tenantId, jobId);
    } catch {
      return null;
    }
  },

  // Partially updates a job entity.
  // Only the fields in `changes` are written to the stored row — everything
  // else is preserved because Azure Table Storage "Merge" mode only overwrites
  // the keys that are present in the submitted entity object.
  async update(
    tenantId: string,
    jobId: string,
    changes: Partial<Omit<JobEntity, "partitionKey" | "rowKey">>,
  ): Promise<void> {
    const client = getTableClient(TABLE_NAMES.JOBS);

    // Azure Data Tables SDK requires a fully-typed entity object — it cannot
    // infer the type from a plain spread.  We build a complete JobEntity with
    // the real identity keys and only the changed fields on top.  The "Merge"
    // mode guarantees that the placeholder values below are NEVER written to
    // storage; Azure only touches the keys that are actually present in the
    // patch AND differ from the stored row.
    const patch: JobEntity = Object.assign(
      {
        // Identity — always required
        partitionKey: tenantId,
        rowKey: jobId,
        // Placeholder values for every required JobEntity field.
        // These are present purely to satisfy TypeScript; they will NOT be
        // written to the stored row because we use "Merge" mode.
        title: "",
        company: "",
        location: "",
        type: "full-time" as JobEntity["type"],
        description: "",
        requirements: "",
        tags: "",
        adminId: "",
        postedAt: "",
        isActive: false,
        notify: false,
        notifyStates: "not_selected" as JobEntity["notifyStates"],
      } satisfies JobEntity,
      changes, // real changes overwrite the placeholders above
    );

    try {
      await client.updateEntity<JobEntity>(patch, "Merge");
    } catch (error) {
      console.error(`Error updating job entity [${tenantId}/${jobId}]:`, error);
      throw new Error("Failed to update job in storage.");
    }
  },
};
