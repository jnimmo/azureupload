import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import {
  experimental_taintObjectReference,
  experimental_taintUniqueValue,
} from "react";
import "server-only";

export async function getAuthenticatedBlobStorageClient(): Promise<BlobServiceClient | null> {
  const storageAccountName = process.env.NEXT_PUBLIC_STORAGE_ACCOUNT;
  const secretAccountKey = process.env.SECRET_ACCESS_KEY;

  // Corrected error message
  if (!storageAccountName || !secretAccountKey) {
    console.error("Error: Missing storage account name or secret access key.");
    return null;
  }

  experimental_taintUniqueValue(
    "Do not pass secrets to the client",
    globalThis,
    secretAccountKey
  );

  try {
    const sharedKeyCredential = new StorageSharedKeyCredential(
      storageAccountName,
      secretAccountKey
    );
    const blobServiceClient = new BlobServiceClient(
      `https://${storageAccountName}.blob.core.windows.net`,
      sharedKeyCredential
    );

    experimental_taintObjectReference(
      "Do not pass the blob storage client to the client",
      blobServiceClient
    );

    return blobServiceClient; // Ensure that the ContainerClient object is returned here
  } catch (error) {
    console.error("Error creating container: ", error);
    return null;
  }
}
