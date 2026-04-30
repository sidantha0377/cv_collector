import { odata } from "@azure/data-tables";
import { v4 as uuidv4 } from "uuid";
import { getTableClient, TABLE_NAMES } from "./table-client";
import type {
  OtpRecordEntity,
  SessionEntity,
  CvEntity,
  ApplicationEntity,
  JobEntity,
} from "../types/azure-tables";

function descRowKey(): string {
  const desc = String(Number.MAX_SAFE_INTEGER - Date.now()).padStart(16, "0");
  return `${desc}_${uuidv4()}`;
}

/** Ascending row key for chat messages (oldest first) */
function ascRowKey(): string {
  return `${Date.now()}_${uuidv4()}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export const otpRepository = {
  async create(email: string, code: string, role: string, ttlMinutes: number) {
    const client = getTableClient(TABLE_NAMES.OTP_RECORDS);
    const safeTtl = Number(ttlMinutes) || 10;
    const expiresAt = new Date(Date.now() + safeTtl * 60_000).toISOString();

    const entity = {
      partitionKey: email.toLowerCase(),
      rowKey: code,
      role,
      expiresAt,
      used: false,
    };

    return await client.createEntity(entity);
  },

  async findValid(
    email: string,
    otpCode: string,
  ): Promise<OtpRecordEntity | null> {
    const client = getTableClient(TABLE_NAMES.OTP_RECORDS);
    try {
      const entity = await client.getEntity<OtpRecordEntity>(
        email.toLowerCase(),
        otpCode,
      );
      if (entity.used) return null;
      if (new Date(entity.expiresAt) < new Date()) return null;
      return entity;
    } catch {
      return null;
    }
  },

  async markUsed(email: string, otpCode: string): Promise<void> {
    const client = getTableClient(TABLE_NAMES.OTP_RECORDS);
    await client.updateEntity(
      { partitionKey: email.toLowerCase(), rowKey: otpCode, used: true },
      "Merge",
    );
  },
};

export const sessionRepository = {
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
      createdAt: nowIso(),
      metaJson: meta ? JSON.stringify(meta) : undefined,
    };

    await client.upsertEntity(entity, "Replace");
    return entity;
  },

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

  async delete(role: SessionEntity["role"], sessionId: string): Promise<void> {
    const client = getTableClient(TABLE_NAMES.SESSIONS);
    await client.deleteEntity(role, sessionId);
  },
};

export const applicationRepository = {
  async create(
    candidateRowKey: string,
    candidateEmail: string,
    jobId: string,
    jobTitle: string,
    company: string,
    cvId?: string,
  ): Promise<ApplicationEntity> {
    const client = getTableClient(TABLE_NAMES.APPLICATIONS);
    const applicationId = uuidv4();

    const entity: ApplicationEntity = {
      partitionKey: candidateRowKey,
      rowKey: applicationId,
      candidateEmail: candidateEmail.toLowerCase(),
      jobId,
      jobTitle,
      company,
      status: "pending",
      appliedAt: nowIso(),
      cvId,
    };

    await client.upsertEntity(entity, "Replace");
    return entity;
  },

  async listByCandidate(candidateRowKey: string): Promise<ApplicationEntity[]> {
    const client = getTableClient(TABLE_NAMES.APPLICATIONS);
    const applications: ApplicationEntity[] = [];

    const entities = client.listEntities<ApplicationEntity>({
      queryOptions: {
        filter: odata`PartitionKey eq ${candidateRowKey}`,
      },
    });

    for await (const entity of entities) {
      applications.push(entity);
    }

    return applications.sort(
      (a, b) =>
        new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
    );
  },

  async updateStatus(
    candidateRowKey: string,
    applicationId: string,
    status: ApplicationEntity["status"],
  ): Promise<void> {
    const client = getTableClient(TABLE_NAMES.APPLICATIONS);
    await client.updateEntity(
      { partitionKey: candidateRowKey, rowKey: applicationId, status },
      "Merge",
    );
  },

  async getById(
    candidateRowKey: string,
    applicationId: string,
  ): Promise<ApplicationEntity | null> {
    const client = getTableClient(TABLE_NAMES.APPLICATIONS);
    try {
      return await client.getEntity<ApplicationEntity>(
        candidateRowKey,
        applicationId,
      );
    } catch {
      return null;
    }
  },
};
// cv repo
export const cvRepository = {
  // partitionKey = session.email (stable across logins)
  // rowKey       = uuid (unique per CV)

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
      uploadedAt: nowIso(),
    };

    console.log(
      "[cvRepository.create] partitionKey:",
      entity.partitionKey,
      "rowKey:",
      entity.rowKey,
    );

    await client.upsertEntity(entity, "Replace");
    return entity;
  },

  async listByUser(email: string): Promise<CvEntity[]> {
    const client = getTableClient(TABLE_NAMES.CVS);
    const cvs: CvEntity[] = [];

    const normalizedEmail = email.toLowerCase();
    console.log(
      "[cvRepository.listByUser] querying partitionKey:",
      normalizedEmail,
    );

    const entities = client.listEntities<CvEntity>({
      queryOptions: {
        filter: odata`PartitionKey eq ${normalizedEmail}`,
      },
    });

    for await (const entity of entities) {
      console.log(
        "[cvRepository.listByUser] found:",
        entity.rowKey,
        entity.fileName,
      );
      cvs.push(entity);
    }

    console.log("[cvRepository.listByUser] total:", cvs.length);

    return cvs.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    );
  },

  async getById(email: string, cvId: string): Promise<CvEntity | null> {
    const client = getTableClient(TABLE_NAMES.CVS);
    try {
      const entity = await client.getEntity<CvEntity>(
        email.toLowerCase(),
        cvId,
      );
      console.log("[cvRepository.getById] found:", entity.rowKey);
      return entity;
    } catch {
      console.log(
        "[cvRepository.getById] not found — email:",
        email,
        "cvId:",
        cvId,
      );
      return null;
    }
  },

  async delete(email: string, cvId: string): Promise<void> {
    const client = getTableClient(TABLE_NAMES.CVS);
    console.log(
      "[cvRepository.delete] partitionKey:",
      email.toLowerCase(),
      "rowKey:",
      cvId,
    );
    await client.deleteEntity(email.toLowerCase(), cvId);
  },
};

export const jobRepository = {
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

  async getById(tenantId: string, jobId: string): Promise<JobEntity | null> {
    const client = getTableClient(TABLE_NAMES.JOBS);
    try {
      return await client.getEntity<JobEntity>(tenantId, jobId);
    } catch {
      return null;
    }
  },
};
