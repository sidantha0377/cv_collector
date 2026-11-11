import { candidateRepository } from "@/lib/repositories/candidateRepository";
import type { CandidateEntity } from "@/lib/types/azure-tables";

type CandidatePreferenceDto = {
  tenantId: string;
  email: string;
  enotify: boolean;
  ftags: string[];
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeTags(tags: string[]): string[] {
  return Array.from(
    new Set((tags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean)),
  );
}

function parseTags(ftags: string | undefined): string[] {
  if (!ftags) return [];
  try {
    const parsed = JSON.parse(ftags);
    return Array.isArray(parsed)
      ? parsed
          .map(String)
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

function toDto(entity: CandidateEntity): CandidatePreferenceDto {
  return {
    tenantId: entity.partitionKey,
    email: entity.email,
    enotify: entity.enotify,
    ftags: parseTags(entity.ftags),
  };
}

function hasAtLeastOneMatch(
  candidateTags: string[],
  inputTags: string[],
): boolean {
  const input = new Set(inputTags);
  return candidateTags.some((t) => input.has(t));
}

export const candidateService = {
  // CREATE profile (fails if already exists)
  async createProfile(
    tenantId: string,
    email: string,
    enotify: boolean,
    ftags: string[],
  ): Promise<CandidatePreferenceDto> {
    const safeTenantId = tenantId.trim();
    const safeEmail = normalizeEmail(email);
    const safeTags = normalizeTags(ftags);

    if (!safeTenantId) throw new Error("tenantId is required");
    if (!safeEmail) throw new Error("email is required");

    const existing = await candidateRepository.findByEmail(
      safeTenantId,
      safeEmail,
    );
    if (existing) throw new Error("Candidate profile already exists");

    const created = await candidateRepository.create(
      safeTenantId,
      safeEmail,
      !!enotify,
      safeTags,
    );

    return toDto(created);
  },

  // UPDATE profile (all fields)
  async updateProfile(
    tenantId: string,
    email: string,
    updates: { enotify: boolean; ftags: string[] },
  ): Promise<CandidatePreferenceDto> {
    const safeTenantId = tenantId.trim();
    const safeEmail = normalizeEmail(email);
    const safeTags = normalizeTags(updates.ftags);

    if (!safeTenantId) throw new Error("tenantId is required");
    if (!safeEmail) throw new Error("email is required");

    // upsert-style update
    const saved = await candidateRepository.upsertPreference(
      safeTenantId,
      safeEmail,
      !!updates.enotify,
      safeTags,
    );

    return toDto(saved);
  },

  // Optional: get one profile
  async getProfile(
    tenantId: string,
    email: string,
  ): Promise<CandidatePreferenceDto | null> {
    const safeTenantId = tenantId.trim();
    const safeEmail = normalizeEmail(email);

    if (!safeTenantId) throw new Error("tenantId is required");
    if (!safeEmail) throw new Error("email is required");

    const entity = await candidateRepository.findByEmail(
      safeTenantId,
      safeEmail,
    );
    return entity ? toDto(entity) : null;
  },

  // REQUIRED: get emails where enotify=true and at least one ftag matches input tag array
  async getNotifiableEmailsByTags(
    tenantId: string,
    inputTags: string[],
  ): Promise<string[]> {
    const safeTenantId = tenantId.trim();
    const safeInputTags = normalizeTags(inputTags);

    if (!safeTenantId) throw new Error("tenantId is required");
    if (safeInputTags.length === 0) return [];

    // repo already filters enotify=true
    const notifiable = await candidateRepository.listNotifiable(safeTenantId);

    return notifiable
      .filter((candidate) => {
        const candidateTags = parseTags(candidate.ftags);
        return hasAtLeastOneMatch(candidateTags, safeInputTags);
      })
      .map((candidate) => candidate.email);
  },

  async deleteProfile(tenantId: string, email: string): Promise<void> {
    const safeTenantId = tenantId.trim();
    const safeEmail = normalizeEmail(email);

    if (!safeTenantId) throw new Error("tenantId is required");
    if (!safeEmail) throw new Error("email is required");

    await candidateRepository.delete(safeTenantId, safeEmail);
  },
};
