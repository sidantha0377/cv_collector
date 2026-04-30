import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { jobRepository } from "@/lib/azure/repositories";

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID ?? "default";

export async function GET() {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const jobs = await jobRepository.listActive(DEFAULT_TENANT_ID);
  return NextResponse.json(jobs);
}
