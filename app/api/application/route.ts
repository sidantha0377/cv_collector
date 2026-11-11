import { NextRequest, NextResponse } from "next/server";
import {
  applyToJob,
  getApplicationsByCandidate,
} from "@/lib/service/applications/applications-service";

export async function GET(req: NextRequest) {
  try {
    const candidateRowKey = req.nextUrl.searchParams
      .get("candidateRowKey")
      ?.trim();

    if (!candidateRowKey) {
      return NextResponse.json(
        { error: "Missing candidateRowKey query param" },
        { status: 400 },
      );
    }

    const applications = await getApplicationsByCandidate(candidateRowKey);
    return NextResponse.json(applications, { status: 200 });
  } catch (error) {
    console.error("Get applications failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const tenantId = String(body?.tenantId ?? "").trim();
    const candidateRowKey = String(body?.candidateRowKey ?? "").trim();
    const candidateEmail = String(body?.candidateEmail ?? "")
      .trim()
      .toLowerCase();
    const jobId = String(body?.jobId ?? "").trim();
    const cvId = body?.cvId ? String(body.cvId).trim() : undefined;

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId is required" },
        { status: 400 },
      );
    }
    if (!candidateRowKey) {
      return NextResponse.json(
        { error: "candidateRowKey is required" },
        { status: 400 },
      );
    }
    if (!candidateEmail) {
      return NextResponse.json(
        { error: "candidateEmail is required" },
        { status: 400 },
      );
    }
    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const created = await applyToJob({
      tenantId,
      candidateRowKey,
      candidateEmail,
      jobId,
      cvId,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to apply";
    console.log(message);
    const status =
      message === "Already applied for this job"
        ? 409
        : message === "Job not found"
          ? 404
          : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
