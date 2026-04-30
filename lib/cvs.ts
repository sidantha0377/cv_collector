import { TableClient } from "@azure/data-tables";
import { BlobServiceClient } from "@azure/storage-blob";

export interface CV {
  id: string;
  userId: string;
  fileName: string;
  url: string;
  uploadedAt: string;
}

const tableClient = TableClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!,
  "cvs",
);

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!,
);

const containerClient = blobServiceClient.getContainerClient("cv-uploads");

export async function getCVsByCandidate(userId: string): Promise<CV[]> {
  const cvs: CV[] = [];

  const entities = tableClient.listEntities({
    queryOptions: { filter: `PartitionKey eq '${userId}'` },
  });

  for await (const entity of entities) {
    cvs.push({
      id: entity.rowKey as string,
      userId: entity.partitionKey as string,
      fileName: entity.fileName as string,
      url: entity.url as string,
      uploadedAt: entity.uploadedAt as string,
    });
  }

  return cvs.sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );
}
