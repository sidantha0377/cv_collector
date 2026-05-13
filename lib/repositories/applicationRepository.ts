import { odata } from "@azure/data-tables";
import { v4 as uuidv4 } from "uuid";
import { getTableClient, TABLE_NAMES } from "@/lib/azure/table-client";
import type { ApplicationEntity } from "@/lib/types/azure-tables";

//Manages the link between Candidates and Jobs.

export const applicationRepository = {
  // Links a candidate to a job post
  async create(
    candidateRowKey: string,
    candidateEmail: string,
    jobId: string,
    jobTitle: string,
    company: string,
    cvId?: string,
  ): Promise<ApplicationEntity> {
    const client = getTableClient(TABLE_NAMES.APPLICATIONS);
    const entity: ApplicationEntity = {
      partitionKey: candidateRowKey,
      rowKey: uuidv4(),
      candidateEmail: candidateEmail.toLowerCase(),
      jobId,
      jobTitle,
      company,
      status: "pending",
      appliedAt: new Date().toISOString(),
      cvId,
    };
    await client.upsertEntity(entity, "Replace");
    return entity;
  },
  // Finds an existing application for same candidate + same job
  async findByCandidateAndJob(
    candidateRowKey: string,
    jobId: string,
  ): Promise<ApplicationEntity | null> {
    const client = getTableClient(TABLE_NAMES.APPLICATIONS);
    const entities = client.listEntities<ApplicationEntity>({
      queryOptions: {
        filter: odata`PartitionKey eq ${candidateRowKey} and jobId eq ${jobId}`,
      },
    });
    for await (const entity of entities) {
      return entity; // first match is enough
    }
    return null;
  },

  // Queries all applications for a specific candidate
  async listByCandidate(candidateRowKey: string): Promise<ApplicationEntity[]> {
    const client = getTableClient(TABLE_NAMES.APPLICATIONS);
    const applications: ApplicationEntity[] = [];
    const entities = client.listEntities<ApplicationEntity>({
      queryOptions: { filter: odata`PartitionKey eq ${candidateRowKey}` },
    });

    for await (const entity of entities) {
      applications.push(entity);
    }
    return applications.sort(
      (a, b) =>
        new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
    );
  },
};
