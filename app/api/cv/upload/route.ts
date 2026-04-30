// import { NextRequest, NextResponse } from "next/server";
// import { getContainerClient } from "@/lib/azure/blob-client";
// import { cvRepository } from "@/lib/azure/repositories";
// import { getSession } from "@/lib/session";

// export async function POST(req: NextRequest) {
//   const session = await getSession();
//   if (!session)
//     return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

//   console.log("[upload] session.email:", session.email);
//   const formData = await req.formData();
//   const file = formData.get("file") as File | null;

//   if (!file)
//     return NextResponse.json({ error: "No file provided" }, { status: 400 });
//   if (file.type !== "application/pdf")
//     return NextResponse.json(
//       { error: "Only PDF files are allowed" },
//       { status: 400 },
//     );
//   if (file.size > 5 * 1024 * 1024)
//     return NextResponse.json(
//       { error: "File exceeds 5MB limit" },
//       { status: 400 },
//     );

//   const blobName = `${session.email}/${Date.now()}-${file.name}`;
//   const container = getContainerClient();
//   const blockBlob = container.getBlockBlobClient(blobName);

//   await blockBlob.uploadData(await file.arrayBuffer(), {
//     blobHTTPHeaders: { blobContentType: "application/pdf" },
//   });

//   // Store blobName as URL — we'll generate SAS on demand
//   const cv = await cvRepository.create(
//     session.email,
//     file.name,
//     blobName,
//     blobName, // ← store blobName in url field, not the direct blob URL
//   );

//   return NextResponse.json(cv, { status: 201 });
// }
