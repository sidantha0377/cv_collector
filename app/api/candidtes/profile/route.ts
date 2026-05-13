import { NextRequest, NextResponse } from "next/server";
import { candidateService } from "@/lib/service/candidate/candidate-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const tenantId = String(body?.tenantId ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const enotify = Boolean(body?.enotify);
    const ftags = Array.isArray(body?.ftags) ? body.ftags : [];

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId is required" },
        { status: 400 },
      );
    }
    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const created = await candidateService.createProfile(
      tenantId,
      email,
      enotify,
      ftags,
    );

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Failed to create profile";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
