"use server";

import { BlobServiceClient } from "@azure/storage-blob";
import { cvRepository } from "@/lib/azure/repositories";
import { requireSession } from "@/lib/session";
import type { CvEntity } from "@/lib/types/azure-tables";
import { extractPdfText } from "./pdf-to-txt";

function getContainerClient() {
  const blobService = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING!,
  );
  return blobService.getContainerClient("cv-uploads");
}

export async function uploadCV(formData: FormData): Promise<CvEntity> {
  const session = await requireSession();

  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file provided");
  if (file.type !== "application/pdf")
    throw new Error("Only PDF files are allowed");
  if (file.size > 5 * 1024 * 1024) throw new Error("File exceeds 5MB limit");

  const blobName = `${session.rowKey}/${Date.now()}-${file.name}`;
  const container = getContainerClient();
  const blockBlob = container.getBlockBlobClient(blobName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileData = await extractPdfText(buffer);

  await blockBlob.uploadData(arrayBuffer, {
    blobHTTPHeaders: { blobContentType: "application/pdf" },
  });

  return cvRepository.create(
    session.email,
    file.name,
    blobName,
    blockBlob.url,
    fileData.text,
  );
}

export async function deleteCV(cvId: string): Promise<void> {
  const session = await requireSession();

  const cv = await cvRepository.getById(session.email, cvId);
  if (!cv) throw new Error("CV not found");

  // Delete from blob storage first
  const container = getContainerClient();
  await container.getBlockBlobClient(cv.blobName).deleteIfExists();

  // Then remove metadata from table storage
  await cvRepository.delete(session.email, cvId);
}
