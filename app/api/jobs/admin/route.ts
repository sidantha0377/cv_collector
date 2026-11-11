import { NextRequest, NextResponse } from "next/server";
import { jobService } from "@/lib/service/jobs/job-service";
import type { JobEntity } from "@/lib/types/azure-tables";
import { getSession } from "@/lib/auth/session";

type CreateJobBody = {
  tenantId: string;
  adminId: string;
  title: string;
  company: string;
  location: string;
  type: JobEntity["type"];
  description: string;
  requirements: string[];
  tags: string[];
  closingAt?: string;
  notify: boolean;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateJobBody;

    // Basic validation
    const requiredFields: Array<keyof CreateJobBody> = [
      "tenantId",
      "adminId",
      "title",
      "company",
      "location",
      "type",
      "description",
      "requirements",
      "tags",
      "notify",
    ];

    for (const field of requiredFields) {
      if (
        body[field] === undefined ||
        body[field] === null ||
        (typeof body[field] === "string" && !String(body[field]).trim())
      ) {
        return NextResponse.json(
          { error: `Missing or invalid field: ${field}` },
          { status: 400 },
        );
      }
    }

    if (!Array.isArray(body.requirements) || !Array.isArray(body.tags)) {
      return NextResponse.json(
        { error: "`requirements` and `tags` must be arrays" },
        { status: 400 },
      );
    }

    const createdJob = await jobService.createJob(body.tenantId, body.adminId, {
      title: body.title,
      company: body.company,
      location: body.location,
      type: body.type,
      description: body.description,
      requirements: body.requirements,
      tags: body.tags,
      closingAt: body.closingAt,
      notify: body.notify,
    });

    return NextResponse.json(createdJob, { status: 201 });
  } catch (error) {
    console.error("Create job failed:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // //await requireAdmin();
    // const session = await getSession();
    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    // // adjust based on your auth library shape
    //console.log(req);
    const email = req.nextUrl.searchParams.get("email");
    //console.log("api/job/admin email ;", email);
    if (!email) {
      return NextResponse.json(
        { error: "Missing email query param" },
        { status: 400 },
      );
    }

    const jobs = await jobService.getAllJobsForAdmin(email);
    return NextResponse.json(jobs, { status: 200 });
  } catch (error) {
    console.error("Get jobs failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 },
    );
  }
}
