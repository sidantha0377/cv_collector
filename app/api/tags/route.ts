import { NextRequest, NextResponse } from "next/server";
import { tagService } from "@/lib/service/tags/tag-service";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get("tenantId")?.trim();

    if (!tenantId) {
      return NextResponse.json(
        { error: "Missing tenantId query param" },
        { status: 400 },
      );
    }

    const tags = await tagService.getAlltage();
    return NextResponse.json(tags, { status: 200 });
  } catch (error) {
    console.error("Get tags failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tenantId = String(body?.tenantId ?? "").trim();
    const tag = String(body?.tag ?? "").trim();

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId is required" },
        { status: 400 },
      );
    }
    if (!tag) {
      return NextResponse.json({ error: "tag is required" }, { status: 400 });
    }

    const createdOrUpdated = await tagService.createTag(tenantId, tag);
    return NextResponse.json(createdOrUpdated, { status: 201 });
  } catch (error) {
    console.error("Create tag failed:", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get("tenantId")?.trim();
    const tag = req.nextUrl.searchParams.get("tag")?.trim();

    if (!tenantId) {
      return NextResponse.json(
        { error: "Missing tenantId query param" },
        { status: 400 },
      );
    }
    if (!tag) {
      return NextResponse.json(
        { error: "Missing tag query param" },
        { status: 400 },
      );
    }

    await tagService.deleteTag(tenantId, tag);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Delete tag failed:", error);
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 },
    );
  }
}
