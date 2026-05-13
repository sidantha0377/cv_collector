import { applicationRepository } from "@/lib/repositories/applicationRepository";
import { jobRepository } from "@/lib/repositories/jobRepository";
import { candidateService } from "@/lib/service/candidate/candidate-service";
import type { ApplicationEntity } from "../../types/azure-tables";

export type Application = ApplicationEntity;

function normalizeTags(tags: string[]): string[] {
  return Array.from(
    new Set((tags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean)),
  );
}

export async function getApplicationsByCandidate(
  candidateRowKey: string,
): Promise<Application[]> {
  return applicationRepository.listByCandidate(candidateRowKey);
}

export async function applyToJob(params: {
  tenantId: string;
  candidateRowKey: string; // partition key for applications
  candidateEmail: string;
  jobId: string;
  cvId?: string;
}): Promise<Application> {
  // 1) load job
  const job = await jobRepository.getById(params.tenantId, params.jobId);
  if (!job) throw new Error("Job not found");

  // 2) prevent duplicate apply (if your repo supports it)
  const already = await applicationRepository.findByCandidateAndJob(
    params.candidateRowKey,
    params.jobId,
  );
  if (already) throw new Error("Already applied for this job");

  // 3) create application
  const created = await applicationRepository.create(
    params.candidateRowKey,
    params.candidateEmail,
    params.jobId,
    job.title,
    job.company,
    params.cvId,
  );
  // 4) merge job tags into candidate ftags
  const jobTags = normalizeTags(JSON.parse(job.tags || "[]") as string[]);
  if (jobTags.length > 0) {
    const profile = await candidateService.getProfile(
      "default",
      params.candidateEmail,
    );

    if (!profile) {
      await candidateService.createProfile(
        "default",
        params.candidateEmail,
        true,
        jobTags,
      );
    } else {
      const mergedTags = normalizeTags([...(profile.ftags ?? []), ...jobTags]);
      console.log(mergedTags);
      await candidateService.updateProfile("default", params.candidateEmail, {
        enotify: profile.enotify,
        ftags: mergedTags,
      });
    }
  }

  return created;
}
