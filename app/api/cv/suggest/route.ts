import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("POST data received:", body);

    return NextResponse.json(
      { success: true, received: body },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
