import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { jobRepository } from "@/lib/repositories/jobRepository";
import { applicationRepository } from "@/lib/repositories/applicationRepository";
import { cvRepository } from "@/lib/repositories/cvRepository";

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID ?? "default";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  if (session.role !== "candidate")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { jobId, cvId } = await req.json();
  if (!jobId)
    return NextResponse.json({ error: "jobId is required" }, { status: 400 });

  // Verify job exists and is active
  const job = await jobRepository.getById(DEFAULT_TENANT_ID, jobId);
  if (!job || !job.isActive) {
    return NextResponse.json(
      { error: "Job not found or no longer active" },
      { status: 404 },
    );
  }

  // Verify CV belongs to this candidate (if provided)
  if (cvId) {
    const cv = await cvRepository.getById(session.rowKey, cvId);
    if (!cv)
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
  }

  const application = await applicationRepository.create(
    session.rowKey,
    session.email,
    jobId,
    job.title,
    job.company,
    cvId,
  );

  return NextResponse.json(application, { status: 201 });
}
