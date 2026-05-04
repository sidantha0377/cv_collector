import { NextRequest, NextResponse } from "next/server";
import { cvRepository } from "@/lib/azure/repositories";
import { getSession } from "@/lib/auth/session";
import { generateSasUrl } from "@/lib/azure/blob-client";

export async function GET(
  _req: NextRequest,
  { params }: { params: { cvId: string } },
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { cvId } = await params;
  const cv = await cvRepository.getById(session.email, cvId);
  if (!cv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Generate a 30-minute signed URL
  const sasUrl = generateSasUrl(cv.blobName);

  // Redirect browser directly to the signed blob URL
  return NextResponse.redirect(sasUrl);
}
