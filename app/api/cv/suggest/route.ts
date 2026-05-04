import { NextRequest, NextResponse } from "next/server";
import sugesstCv from "@/lib/actions/cvSuggest";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, jobId, cvIds } = body;
    console.log("POST data received:", body);
    const response = await sugesstCv({ userId, jobId, cvIds });

    return NextResponse.json(
      { success: true, data: response },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
