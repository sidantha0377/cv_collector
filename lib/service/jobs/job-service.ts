import { jobRepository } from "@/lib/repositories/jobRepository";
import type { JobEntity } from "@/lib/types/azure-tables";
import { v4 as uuidv4 } from "uuid";
import { candidateService } from "@/lib/service/candidate/candidate-service";
import { sendBulkEmails } from "@/lib/service/email/email-service";
import {
  buildJobNotificationEmailHtml,
  buildJobNotificationEmailText,
} from "@/lib/service/jobs/job-notification-email";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

// ---------------------------------------------------------------------------
// Standalone notification function.
// Exported so it can be called from an admin "resend" action or retry job.
//
// IMPORTANT: Only invoke this when job.notify === true.
// createJob enforces this guard automatically; any other caller must check
// the flag themselves before calling this function.
// ---------------------------------------------------------------------------
export async function notifyMatchingCandidates(
  tenantId: string,
  job: JobEntity,
): Promise<{ notified: number; failed: number }> {
  // Guard — do nothing if the job was not flagged for notifications
  if (!job.notify) {
    console.info(`[notify] Job ${job.rowKey} has notify=false — skipping.`);
    return { notified: 0, failed: 0 };
  }

  // 1. Parse job tags; bail early when there are none
  const jobTags: string[] = JSON.parse(job.tags || "[]");
  if (jobTags.length === 0) {
    console.info(
      `[notify] Job ${job.rowKey} has no tags — skipping notifications.`,
    );
    return { notified: 0, failed: 0 };
  }

  // 2. Find candidates who opted in AND share at least one tag with this job
  const emails = await candidateService.getNotifiableEmailsByTags(
    tenantId,
    jobTags,
  );

  if (emails.length === 0) {
    console.info(
      `[notify] No matching candidates for job ${job.rowKey} (tags: ${jobTags.join(", ")}).`,
    );
    return { notified: 0, failed: 0 };
  }

  console.info(
    `[notify] Sending notifications for job ${job.rowKey} to ${emails.length} candidate(s).`,
  );

  // 3. Build email content from the dedicated email module
  const jobUrl = `${BASE_URL}/jobs/${job.rowKey}`;
  const html = buildJobNotificationEmailHtml(job, jobUrl);
  const text = buildJobNotificationEmailText(job, jobUrl);

  // 4. Send in batches via the shared bulk-email helper
  const result = await sendBulkEmails({
    recipients: emails.map((email) => ({ id: email, email })),
    subject: `New job match: ${job.title} at ${job.company}`,
    html,
    text,
    batchSize: 5,
    delayMsBetweenBatches: 800,
  });

  if (result.failed > 0) {
    console.warn(
      `[notify] ${result.failed} email(s) failed for job ${job.rowKey}:`,
      result.failures,
    );
  }

  console.info(
    `[notify] Job ${job.rowKey}: sent=${result.sent}, failed=${result.failed}.`,
  );

  return { notified: result.sent, failed: result.failed };
}

// ---------------------------------------------------------------------------
// Derive the notifyStates audit value from send results.
// Only returns values that exist on JobEntity["notifyStates"]:
//   "not_selected" | "pending" | "complet"
// ---------------------------------------------------------------------------
function resolveNotifyState(
  notified: number,
  failed: number,
): JobEntity["notifyStates"] {
  // Any successful send → mark as complete
  if (notified > 0) return "complet";
  // notify=true was set but zero candidates matched — still mark complete
  // so the admin knows the dispatch ran (just had no recipients)
  if (notified === 0 && failed === 0) return "complet";
  // Every send attempt failed → fall back to pending so a retry is possible
  return "pending";
}

// ---------------------------------------------------------------------------
// Job service
// ---------------------------------------------------------------------------
export const jobService = {
  // Creates a new job posting.
  // When data.notify === true the job is persisted first, then matching
  // candidates are emailed asynchronously (fire-and-forget) so the API
  // response is not blocked by bulk email delivery.
  async createJob(
    tenantId: string,
    adminId: string,
    data: {
      title: string;
      company: string;
      location: string;
      type: JobEntity["type"];
      description: string;
      requirements: string[];
      tags: string[];
      closingAt?: string;
      notify: boolean;
    },
  ): Promise<JobEntity> {
    const newJob: JobEntity = {
      partitionKey: adminId,
      rowKey: uuidv4(),
      title: data.title,
      company: data.company,
      location: data.location,
      type: data.type,
      description: data.description,
      requirements: JSON.stringify(data.requirements),
      tags: JSON.stringify(data.tags),
      adminId: tenantId,
      postedAt: new Date().toISOString(),
      closingAt: data.closingAt,
      isActive: true,
      notify: data.notify,
      // "pending"      → notifications requested but not yet dispatched
      // "not_selected" → admin chose not to notify candidates
      notifyStates: data.notify ? "pending" : "not_selected",
    };

    await jobRepository.create(newJob);

    // Only proceed when the admin explicitly opted in to notifications.
    // notifyMatchingCandidates also re-checks the flag internally as a
    // second line of defence.
    if (data.notify) {
      void notifyMatchingCandidates(tenantId, newJob)
        .then(async ({ notified, failed }) => {
          const nextState = resolveNotifyState(notified, failed);

          try {
            await jobRepository.update(adminId, newJob.rowKey, {
              ...newJob,
              notifyStates: nextState,
            });
          } catch (updateErr) {
            // Non-critical — the job was already saved successfully
            console.error(
              "[notify] Failed to update notifyStates for job",
              newJob.rowKey,
              updateErr,
            );
          }
        })
        .catch((err) => {
          console.error(
            "[notify] Unhandled error during notifications for job",
            newJob.rowKey,
            err,
          );
        });
    }

    return newJob;
  },

  async getAllJobsForAdmin(tenantId: string): Promise<JobEntity[]> {
    return jobRepository.listAdmin(tenantId);
  },

  async getActiveJobs(tenantId: string): Promise<JobEntity[]> {
    return jobRepository.listActive(tenantId);
  },

  async getJobById(
    email: string,
    jobId: string,
  ): Promise<
    (Omit<JobEntity, "requirements"> & { requirements: string[] }) | null
  > {
    const job = await jobRepository.getById(email, jobId);
    if (!job) return null;

    return {
      ...job,
      requirements: JSON.parse(job.requirements || "[]") as string[],
    };
  },
};
