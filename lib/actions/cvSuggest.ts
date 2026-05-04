import { cvRepository } from "@/lib/repositories/cvRepository";
import { jobRepository } from "@/lib/repositories/jobRepository";

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID ?? "default";

export async function sugesstCv({
  userId,
  jobId,
  cvIds,
}: {
  userId: string;
  jobId: string;
  cvIds: string[];
}) {
  const job = await jobRepository.getById(DEFAULT_TENANT_ID, jobId);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }
  const jobdiscription: { jobdiscription: string; jobKeyWord: string } = {
    jobdiscription: job.description,
    jobKeyWord: job.requirements,
  };
  const cvContents: { cvId: string; content: string }[] = [];

  for (const cvId of cvIds) {
    const cv = await cvRepository.getById(userId, cvId);
    if (cv) {
      cvContents.push({
        cvId: cv.rowKey,
        content: cv.content,
      });
    }
  }

  if (cvContents.length === 0) {
    throw new Error("No valid CVs found for the provided IDs");
  }
  console.log("job details: ", jobdiscription);
  console.log("cv data", cvContents);
}
