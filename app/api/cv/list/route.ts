import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { cvRepository } from "@/lib/repositories/cvRepository";

export async function GET() {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const cvs = await cvRepository.listByUser(session.email);
  return NextResponse.json(cvs);
}
