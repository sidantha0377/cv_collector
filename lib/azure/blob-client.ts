import {
  BlobServiceClient,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

const ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
const CONTAINER = "cv-uploads";

export function getContainerClient() {
  const blobService = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING!,
  );
  return blobService.getContainerClient(CONTAINER);
}

// Generates a temporary signed URL valid for N minutes
export function generateSasUrl(blobName: string, expiryMinutes = 30): string {
  const credential = new StorageSharedKeyCredential(ACCOUNT_NAME, ACCOUNT_KEY);

  const expiresOn = new Date();
  expiresOn.setMinutes(expiresOn.getMinutes() + expiryMinutes);

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName: CONTAINER,
      blobName,
      permissions: BlobSASPermissions.parse("r"), // read-only
      expiresOn,
    },
    credential,
  ).toString();

  return `https://${ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER}/${blobName}?${sasToken}`;
}
