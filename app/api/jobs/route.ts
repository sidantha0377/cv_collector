import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { jobService } from "@/lib/service/jobs/job-service";

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID ?? "default";

export async function GET() {
  // const session = await getSession();
  // if (!session)
  //   return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const jobs = await jobService.getActiveJobs(DEFAULT_TENANT_ID);
  return NextResponse.json(jobs);
}
